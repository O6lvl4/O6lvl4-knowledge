---
title: 再帰スキーム
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-31T09:46:45+09:00
---

再帰的データ構造に対する**再帰のパターン**を、catamorphism / anamorphism などの高階関数として抽象化したもの。「再帰の構造を型で捉え、手書きの再帰を畳み込み/展開の宣言に置き換える」。出典は "Functional Programming with Bananas, Lenses, Envelopes and Barbed Wire" (Meijer ら 1991)。

## 基本スキーム

| スキーム | 別名 | 代数/余代数の型 | 役割 |
|---|---|---|---|
| catamorphism | fold | `f a -> a` で畳む | 構造を**消費**して値に（[[adt-gadt\|ADT]] の fold） |
| anamorphism | unfold | `a -> f a` で生む | 種から構造を**生成** |
| hylomorphism | ana then cata | `a -> f a` ＆ `f b -> b` | 中間構造を介す。中間を消せる（deforestation） |
| paramorphism | — | `f (Fix f, a) -> a` | fold + **元の部分構造**も同時に参照（cata の一般化） |
| apomorphism | — | `a -> f (Either (Fix f) a)` | unfold + `Left` で**部分木を即返し早期終了**（ana の一般化） |
| zygomorphism | — | 補助代数つき cata | 2つの fold を相互依存で同時に走らせる |
| histomorphism | — | `f (Cofree f a) -> a` | fold + **過去の全中間結果**を参照（動的計画法） |

para/apo は cata/ana の双対対: para は「畳みつつ元の構造を見る」、apo は「生みつつ既存構造で打ち切る」。`f (Fix f, a)` の `Fix f`（元の部分構造）と、`Either (Fix f) a` の `Left (Fix f)`（生成停止して既存を流用）が双対になっている。

## コード — cata / ana / hylo（Haskell 風）

不動点 `Fix f` と関手 `f` を使い、再帰を1段ぶん剥がす/包む `unFix`/`Fix` の上にスキームを定義する。

```haskell
newtype Fix f = Fix { unFix :: f (Fix f) }

type Algebra   f a = f a -> a      -- 1段の構造をまとめ上げる
type Coalgebra f a = a -> f a      -- 種から1段ぶん構造を生む

cata :: Functor f => Algebra f a -> Fix f -> a
cata alg = alg . fmap (cata alg) . unFix
--                 └ 部分構造を先に再帰で畳んでから alg で1段まとめる

ana :: Functor f => Coalgebra f a -> a -> Fix f
ana coalg = Fix . fmap (ana coalg) . coalg
--                 └ coalg で1段生み、各 seed をさらに再帰展開

hylo :: Functor f => Algebra f b -> Coalgebra f a -> a -> b
hylo alg coalg = alg . fmap (hylo alg coalg) . coalg
--    Fix を経由せず ana→cata を融合（中間構造を作らない＝deforestation）
```

具体例: 自然数の関手 `f a = One | Succ a` を畳む `sum`、種から木を生む例。

```haskell
-- リストの基底関手: data ListF a r = Nil | Cons a r  (Fix (ListF a) ≅ [a])
sumAlg :: Algebra (ListF Int) Int
sumAlg Nil         = 0
sumAlg (Cons x acc) = x + acc          -- acc は「残りを既に畳んだ結果」
-- total = cata sumAlg someList

-- factorial を hylo で: ana で [n, n-1, ..., 1] を生み、cata で積を取る（中間リスト無し）
fact :: Int -> Int
fact = hylo prodAlg rangeCoalg
  where rangeCoalg 0 = Nil
        rangeCoalg n = Cons n (n-1)
        prodAlg Nil          = 1
        prodAlg (Cons x acc) = x * acc
```

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
- [[comonad|Comonad]] / [[monad|Monad]] — 余代数/代数と通底する構造（histomorphism は Cofree comonad を使う）
- [[equational-reasoning|等式推論]] — fusion law（cata-build 等）はこの枠組みで証明される

## 押さえどころ（カード化候補）

- 再帰スキームとは → 再帰のパターンを高階関数として抽象化したもの（cata/ana/hylo…）。手書き再帰を「畳む/展開する」の宣言に置き換え、停止性・正しさが構造から従う。出典は Bananas...（Meijer ら 1991）
- cata / ana → cata は代数 `f a -> a` で構造を**消費**（fold、始代数からの一意射）、ana は余代数 `a -> f a` で構造を**生成**（unfold、終余代数への一意射）。両者は[[duality|双対]]
- hylomorphism → `ana then cata`。種から構造を生んで即畳む。`Fix` を経由せず融合でき、中間構造を消す＝[[stream-fusion|deforestation]] の理論背景
- para / apo → cata/ana の一般化。para は畳みつつ**元の部分構造**を参照（`f (Fix f, a) -> a`）、apo は生みつつ `Left` で**既存構造を流用し早期終了**（`a -> f (Either (Fix f) a)`）。互いに双対
- histo / zygo → histo は過去の全中間結果を参照（`Cofree f a`、動的計画法）、zygo は補助 fold を相互依存で同時実行。いずれも cata の拡張
