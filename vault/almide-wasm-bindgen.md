---
title: almide-wasm-bindgen
tags: [almide, wasm, codegen]
created_at: 2026-05-01
updated_at: 2026-05-18
---

[[almide|Almide]] 向けの WASM + JavaScript/TypeScript バインディングジェネレータ。Almide で実装。

## 出力物

| ファイル | 内容 |
|---|---|
| `.wasm` | コンパイル済みバイナリ |
| `.js` | ESM glue コード |
| `.d.ts` | TypeScript 型定義 |
| `.wit` | Component Model 定義 |
| `package.json` | npm publish 用 |

## 性能

- Rust + wasm-bindgen 比で **7.5倍小さい** バイナリ
- 行列乗算で **1.84倍高速**（4.62ms vs 8.48ms）

## 型マッピング

Int, Float, Bool, String, List, Option, Result, Record, Variant, Tuple, Matrix, Bytes, Map, Set → TypeScript 型に自動変換。

## マルチホスト対応

Node, Bun, Deno, ブラウザ, wasmtime, wasmtime-py

## 関連

- [[almide-lander]] — 統合 CLI
- [[almide-bindgen]] — ネイティブ FFI 版
