---
title: nendo
tags: [almide, graphics, 3d, vrm]
---

[[vrm|VRM]] 3D モデルをブラウザで [[almide|Almide]] + [[obsid]] を使ってレンダリングするプロジェクト。three.js 排除が目標。

## 何をするものか

VRM（VRoid 等で作成される 3D アバターフォーマット）を読み込んで、ブラウザ上で描画する。通常は three.js + three-vrm を使うが、nendo は Almide エコシステム内で完結させることで、バンドルサイズの削減と GPU パイプラインの直接制御を実現する。

## 実装済み

- GLB バイナリパース（glTF のバイナリコンテナ形式）
- VRM メタデータ抽出（バージョン検出、ボーン構造、表情定義）
- CLI ツール: `inspect`（メタデータ表示）, `validate`（フォーマット検証）, `tree`（ノード階層表示）
- WASM API: 検証、JSON 出力

## ロードマップ

glTF accessor → obsid vertex buffer、マテリアル変換、スケルタル・スキニング（骨格アニメーション）、モーフターゲット（表情変形）

## 関連

- [[vrm|VRM]] — 3D アバターフォーマット
- [[obsid]] — グラフィックスランタイム
- [[lumen]] — 数学ライブラリ
