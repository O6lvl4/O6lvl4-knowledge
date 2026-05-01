---
title: Almide Playground
tags: [almide, playground, wasm, browser]
---

[[almide|Almide]] のオンラインプレイグラウンド。ブラウザだけで `.almd` をコンパイル・実行する。サーバ不要。

## Architecture

Almide コンパイラ（Rust）を `wasm-pack` で WASM 化し、ブラウザに丸ごと載せる。ユーザコードもまた WASM として吐き出され、`WebAssembly.instantiate()` + `browser_wasi_shim` で実行される。

```
.almd source
  → Almide Compiler (WASM)
      parse → check → lower → mono → codegen(Target::Wasm)
  → user program (WASM binary)
  → WebAssembly.instantiate() + browser_wasi_shim
  → stdout/stderr → output panel
```

## Compilation Pipeline

1. **Parse** — lexer + recursive descent parser
2. **Check** — Hindley-Milner with unification
3. **Lower** — AST → typed IR
4. **Mono** — row-polymorphic な関数を monomorphize
5. **Codegen** — Nanopass パイプラインで WASM
6. **Execute** — WASI 経由で `_start()`

## WASI で使える機能

- stdout/stderr (`println`, `eprintln`)
- Clock (`datetime.now()` がブラウザの実時刻)
- Random (`crypto.getRandomValues` バックエンド)

## ブラウザ制約

- `fs.*` 不可（WASI スタブが err を返す）
- `env.args()` / `process.exec()` 不可
- `http.*` 不可

## wasm-bindgen エクスポート

`crate/src/lib.rs` から以下を公開：

- `compile_to_wasm(source)` → WASM binary
- `compile_to_ts(source)` → TypeScript
- `compile_to_rust(source)` → Rust
- `parse_to_ast(source)` → JSON AST
- `get_version_info()` → version string

## 構造

```
crate/
  Cargo.toml      almide を git main から依存
  build.rs        Cargo.lock から version/commit 抽出
  src/lib.rs      wasm-bindgen exports
web/
  index.html      single-file app（editor / output / compiled view）
  pkg/            wasm-pack 出力（自動生成）
```

## Auto-deploy Pipeline

```
almide/almide: push to main
  → CI: trigger-playground job
  → "compiler-updated" イベントを almide/playground に dispatch
  → playground CI: cargo update almide → wasm-pack build → GH Pages
```

コンパイラリリースのたびに playground も自動更新される。

## Features

- **Instant compilation** — サーバ往復ゼロ
- **Native WASM execution** — ユーザプログラムが本当に WASM で動く
- **Compiled view** — 生成された Rust / TypeScript を確認できる
- **AST view** — パース後の AST を JSON で表示
- **AI code generation** — Claude / OpenAI / Gemini API を BYOK でクライアントから直接叩く

## 関連

- [[almide]] — 言語本体、コンパイラを WASM 化して載せている
- [[obsid]] — グラフィクス向け WASM 実行系（別系統）
- [[porta]] — 別の WASM 実行ホスト（CLI / MCP 用途）

## Links

- [GitHub](https://github.com/almide/playground)
- [Live](https://almide.github.io/playground/)
