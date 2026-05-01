---
title: gv
tags: [rust, golang, toolchain-manager, cli]
---

Go のバージョン & ツールチェインマネージャ。uv 級の速度、シングルバイナリ、再現性。

## Core Idea

`gv` は Go にとっての `uv` — Rust 製の単一バイナリがツールチェイン・プロジェクトツール・再現可能インストールを所有する。シェルアクティベーションのオーバーヘッドや shell 汚染なし。

## Why gv

- **`go.mod` の `toolchain` 行を一級のソースとして読む。** 既存マネージャは無視する。`gv` はこれを正典化する。移行コストゼロ
- **`go install` をグローバルツールで置き換え。** `gopls`, `golangci-lint`, `dlv`, `mockgen`, `sqlc` を `gv.toml` でピン、`gv.lock` でロック、CI で再現
- **Content-addressed store。** SDK とツールを sha256 でプロジェクト間 dedup（pnpm/uv 方式）
- **シェルアクティベーション不要。** IDE 互換性のためのオプショナル 1ms `execve` shim
- **並列ダウンロード・並列展開。** Tokio + reqwest + rustls。OpenSSL なし
- **`GOTOOLCHAIN=local` 強制。** Go ランタイムからの不意なダウンロードを禁止

## Resolution order

1. `GV_VERSION` env var
2. `go.mod` の `toolchain` 行（CWD から上方探索）
3. `.go-version`（CWD から上方探索）
4. `~/.config/gv/global`
5. 最新インストール

`gv current` は選択バージョンと理由の両方を出力する。

## Quickstart

```bash
gv add 1.25.0                      # add toolchain (writes go.mod toolchain line)
gv add tool gopls                  # pin a tool
gv add tool golangci-lint@v1.64    # version-pinned tool
gv sync                            # reconcile installs with gv.lock
gv run go test ./...               # run with the resolved toolchain
gv run gopls                       # tools work the same way
gv tree                            # visualize resolution
gv current                         # explain why this version is active
gv doctor                          # health check
```

## ツールピン解決の核心

`gv add tool gopls` 実行時:

- `proxy.golang.org` で解決
- `sum.golang.org`（Go canonical checksum DB）からディレクトリハッシュ取得
- 解決されたツールチェインでビルド
- `gv.lock` に全記録

`gv sync --frozen` は CI 用 — lock を変更せず、`gv.toml` が `gv.lock` より進んでいたら失敗。

## Architecture

- `gv-core` — マニフェスト、ロック、解決、レジストリクライアント
- `gv-cli` — argv[0] dispatch (`gv` vs `gvx`)、コマンド surface
- `gv-shim` — 400KB の execve dispatcher（IDE 互換用）
- 基盤: [[anyv-core]]（paths, extract, sha verification, presentation, self-update）

## Distribution

- `install.sh` / `install.ps1` — GitHub Release から自動取得
- Homebrew tap: `O6lvl4/tap/gv`（[[homebrew-tap]] 経由、リリースで自動 bump）
- `cargo install --git`

## Links

- [GitHub](https://github.com/O6lvl4/gv)
