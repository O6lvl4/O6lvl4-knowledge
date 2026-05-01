---
title: rv
tags: [rust, ruby, toolchain-manager, cli]
---

Ruby のバージョン & gem マネージャ。uv 級の速度、シングルバイナリ、再現性。

## Core Idea

`rv` は Ruby にとっての `uv` / [[gv]] — Rust 製の単一バイナリがインタプリタインストール・gem ピン・再現可能実行を所有する。shell-activation オーバーヘッドや lock-format の散乱なし。

## Why rv

- **`.ruby-version` と `Gemfile` の `ruby "..."` 行を一級の解決ソースとして読む。** 既存リポジトリは移行ゼロで動く
- **`gem install` をツールで置き換え。** `rubocop`, `brakeman`, `steep`, `sorbet` を `rv.toml` でピン、`rv.lock` でロック、CI で再現
- **Content-addressed store。** Ruby ビルドを sha256 でプロジェクト間 dedup（マシン毎 200MB の rbenv cellars 卒業）
- **サブミリ秒 shim。** `eval rv init` シェルフック不要
- **Tokio + rustls。** OpenSSL システム依存なし

## Resolution order

1. `RV_VERSION` env var
2. `Gemfile` の `ruby "..."` ディレクティブ
3. `.ruby-version`
4. `~/.config/rv/global`
5. 最新インストール

## Quickstart

```bash
rv install 3.3.5                 # install Ruby (shells out to ruby-build)
rv list                          # local installs
rv use-global 3.3.5              # set the default
rv add tool rubocop              # pin a global gem
rv sync --frozen                 # CI: install exactly what rv.lock says
rv tree                          # show what resolves and why
rvx rubocop --version            # ephemeral, no project state touched
```

## Prerequisites

- `ruby-build` が `$PATH` にあること（`brew install ruby-build`）。rv は source compile のためにこれに shell-out する。将来的には in-process build を予定

## Architecture

- `rv-core` — マニフェスト、ロック、解決、gem レジストリクライアント
- `rv-cli` — argv[0] dispatch (`rv` vs `rvx`)
- 基盤: [[anyv-core]]（paths, extract, sha verification, presentation, self-update）

## Status

Pre-alpha。Active development。

## Links

- [GitHub](https://github.com/O6lvl4/rv)
