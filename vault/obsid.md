---
title: obsid
tags: [almide, graphics, wasm]
---

[[almide|Almide]] 用グラフィックスランタイム。Canvas 2D、WebGL、3D メッシュレンダリングを WASM 経由で提供。

## レイヤー

| レイヤー | 用途 |
|---|---|
| Canvas 2D API | 2D ドローイング、チャート、UI |
| WebGL 1.0 API | カスタムシェーダ、低レベル 3D |
| 3D メッシュレンダラ | シーングラフ、オービットカメラ、ライティング |

## ネイティブホスト

Rust + wasmtime + wgpu + winit でクロスプラットフォーム実行も可能。

## 関連

- [[lumen]] — 数学ライブラリ
- [[nendo]] — VRM レンダリング（obsid を利用）
