---
title: 再帰スキーム
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T20:32:00+09:00
---

再帰的データ構造に対する**再帰のパターン**を、catamorphism / anamorphism などの高階関数として抽象化したもの。「再帰の構造を型で捉え、手書きの再帰を畳み込み/展開の宣言に置き換える」。出典は "Functional Programming with Bananas, Lenses, Envelopes and Barbed Wire" (Meijer ら 1991)。

## 基本スキーム

| スキーム | 別名 | 型 | 役割 |
|---|---|---|---|
| catamorphism | fold | `f a -> a` で畳む | 構造を**消費**して値に（[[adt-gadt\|ADT]] の fold） |
| anamorphism | unfold | `a -> f a` で生む | 種から構造を**生成** |
| hylomorphism | ana then cata | unfold→fold | 中間構造を介す。中間を消せる（deforestation） |
| paramorphism | | | fold + 元の部分構造も参照 |
| apomorphism | | | unfold + 早期終了 |

## 圏論の背景

データ型を関手 `f` の**不動点** `Fix f` と見る。

- **F-代数** `f a -> a` の畳み込み ＝ catamorphism（始代数からの一意射）
- **F-余代数** `a -> f a` の展開 ＝ anamorphism（終余代数への一意射）
- 始代数（データ）と終余代数（解釈）は [[duality|双対]]。これは [[adt-gadt|initial/final encoding]] や [[tagless-final|tagless-final]] の対構造と同じ景色

## なぜ重要か

- 再帰を手で書く代わりに「畳む/展開する」を**宣言**でき、停止性・正しさが構造から従う
- **hylomorphism = ana then cata** の中間構造除去は **[[stream-fusion|Stream Fusion]]/deforestation** の理論的背景。「生成してすぐ消費する」を融合して中間データを消す
- FP Matsuri の「再帰の本質」系の話題はここに収束する

## 関連

- [[adt-gadt|ADT / GADT]] — catamorphism は ADT の fold の一般化
- [[duality|双対]] — cata（代数）/ ana（余代数）、始代数/終余代数の対
- [[stream-fusion|Stream Fusion]] — hylomorphism による中間構造除去
- [[comonad|Comonad]] / [[monad|Monad]] — 余代数/代数と通底する構造
