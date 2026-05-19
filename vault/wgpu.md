---
title: wgpu
tags: [graphics, gpu, rust, wasm]
---

Rust 製の [[webgpu|WebGPU]] 実装。ブラウザ外でも動く。

## 特徴

- ブラウザでは WebGPU API を使い、ネイティブでは各 OS のグラフィックス API に変換する
- バックエンド: [[vulkan|Vulkan]]、[[metal|Metal]]、[[directx|DirectX]] 12、OpenGL ES
- Rust のメモリ安全性を活かした GPU プログラミング

## アーキテクチャ

```
wgpu (WebGPU API)
  ├── Vulkan  (Linux, Windows, Android)
  ├── Metal   (macOS, iOS)
  ├── DX12    (Windows)
  └── GL ES   (フォールバック)
```

## 用途

- ゲームエンジン（Bevy）
- GUI フレームワーク
- 科学計算・機械学習
- [[snaidhm]] — Almide のレンダラが wgpu をネイティブバックエンドとして使用

## 関連

- [[webgpu|WebGPU]] — wgpu が実装する API 仕様
- [[gpu|GPU]]
