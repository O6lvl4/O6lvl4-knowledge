---
title: snaidhm
tags: [almide, graphics, gpu, wasm]
created_at: 2026-05-18
updated_at: 2026-05-18
---

[[almide|Almide]] 用の WebGPU ベース計算シェーダ最優先 2D/3D レンダラ。

## 特徴

CPU ラスタライザを使わず、GPU 計算シェーダでパスレンダリングを行う。[[almide|Almide]] 単一言語で CPU コードと GPU シェーダの両方を記述。

## パイプライン

```
flatten → tile → sort → fine raster
```

## レンダリング対象

- 2D パス
- 3D メッシュ
- テキスト（OTF/TTF → グリフアウトライン）
- 画像テクスチャ

## インフラ

- フレームアリーナ（メモリ管理）
- パイプライン管理
- WASM + Rust ネイティブ対応

## 関連

- [[ceangal]] — snaidhm 上に構築された UI フレームワーク
- [[lumen]] — グラフィックス数学ライブラリ
