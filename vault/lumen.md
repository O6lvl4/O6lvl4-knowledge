---
title: lumen
tags: [almide, graphics, math]
---

[[almide|Almide]] 用のグラフィックス数学ライブラリ。すべてのターゲット（ネイティブ + WASM）で動作。

## 何をするものか

3D グラフィックスに必要な数学的基盤を提供する。glm (C++)、glam (Rust)、three.js の `Vector3` / `Matrix4` に相当するもので、レンダラやゲームエンジンが内部で使う。

## 機能

- **ベクトル**: vec2, vec3 — add, subtract, dot（内積）, cross（外積）, normalize（正規化）, lerp（線形補間）
- **行列**: mat4 — 回転, スケール, 平行移動, 逆行列, 透視射影（3D → 2D への変換）
- **カラー**: hex ↔ RGB 変換, ミックス（2色の補間）, トーン調整, CSS 出力
- **四元数**: Quaternion — ジンバルロックを起こさない回転表現

## 利用先

- [[snaidhm]] — WebGPU レンダラ
- [[obsid]] — Canvas2D/WebGL ランタイム
- [[nendo]] — VRM 3D モデルレンダリング

## 関連

- [[gpu|GPU]] — lumen が計算する変換はすべて GPU パイプラインに渡される
