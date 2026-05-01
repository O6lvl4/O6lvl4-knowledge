---
title: anyv-core
tags: [rust, toolchain-manager, library, substrate]
---

`*v` 系ツールチェインマネージャ（[[gv]]、[[rv]] など）の共通基盤 crate。言語非依存な配管部分を肩代わりする。

## Core Idea

「汎用 VM フレームワーク」ではない。trait ベースのバックエンド抽象は持たない。Gemfile vs `go.mod`、`ruby-build` vs `go.dev`、`rubygems.org` vs `sum.golang.org` のような言語固有のセマンティクスは各 `*v-core` に残す。anyv-core は「どの言語でも同じになる箇所」だけを持つ。

依存することで ~500 行のボイラプレートを削減し、`gv`/`rv` で機能している慣習を継承できる。

## What you get

| Module | 提供物 |
|---|---|
| `paths` | `<APP>_HOME` 上書き対応の XDG レイアウト (`GV_HOME`, `RV_HOME` …) |
| `presentation` | スピナー、ANSI色、`humanize_bytes`、`format_duration_ms`、`plural`、`quote_sh`/`quote_ps`、`set_quiet` + `say!` マクロ |
| `extract` | `extract_archive(p, dest)` — `.tar.gz` / `.zip` 自動判定 |
| `fs` | `dir_size`（symlink 二重カウントしない）、`walk_files` |
| `argv0` | `rewrite_for_x_dispatch("foo")` — `foox` シムトリック (`gvx` / `rvx`) |
| `target` | `target_triple()` — self-update 用の Rust target 検出 |
| `selfupdate` | `SelfUpdate { repo, bin_name, current_version }.run(...)` — GitHub Release 取得 + sha256 検証 + 原子的バイナリ置換 |

## What stays in your `*v-core`

- ツールチェインインストーラ（go.dev tarball / `ruby-build` / `python-build-standalone` / `nodejs.org` …）
- パッケージレジストリクライアント（`sum.golang.org` / `rubygems.org` / `pypi.org` / npm registry）
- マニフェストリーダ（`go.mod`, `Gemfile`, `pyproject.toml`, `package.json` engines）
- 解決連鎖（env → manifest → file → global → latest の順序は普遍だが、ファイル名とパーサは異なる）
- ロックファイル schema（`gv.lock` のモジュールハッシュ vs `rv.lock` の gem チェックサム）

## 継承される慣習

依存することで自然に揃うインターフェース:

1. サブコマンドレイアウト: `install`, `list`, `current`, `which`, `use-global`, `run`, `add tool`, `tool {list, registry, add, remove}`, `sync (--frozen)`, `init`, `tree`, `outdated`, `upgrade`, `lock`, `cache {info, prune}`, `dir`, `uninstall`, `env`, `self-update`, `completions`, `doctor`, `x` (with `<app>x` shim)
2. プロジェクトファイル: `<app>.toml` ルート、`[<lang>]` でツールチェインバージョン、`[tools]` でユーティリティピン
3. ロックファイル: `<app>.lock`、`--frozen` でネットワーク解決禁止
4. 解決順序: env var → 言語マニフェスト → ツール固有バージョンファイル → ユーザグローバル → 最新インストール
5. 出力規約: `✓` 完了、`+` 新規、`~` 変更、`=` 不変、`-` 削除

## SelfUpdate 期待形式

```
https://github.com/<repo>/releases/download/<tag>/<bin_name>-<tag>-<triple>.tar.gz
```

兄弟 `.sha256` 必須。Atomic-replace は unix では inode をまたぐ rename、Windows では rename-aside-then-move で実行中バイナリ問題に対処。

## リファレンス実装

- [[gv]] — Go (`go.mod`、`go.dev`、`proxy.golang.org` + `sum.golang.org`)
- [[rv]] — Ruby (`Gemfile` / `.ruby-version`、`ruby-build`、`rubygems.org`)
- [[qusp]] — multi-language（gv-core/rv-core を Cargo lib として直接利用）

## Versioning

Semver。0.x では minor で破壊的変更。tag でピン:

```toml
anyv-core = { git = "https://github.com/O6lvl4/anyv-core", tag = "v0.1.0" }
```

## Links

- [GitHub](https://github.com/O6lvl4/anyv-core)
