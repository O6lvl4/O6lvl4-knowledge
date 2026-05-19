---
title: WebGPU
tags: [graphics, web, gpu]
---

ブラウザから[[gpu|GPU]]にアクセスするための次世代 Web 標準 API。W3C が策定。[[opengl|OpenGL]] ベースの WebGL の後継。

## WebGL との違い

| | WebGL | WebGPU |
|---|---|---|
| ベース | [[opengl\|OpenGL]] ES | [[vulkan\|Vulkan]] / [[metal\|Metal]] / [[directx\|DirectX]] 12 |
| 計算シェーダ | なし | あり |
| パイプライン管理 | 暗黙的 | 明示的（バリデーション済み） |
| マルチスレッド | 不可 | 対応 |
| シェーダ言語 | GLSL | WGSL |

## 計算シェーダ

グラフィックス描画だけでなく、汎用計算（GPGPU）をブラウザ上で実行できる。機械学習推論、物理シミュレーション、画像処理など。

## WGSL

WebGPU Shading Language。WebGPU 専用のシェーダ言語。GLSL / HLSL / MSL に代わるもので、型安全性とポータビリティを重視。

## 関連

- [[wgpu]] — Rust 製の WebGPU 実装
- [[snaidhm]] — WebGPU 計算シェーダで 2D/3D レンダリングする Almide ライブラリ
- [[gpu|GPU]]
