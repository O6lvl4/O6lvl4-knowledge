---
title: nendo
tags: [almide, graphics, 3d, vrm]
---

VRM 3D モデルをブラウザで [[almide|Almide]] + [[obsid]] を使ってレンダリングするプロジェクト。three.js 排除が目標。

## 実装済み

- GLB バイナリパース（chunk parse、画像抽出）
- VRM メタデータ抽出（version detect、bone、expression）
- CLI ツール: inspect, validate, tree
- WASM API: 検証、JSON 出力

## ロードマップ

glTF accessor → obsid vertex buffer、マテリアル、スケルタル・スキニング、モーフターゲット

## 関連

- [[obsid]] — グラフィックスランタイム
- [[lumen]] — 数学ライブラリ
