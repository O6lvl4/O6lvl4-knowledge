---
title: Comonad
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T20:27:00+09:00
---

[[monad|Monad]] の圏論的双対。Monad が「値を文脈に**入れて**作用を積む」なら、Comonad は「**文脈付き値**から値を取り出し、文脈全体を使って計算する」。`extract` と `extend`（または `duplicate`）が中核。

## 定義（Monad との対）

| | [[monad\|Monad]] `m` | Comonad `w` |
|---|---|---|
| 入口/出口 | `return :: a -> m a` | `extract :: w a -> a` |
| 連結 | `bind :: m a -> (a -> m b) -> m b` | `extend :: w a -> (w a -> b) -> w b` |
| 入れ子 | `join :: m (m a) -> m a` | `duplicate :: w a -> w (w a)` |
| 直感 | **出力に作用**（producer of effects） | **入力に文脈**（context-dependent computation） |

`extend f` は「フォーカスを動かしながら、各位置で**周囲の文脈ごと** `f` を適用する」操作。

## 代表例

- **Stream / 無限リスト** — 各位置で隣接要素を見る計算（移動平均など）
- **Zipper** — フォーカス付きデータ構造。セルオートマトンは「近傍を見て次状態を決める」＝ `extend` そのもの
- **Store comonad** `(s -> a, s)` — 関数＋現在位置。画像のたたみ込み、スプレッドシート（セル＝周囲参照）
- **Env / CoReader** `(e, a)` — 環境付き値（Reader モナドの双対）

## なぜ重要か

「周囲の文脈に依存する計算」を一様に扱える。セルオートマトン、画像処理（畳み込み）、スプレッドシート、ストリーム処理、リアクティブ UI が同じ `extend` の形に乗る。Monad が副作用（[[algebraic-effects|effect]]）のモデルなら、**Comonad は文脈・資源要求（[[coeffect|coeffect]]）のモデル**になる。

## 関連

- [[monad|Monad]] — 双対の相手。bind↔extend、return↔extract
- [[coeffect|Coeffect]] — comonad でモデル化される「文脈・資源の要求」
- [[duality|双対]] — Monad/Comonad は圏論的双対の一例
- [[algebraic-effects|Algebraic Effects]] — effect（出力側）に対する coeffect（入力側）の対比
