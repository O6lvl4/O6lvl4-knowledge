---
title: almide-lander
tags: [almide, cli, codegen]
---

Almide モジュールをネイティブパッケージにエクスポートする CLI オーケストレータ。

## 使い方

```bash
# 21言語のFFIバインディング生成
almide run src/main.almd -- --lang python,go,swift mylib.almd

# npm パッケージとして WASM エクスポート
almide run src/main.almd -- --target wasm --outdir dist mylib.almd
```

## 構成

[[almide-bindgen]]（ネイティブ FFI）と [[almide-wasm-bindgen]]（WASM/JS/TS）を1つの CLI に統合。言語指定で bindgen、`--target wasm` で wasm-bindgen に振り分ける。

## 出力（WASM ターゲット）

`.wasm` + `.js`（ESM glue）+ `.d.ts`（TypeScript 型定義）+ `.wit`（Component Model）+ `package.json`

## 関連

- [[almide-bindgen]] — ネイティブ FFI 生成
- [[almide-wasm-bindgen]] — WASM/JS/TS 生成
