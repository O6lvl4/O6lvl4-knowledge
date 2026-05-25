---
title: svg (Almide)
tags: [almide, stdlib, graphics]
created_at: 2026-05-01
updated_at: 2026-05-19
---

SVG ドキュメント生成ライブラリ。[[almide|Almide]] で純粋実装。

## SVG とは

Scalable Vector Graphics。XML ベースのベクター画像フォーマット。ブラウザでネイティブ描画でき、拡大しても劣化しない。アイコン、チャート、ダイアグラムなどに使われる。

## 要素

rect, circle, ellipse, line, polygon, path, text, group

## 属性

fill, stroke, opacity, transform, font

## パスビルダー

`svg.path` でパスコマンド（M: 移動, L: 直線, C: ベジェ曲線, A: 円弧, Z: 閉じる）をビルダーパターンで構築。

## 関連

- [[almide|Almide]] — 言語本体
- [[lumen]] — グラフィックス数学ライブラリ
