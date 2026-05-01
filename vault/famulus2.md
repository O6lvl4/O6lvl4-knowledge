---
title: famulus2
tags: [cli, llm, agentic-coding, developer-tools]
---

ハイブリッド AI コーディングエージェント。LLM は判断だけ、実行は決定論的に。

## Core Idea

「LLM に全部やらせる」のではなく、LLM が本当に必要な部分だけ LLM を使い、残りはプログラムが確実にやる。

```
従来: ユーザー → LLM → LLM → そのまま書き込み → 検証なし
famulus2: ユーザー → LLM(意図理解) → tree-sitter(0トークン) → LLM(コード生成) → AST Gate → テスト → 完了
```

赤（LLM処理）を最小化し、緑（決定論的処理）を最大化する。

## 3本柱

### Pillar 1: Code Graph

tree-sitter で 25 言語のコードをパースし、関数・クラス・型・依存関係を JSON 出力。LLM はソースコード全文ではなく構造情報だけ読む。

バックエンドは Rust 製の [codopsy](https://github.com/O6lvl4/codopsy)。rayon で並列処理。

**トークン削減効果:**

- 関数検索: 1,672 → 30 tokens (98%)
- インタフェース検索: 4,223 → 80 tokens (98%)
- 全 export 一覧: 14,992 → 1,445 tokens (90%)
- 合計: 25,986 → 1,597 tokens (**94% 削減**)

根拠: [Codebase-Memory (2026)](https://arxiv.org/abs/2603.27277) — 31リポジトリで評価

### Pillar 2: Test Feedback

テストコマンドをプロジェクト構成ファイル (package.json, Cargo.toml, go.mod, pyproject.toml) から自動検出。LLM がコード修正 → テスト自動実行 → 失敗ならエラーをフィードバック → 修正ループ。

根拠: [TDAD (2026)](https://arxiv.org/html/2603.17973v1) — テスト回帰 70% 削減

### Pillar 3: AST Gate

LLM が生成したコードを tree-sitter で構文チェック。壊れたコードはファイルに適用されず自動 revert。

根拠: [FORGE '26 (2026)](https://arxiv.org/abs/2601.19106) — 検出精度 90%、偽陽性ゼロ

## 出力フィルタリング

[[rtk|RTK]] に着想を得たコマンド出力フィルタ。ANSI 除去、コマンド種別判定、失敗テストのみ抽出。

## Architecture

```
src/
├── main.ts           # 指揮者
├── container.ts      # DI コンテナ
└── modules/
    ├── query-engine/  # LLM ストリーミング + ツール実行ループ
    ├── tool-runtime/  # Bash, Read/Write/Edit, Glob/Grep
    ├── code-graph/    # codopsy 連携 (CodeAnalyze/Search/Validate)
    ├── test-runner/   # テスト自動実行
    ├── compact/       # コンテキスト圧縮
    ├── memory/        # セッション記憶
    ├── permission/    # allow/ask/deny 制御
    ├── api-client/    # HTTP クライアント
    ├── cli/           # REPL インターフェース
    └── mcp/           # MCP プロトコル対応
```

~2,500 行。53 テスト、モック・スタブなし、本物のモジュールを DI で組み立て。

## 対応プロバイダ (7社)

@aid-on/unillm で統一インターフェース:

- **DeepSeek V4 Flash** — 日常使い ($0.07/M入力、最安)
- **DeepSeek V4 Pro** — コーディング (Opus 級品質で 1/20 価格)
- **Kimi K2.6** — エージェント的コーディング
- OpenAI, Anthropic, Groq, Gemini, Cloudflare

## [[claude-code|Claude Code]] との違い

- コード量: 512,000 行 vs ~2,500 行
- LLM 依存度: 全処理 vs 判断のみ
- 構文検証: なし vs AST Gate
- コード理解: LLM 丸投げ vs tree-sitter (0トークン)
- プロバイダ: Anthropic のみ vs 7社
- トークン効率: 94% 削減

## 関連

- [[rtk|RTK]] — 出力フィルタリングの着想元
- [[agentic-coding|Agentic Coding]] — famulus2 が体現するパラダイム
