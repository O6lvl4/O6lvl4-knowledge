---
title: almide/nn
tags: [almide, ml, transformer, whisper, signal-processing]
---

[[almide|Almide]] で書かれた Transformer + 信号処理ライブラリ。`matrix` stdlib の上に構築される。Whisper tiny のエンドツーエンド推論が native + WASM で動作する。

## ステータス

Preview。Almide の matrix runtime work（f32/f64 path、cblas dispatch）の駆動 / 検証用としても利用される。

## モジュール構成 (`src/`)

| File | Purpose |
|---|---|
| `tensor.almd` | Tensor load helpers (GGML f16/f32/f64 decoders) |
| `gguf.almd` / `ggml_whisper.almd` / `whisper_loader.almd` | GGUF/GGML weight loaders for Whisper |
| `mel.almd` / `wav.almd` / `fft.almd` | Audio preprocessing: WAV decode, mel spectrogram, FFT |
| `activations.almd` | gelu / softmax / layer_norm |
| `attention.almd` | Single / multi-head attention, masked variants |
| `transformer.almd` | Encoder / decoder block (residual, LN, MLP, attention) |
| `generate.almd` | Autoregressive decode loop |
| `whisper.almd` | Full Whisper encoder+decoder pipeline |
| `tokenizer.almd` | BPE tokenizer |

## ベンチマーク (`examples/`)

3²…1024² の matmul throughput、f32 path、fused `α·A·B`、chained linear、MLP `gelu(X@W1+b1) @ W2+b2`、attention block (LN+QKV+softmax+out)、Whisper encoder block end-to-end、per-op dispatch profiling。NumPy f32/f64 と head-to-head 比較。

ブラウザデモ: `examples/browser_demo/` で WASM + 自前 WASI shim を経由して Whisper が動作。

## Running

```bash
almide build src/whisper.almd -o whisper                          # native
almide build src/whisper.almd -o whisper.wasm --target wasm        # WASM
almide run examples/_bench_attn_f32.almd
almide test
```

## 関連

- [[almide]] — compiler + matrix stdlib
- [[bonsai-almide]] — 同じく Almide で動かす 1-bit LLM (姉妹プロジェクト)

## Links

- [GitHub](https://github.com/almide/nn)
