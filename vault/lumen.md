---
title: lumen
tags: [almide, graphics, math]
---

[[almide|Almide]] 用のグラフィックス数学ライブラリ。すべてのターゲット（ネイティブ + WASM）で動作。

## 機能

- **ベクトル**: vec2, vec3（add, dot, cross, normalize, lerp）
- **行列**: mat4（回転, スケール, 平行移動, 逆行列, 透視射影）
- **カラー**: hex 変換, ミックス, トーン調整, CSS 出力
- **四元数**: Quaternion サポート

## 利用先

- [[snaidhm]] — レンダラ
- [[obsid]] — グラフィックスランタイム
- [[nendo]] — VRM レンダリング
