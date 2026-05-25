---
title: Vulkan
tags: [graphics, gpu]
created_at: 2026-05-19
updated_at: 2026-05-19
---

Khronos Group が策定したクロスプラットフォームの低レベル[[gpu|GPU]] API。2016年発表。[[opengl|OpenGL]] の後継。

## 特徴

- 明示的な GPU 制御（コマンドバッファ、メモリ管理、同期を開発者が管理）
- マルチスレッド対応（コマンドバッファを並列に構築できる）
- SPIR-V — 中間シェーダ表現。GLSL / HLSL からコンパイルして使う
- Windows, Linux, Android, Nintendo Switch で動作（macOS は MoltenVK 経由）

## OpenGL との違い

| | [[opengl\|OpenGL]] | Vulkan |
|---|---|---|
| 抽象度 | 高い（ドライバが最適化） | 低い（開発者が制御） |
| スレッド | シングルスレッド前提 | マルチスレッド設計 |
| オーバーヘッド | ドライバが重い | 薄いドライバ |
| 学習コスト | 低い | 高い |

## 関連

- [[opengl|OpenGL]] — Vulkan の前身
- [[metal|Metal]] — Apple 版の低レベル API
- [[directx|DirectX]] — Microsoft 版の低レベル API
- [[wgpu]] — Vulkan をバックエンドとして使える
- [[gpu|GPU]]
