---
title: パラメトリシティ / 自由定理
tags: [type-theory, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-31T09:46:52+09:00
---

[[polymorphism|parametric 多相]]な関数は、型変数の中身に**関わらず一様に**振る舞う、という性質（Reynolds の abstraction theorem, 1983）。型シグネチャ**だけ**から成り立つ定理「**自由定理（free theorems）**」が導ける（Wadler "Theorems for Free!", 1989）。

## 直感

型変数に対して関数は何も操作できないので、取りうる実装が極端に縛られる。

- `forall a. a -> a` は **id しかありえない**
- `forall a. [a] -> [a]` は要素を**並べ替え・複製・間引きするだけ**。要素を発明も検査もできない
- このことから `map f . g = g . map f`（任意の `g :: forall a. [a]->[a]`）のような等式が**証明なしに**従う

## 自由定理の例（コード → 定理）

型シグネチャだけから、その型を持つ**任意の**実装について成り立つ等式が出る。

### 例1: `map`/`filter` の交換（`map` fusion の母型）

```haskell
g :: forall a. [a] -> [a]    -- 例: reverse, tail, take 3, ...
```

このシグネチャを持つ任意の `g` について、自由定理は次を保証する：

```haskell
map f . g  ==  g . map f       -- 任意の f :: x -> y, 任意の g
```

`g` は要素を**並べ替え・複製・間引き**しかできず、要素そのものを検査・生成できないので、要素に `f` を適用するのと位置を動かすのは可換。`g = reverse` なら `map f . reverse == reverse . map f` が**証明なしに**従う。

### 例2: `foldr`/`build` の融合（[[stream-fusion|Stream Fusion]] の正当化）

```haskell
build :: forall b. ((a -> b -> b) -> b -> b) -> [a]
```

この型の `build g` について、自由定理から GHC の融合則が出る：

```haskell
foldr k z (build g)  ==  g k z       -- 中間リストが消える
```

`g` は渡された `cons`/`nil` を**そのまま使うしかない**（`b` の中身を覗けない）ので、実際の `(:)`/`[]` を `k`/`z` に差し替えても結果は同じ — これが「中間リスト除去が意味を変えない」根拠。

### 例3: 自然性（自然変換としての多相）

```haskell
h :: forall a. f a -> g a            -- 例: listToMaybe, reverse, concat
```

任意の `h` と任意の `f :: x -> y` について：

```haskell
fmap_g f . h  ==  h . fmap_f f       -- naturality square
```

つまり `forall a. f a -> g a` 型の関数は自動的に**自然変換**になる（[[category-theory|圏論]]版のパラメトリシティ）。

## 根拠

型を**関係**（logical relation）で解釈し、「項は関係を保つ」ことを示す。型抽象が表現独立性（representation independence）＝**情報隠蔽の正当化**になる。

## 用途と破れ

- **用途**: 最適化の正当化（fusion 則）、API の振る舞い推論、抽象の安全性、[[equational-reasoning|等式推論]]の補強
- **破れ**: `seq`・例外・型による分岐（typecase）・`unsafe` があると一様性が崩れ、自由定理は成立しない

## 押さえどころ（カード化候補）

- **パラメトリシティとは** → parametric 多相な関数は型変数の中身に関わらず一様に振る舞う性質（Reynolds の abstraction theorem 1983）。型変数を操作できないので実装が極端に縛られる。
- **自由定理** → 型シグネチャ**だけ**から証明なしに導ける定理 (Wadler 1989)。例: `forall a. a->a` は id のみ。`forall a. [a]->[a]` は並べ替え・複製・間引きのみ。
- **代表的な定理** → `map f . g == g . map f`（任意の `g :: forall a.[a]->[a]`）、`foldr k z (build g) == g k z`（fusion）、`forall a. f a -> g a` は自然変換になる。
- **根拠** → 型を logical relation で解釈し「項は関係を保つ」を示す。型抽象＝表現独立性＝情報隠蔽の正当化。自然変換は圏論版パラメトリシティ。
- **用途と破れ** → 用途: fusion 則・API 振る舞い推論・等式推論の補強。破れ: `seq`・例外・typecase・`unsafe` で一様性が崩れると成立しない。

## 関連

- [[polymorphism|ポリモーフィズム]] — parametric 多相の性質がパラメトリシティ
- [[category-theory|圏論]] — 自然変換はパラメトリシティの圏論版
- [[equational-reasoning|等式推論]] — 自由定理は等式推論の強力な道具
- [[stream-fusion|Stream Fusion]] — fusion 則の正当化に使える
