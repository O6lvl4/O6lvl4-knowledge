---
title: nn (Almide)
tags: [almide, ai, neural-network]
created_at: 2026-05-01
updated_at: 2026-05-19
---

[[almide|Almide]] 用ニューラルネットワークプリミティブ。matrix stdlib ベースの Transformer + 信号処理ライブラリ。

## 何をするものか

LLM や音声認識モデルの推論（学習済みモデルを使って予測すること）を Almide で実行するための低レベルビルディングブロック。PyTorch や TensorFlow のような汎用フレームワークではなく、特定のアーキテクチャ（Transformer）に絞った軽量実装。

## 機能

- **テンソルローダー** — GGML 形式（f16/f32/f64）のモデルウェイトを読み込む。GGML は llama.cpp で広く使われる軽量フォーマット
- **Whisper パイプライン** — OpenAI の音声認識モデル Whisper のエンコーダ/デコーダ。GGUF/GGML ウェイトを直接ロード
- **Transformer ブロック** — マルチヘッドアテンション（入力の異なる部分に注目する仕組み）、残差接続、LayerNorm、MLP
- **デコード** — オートリグレッシブ生成（1トークンずつ予測を繰り返して文を生成）、BPE トークナイザ

## 関連

- [[bonsai-almide]] — nn を使った 1-bit LLM ブラウザ実行デモ
- [[almide|Almide]] — 言語本体
