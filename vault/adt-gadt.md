---
title: ADT / GADT
tags: [type-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:07+09:00
---

代数的データ型 (Algebraic Data Type) と一般化代数的データ型 (Generalized ADT)。

## プログラマ向けの一言

**TypeScript の union 型 + リテラル型による判別 = ADT。GADT はそれに加えて「各バリアントで型パラメータを具体化」できる。**

## ADT: 直和 + 直積

```ts
// 直積型 (Product type) = AND: 両方持つ
type User = { name: string; age: number }; // name AND age

// 直和型 (Sum type) = OR: どれか1つ
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// なぜ「代数的」か？
// 直積: A × B → 組み合わせ数 = |A| × |B|
// 直和: A + B → 組み合わせ数 = |A| + |B|
// 型の組み合わせが足し算と掛け算で計算できるから

// パターンマッチ（= switch on discriminant）
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":   return Math.PI * s.radius ** 2;
    case "rect":     return s.width * s.height;
    case "triangle": return (s.base * s.height) / 2;
  }
}
// TypeScript はここで網羅性チェックをしてくれる
// 新しいバリアントを追加したら、switch の漏れがコンパイルエラーに
```

## GADT: バリアントごとに型パラメータが変わる

```ts
// ADT の限界: 型パラメータが全バリアントで同じ
type Expr<T> =
  | { kind: "num"; value: number }    // T は？
  | { kind: "str"; value: string }    // T は？
  | { kind: "add"; left: Expr<T>; right: Expr<T> }; // T は？

// 問題: Expr<number> と Expr<string> の区別がつかない
// add(num(1), str("hello")) ← これを型で禁止できない

// GADT なら: 各バリアントが返す型を具体的に指定できる
// Haskell:
//   data Expr a where
//     Num :: Int -> Expr Int          ← Num は必ず Expr Int
//     Str :: String -> Expr String    ← Str は必ず Expr String
//     Add :: Expr Int -> Expr Int -> Expr Int  ← Add は Int 同士のみ

// TypeScript で GADT を模倣:
type ExprNum = { kind: "num"; value: number; __type: number };
type ExprStr = { kind: "str"; value: string; __type: string };
type ExprAdd = { kind: "add"; left: ExprNum; right: ExprNum; __type: number };
type Expr2 = ExprNum | ExprStr | ExprAdd;

// 型安全な評価関数
function evalExpr(e: ExprNum): number;
function evalExpr(e: ExprStr): string;
function evalExpr(e: Expr2): number | string {
  switch (e.kind) {
    case "num": return e.value;
    case "str": return e.value;
    case "add": return evalExpr(e.left) + evalExpr(e.right);
  }
}
```

## 押さえどころ（カード化候補）

- ADT とは → 直和（OR / union）と直積（AND / record）の組み合わせで型を構成する方式。TypeScript の判別 union + リテラル型がこれにあたる
- なぜ「代数的」か → 直積は組み合わせ数 |A|×|B|、直和は |A|+|B|。型の数が掛け算・足し算で計算できるから代数的
- パターンマッチと網羅性 → discriminant での switch が場合分け。バリアント追加時に switch の漏れがコンパイルエラーになり、抜けを型で防げる
- ADT の限界 → 型パラメータが全バリアントで共通なので Expr&lt;number&gt; と Expr&lt;string&gt; を区別できず、add(num, str) を禁止できない
- GADT とは → 各バリアントが返す型を具体化できる ADT（Num :: Expr Int, Str :: Expr String）。TS では `__type` タグや関数オーバーロードで模倣する

## 関連

- [[enum|列挙型]] — 直和型の各言語での実装形態（C enum → tagged union）
- [[union-type|共用型 / Union 型]] — C union / TypeScript union / tagged union の関係
- [[functional-programming|関数型言語]] — ADT は関数型の基本的な型定義方法
- [[phantom-type|幽霊型]] — GADT の簡易版として使えるテクニック
- [[duality|双対]] — 直積型と直和型は双対の関係
- [[tagless-final|Tagless Final]] — GADT による initial encoding の対。型クラスで tagless にする final 流儀
- [[polymorphism|ポリモーフィズム]] — 直和型での場合分けは subtype 多相と並ぶ手段
- [[recursion-schemes|再帰スキーム]] — catamorphism は ADT の fold を一般化したもの
- [[decoder-pattern|デコーダパターン]] — 外部データを ADT に判別変換する
- [[category-theory|圏論]] — 直和/直積は余積/積という圏論的構成
- [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]] — 直和であり得る状態だけを列挙する
