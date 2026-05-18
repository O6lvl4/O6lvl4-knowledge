---
title: bonsai-almide
tags: [almide, llm, wasm]
---

1-bit 量子化 LLM（Bonsai 1.7B）を [[almide|Almide]] + WASM でブラウザ実行するデモ。

## スペック

- **モデル**: Qwen3-1.7B, Q1_0（248 MB, 1.125 bit/weight）
- **ネイティブ**: M1 で 0.725 tok/s
- **WASM ブラウザ**: scalar f64 で 0.67 tok/s（WebGPU 比 76x 遅い、SIMD/WebGPU は今後対応）

## 機能

- KV キャッシュストリーミング
- Qwen3 チャットテンプレート
- temperature / top-k / 繰り返しペナルティ
- IndexedDB モデルキャッシュ
