---
title: bonsai-almide
tags: [almide, llm, wasm]
created_at: 2026-05-01
updated_at: 2026-05-19
---

1-bit 量子化 LLM（Bonsai 1.7B）を [[almide|Almide]] + WASM でブラウザ実行するデモ。

## 何がすごいか

LLM は通常サーバー上の GPU で実行するが、bonsai-almide はモデルのウェイトを極限まで圧縮（1-bit 量子化）し、ブラウザの WASM 上で推論を完結させる。サーバー不要で、プライバシーが保たれ、オフラインでも動く。

## 1-bit 量子化とは

通常のモデルは各パラメータを 16-bit や 32-bit の浮動小数点数で保持する。1-bit 量子化はこれを 1.125 bit/weight まで圧縮する。品質は下がるが、モデルサイズが劇的に小さくなり（1.7B パラメータで 248 MB）、CPU だけで推論できるようになる。

## スペック

| 環境 | 速度 |
|---|---|
| ネイティブ (M1) | 0.725 tok/s |
| WASM ブラウザ (scalar f64) | 0.67 tok/s |

WebGPU 比では 76x 遅いが、これは CPU スカラー計算のため。SIMD / WebGPU 対応は今後のロードマップ。

## 機能

- KV キャッシュストリーミング（長い会話でもメモリ効率を保つ）
- Qwen3 チャットテンプレート
- temperature / top-k / 繰り返しペナルティによるサンプリング制御
- IndexedDB モデルキャッシュ（再ダウンロード不要）

## 関連

- [[almide-nn|nn]] — 推論の低レベルビルディングブロック
- [[almide|Almide]] — 言語本体
