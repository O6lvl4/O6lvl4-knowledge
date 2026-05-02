---
title: almide-lander
tags: [almide, cli, ffi, wasm, codegen]
---

[[almide|Almide]] モジュールを 21 言語のネイティブパッケージ + WASM/npm にエクスポートする CLI。`--target native|wasm` で [[almide-bindgen]] / [[almide-wasm-bindgen]] にディスパッチする。

## 何ができる？

Almide で書いたプログラムを「行き先に応じて発射する打ち上げ台」です。一つのコマンドを打つだけで、Python や Java など 20 言語向けの部品にも、ウェブブラウザ向けの部品にも、自由に「打ち上げ」られます。

行き先が違うと飛ばし方も違います。地上で動く部品（普通のパソコン用ライブラリ）と、空中（ブラウザ）で動く部品では、構造もパッケージの形も別物です。この発射台は「行き先」を聞いて、適切な専門チームへ仕事を振り分けてくれるので、利用者は細かい違いを気にしなくて済みます。

「Python 用に出して」「ウェブ用に出して」と言うだけで、配布できる完成品が手に入ります。

## 用語

- **CLI (コマンドラインインタフェース)**: 黒い画面に文字でコマンドを打って動かす操作方法。
- **ネイティブ (native)**: そのパソコンの上で直接動く形式。ブラウザを介さない。
- **WASM (WebAssembly)**: ブラウザの中で動く、超高速な共通プログラム形式。
- **target**: 「どこに向けて出力するか」の行き先指定。`--target wasm` のように指定する。
- **dispatch (ディスパッチ)**: 受け取った仕事を適切な担当者に振り分けること。受付係のような役割。
- **orchestrator (オーケストレーター)**: 複数のツールを指揮者のように取りまとめて動かす役。
- **scaffolding (足場)**: 自動生成されるサポートコード。本体実装を支える土台。
- **shared library (共有ライブラリ)**: 複数のプログラムから共同で使える「部品ファイル」。
- **npm**: JavaScript の部品を世界中に配るサービス。`--publish` でここに自動公開できる。
- **ランタイム / VM**: プログラムを動かすために裏で必要な環境。Almide はこれを必要とせず、ビルドが終わると Almide 自体が消える設計。
- **dry-run**: 「実際には実行せず、何が起きるか確認するだけ」のモード。手順の事前確認用。

## 仕組み

```mermaid
flowchart TD
  A["mylib.almd<br/>Almide ソース"] --> B[almide-lander CLI]
  B --> C{--target は？}
  C -->|native| D[almide-bindgen 呼び出し]
  C -->|wasm| E[almide-wasm-bindgen 呼び出し]
  D --> F["共有ライブラリ<br/>+ 20 言語のラッパー"]
  E --> G[".wasm + .js + .d.ts<br/>+ npm パッケージ"]
  G -.--publish.-> H[npm に公開]
```

CLI に `--target` を伝えると、適切な専門ツールに仕事が振り分けられます。最後に出てくるのは「そのまま配れる完成品」です。

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
