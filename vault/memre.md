---
title: MemRE
tags: [macos, native, go, wails, ai, learning]
---

AI で flashcard を生成する spaced repetition ネイティブ macOS アプリ。Wails3 + Go + SQLite、15 MB の `.app` バンドル、Electron なし。

## Core Idea

- **Spaced repetition** — SM-2 ベースのスケジューラ + 連続 retention カーブ
- **Multi-provider AI** — Ollama (Gemma 4) / Anthropic API (Claude Sonnet) / Claude Code CLI / 決定論的 stub の 4 段階フォールバック
- **Per-call provider override** — 1 回の生成だけ Sonnet を pin、デフォルトは変更しない
- **Hot-reload settings** — provider 切替や API key 貼り付けに再起動不要
- **Knowledge sources** — 学習テキストを貼り付け → AI がカードを抽出（長文には FractoP-comprehensive モード）
- **Local-first** — SQLite は `~/Library/Application Support/Memre/memre.db`、API key はマシンから出ない

## AI providers

| Provider | 認証 | デフォルトモデル | コスト |
|---|---|---|---|
| Ollama | なし（local daemon） | `gemma4:26b` | 無料 |
| Anthropic API | API key | `claude-sonnet-4-6` | 従量 |
| Claude Code CLI | 既存 `claude` セッション | `claude-sonnet-4-6` | サブスク内 |
| Local stub | n/a | offline fallback | 無料、低品質 |

設定は SQLite に格納。Anthropic key は同 DB に平文だが、`api.anthropic.com` 以外には送られない。Claude Code provider は `claude` バイナリへ shell out するので認証はそちらに委譲。

## Architecture

```
internal/
├── deck/           bounded context: entity + service + repo + sqlite + Wails handler
├── card/
├── knowledge/
├── ai/             Provider port + Ollama / Anthropic / ClaudeCode / Stub + Registry
├── settings/       KV store, hot-reload backend
├── srs/            純粋 SM-2 / retention math
├── platform/
│   ├── sqlite/
│   ├── clock/
│   └── idgen/
└── composition/    composition root
```

**2026 Go DDD** スタイル: vertical slice（1 bounded context = 1 directory）、consumer-side `Repository` interface、`Service` struct + メソッド、`domain/application/infrastructure/` のディレクトリ層は持たない。テストは package 内で fake を差し替え、DI フレーム不要。

### Bounded Context 関係

| From → To | Relationship | Notes |
|---|---|---|
| `deck` ← `card` data | read model via `StatsRepository` | deck は card を import しない |
| `card` → `events` | published events | `card.Reviewed` で gamification を後付けできる |
| `card` / `deck` → `srs` | shared kernel | 純粋スケジューリング |
| `ai` → external LLMs | anti-corruption layer | Provider 抽象で外部の差を吸収 |
| every slice → `platform` | infrastructure | 各 slice が独自の `Sqlite*` adapter |
| `composition` → all | composition root | 唯一 adapter が port に出会う場所 |

## CI / Test

- Linux: pure 層の `go vet` + `go test -race -cover`、frontend の `tsc -b && vite build`
- macOS: full graph + `.app` smoke test + binary artifact upload
- ≈110 unit + integration test、`srs` 90%、`deck` 85% カバレッジ

## Release

`vX.Y.Z` の annotated tag を push → `release.yml` が `macos-latest` でビルド、ad-hoc 署名、zip 化、SHA-256 計算、GitHub Release に添付。

## Roadmap

- ストリーミング AI 応答
- Anthropic key を macOS Keychain へ移行
- Apple Developer ID 署名 + notarisation
- Universal binary + Linux / Windows
- Anki `.apkg` / CSV インポート

## Links

- [GitHub](https://github.com/O6lvl4/memre)
