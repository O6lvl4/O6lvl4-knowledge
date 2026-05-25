---
title: DirectX
tags: [graphics, gpu, microsoft]
created_at: 2026-05-19
updated_at: 2026-05-19
---

Microsoft のマルチメディア API 群。[[gpu|GPU]] グラフィックスには Direct3D が使われる。Windows / Xbox で動作。

## 歴史

| バージョン | 年 | 特徴 |
|---|---|---|
| Direct3D 9 | 2002 | 長年のゲーム開発標準 |
| Direct3D 11 | 2009 | 計算シェーダ追加 |
| Direct3D 12 | 2015 | 低レベル API。[[vulkan\|Vulkan]] / [[metal\|Metal]] と同世代 |

## Direct3D 12

- 明示的なメモリ管理とコマンドバッファ
- マルチスレッド対応
- HLSL — High Level Shading Language
- DirectX Raytracing (DXR) によるリアルタイムレイトレーシング

## 関連

- [[vulkan|Vulkan]] — クロスプラットフォームの対抗 API
- [[metal|Metal]] — Apple の対抗 API
- [[wgpu]] — DirectX 12 をバックエンドとして使える
- [[gpu|GPU]]
