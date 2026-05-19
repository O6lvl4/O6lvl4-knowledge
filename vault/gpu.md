---
title: GPU
tags: [hardware, graphics, computer-science]
---

Graphics Processing Unit。大量の単純な計算を並列実行することに特化したプロセッサ。

もともと 3D グラフィックスのラスタライズ用に生まれたが、現在は機械学習・科学計算・暗号通貨マイニングなど汎用計算（GPGPU）にも使われる。

## CPU との違い

| | CPU | GPU |
|---|---|---|
| コア数 | 数個〜数十個 | 数千〜数万個 |
| 各コアの性能 | 高い（複雑な処理が得意） | 低い（単純な処理のみ） |
| 得意なこと | 分岐の多い逐次処理 | 同じ処理の大量並列実行 |
| メモリ | 大容量、低レイテンシ | 高帯域、高レイテンシ |

## グラフィックス API

| API | ベンダー | プラットフォーム | レベル |
|---|---|---|---|
| [[opengl\|OpenGL]] | Khronos | クロスプラットフォーム | 高レベル |
| [[vulkan\|Vulkan]] | Khronos | クロスプラットフォーム | 低レベル |
| [[metal\|Metal]] | Apple | macOS / iOS | 低レベル |
| [[directx\|DirectX]] | Microsoft | Windows / Xbox | 低レベル |
| [[webgpu\|WebGPU]] | W3C | ブラウザ | 低レベル（Web向け） |

## 実装

- [[wgpu]] — Rust 製の WebGPU 実装。ネイティブでも動く
- [[snaidhm]] — Almide 用の WebGPU ベース計算シェーダレンダラ
- [[obsid]] — Almide 用グラフィックスランタイム（Canvas 2D / WebGL）
