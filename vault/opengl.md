---
title: OpenGL
tags: [graphics, gpu]
created_at: 2026-05-19
updated_at: 2026-05-19
---

Khronos Group が管理するクロスプラットフォームの[[gpu|GPU]] API。1992年発表。長年のデファクトスタンダード。

## 特徴

- 高レベルな抽象化（ドライバが内部で最適化を行う）
- ステートマシンモデル（グローバル状態を変更して描画）
- GLSL — OpenGL Shading Language
- ほぼすべてのプラットフォームで動作（ただし Apple は非推奨化）

## 派生

- **OpenGL ES** — モバイル・組み込み向けサブセット
- **WebGL** — ブラウザ向け。OpenGL ES 2.0/3.0 ベース

## 現在の位置づけ

後継の [[vulkan|Vulkan]]（ネイティブ）と [[webgpu|WebGPU]]（Web）に置き換わりつつある。Apple は macOS Mojave (2018) で非推奨化し [[metal|Metal]] に移行。

## 関連

- [[vulkan|Vulkan]] — 後継の低レベル API
- [[webgpu|WebGPU]] — WebGL（OpenGL ES ベース）の後継
- [[gpu|GPU]]
