---
title: almide-lander
tags: [almide, cli, ffi, wasm, codegen]
---

[[almide|Almide]] モジュールを 21 言語のネイティブパッケージ + WASM/npm にエクスポートする CLI。`--target native|wasm` で [[almide-bindgen]] / [[almide-wasm-bindgen]] にディスパッチする。

## 役割

```
almide-bindgen          Native FFI (cdylib + byte-buffer, 21言語)         ← library
almide-wasm-bindgen     WASM target (linear memory, JS/TS, npm)           ← library
almide-lander           CLI orchestrator (これ)                            ← CLI
```

3 リポジトリ構成は Rust の `wasm-bindgen` が汎用 FFI ツールから分離されているのと同じ理由。target model（cdylib vs WASM linear memory）と consumption model（C ABI vs npm/browser）が根本的に違う。

## CLI

```bash
# Native FFI (cdylib + byte-buffer)
almide run src/main.almd -- --lang python mylib.almd
almide run src/main.almd -- --lang python,go,swift mylib.almd
almide run src/main.almd -- --list                          # 21 言語の一覧
almide run src/main.almd -- --dry-run --lang ruby mylib.almd

# WebAssembly + JS/TS (npm-publishable)
almide run src/main.almd -- --target wasm --outdir dist mylib.almd
almide run src/main.almd -- --target wasm --outdir dist --pkg-version 1.0.0 mylib.almd
almide run src/main.almd -- --target wasm --outdir dist --publish mylib.almd
```

`--target wasm` は `<mod>.wasm` / `<mod>.js` (ESM glue) / `<mod>.d.ts` / `<mod>.wit` (Component Model) / `package.json` を `dist/` に生成。`cd dist && npm publish` でそのまま公開可能。

## 対応 21 言語

Python / Go / Ruby / Swift / C# / Dart / Kotlin / Java / C++ / Rust / JavaScript / C / Zig / Nim / Scala3 / Julia / Elixir / PHP / Lua / PowerShell（+ WASM 経由で TypeScript）。

## 設計

ランタイム / VM なし。Almide はビルド時に消え、shared library か Wasm + ESM + TS パッケージだけが残る。すべて Almide で書かれており、Python など外部ツール依存ゼロ。

## 関連

- [[almide-bindgen]] — native FFI generator (cdylib + byte buffer)
- [[almide-wasm-bindgen]] — WASM + JS/TS generator
- [[almide-js]] — JS/TS 向け progress + ベンチマーク
- [[almide]] — 言語本体

## Links

- [GitHub](https://github.com/almide/almide-lander)
