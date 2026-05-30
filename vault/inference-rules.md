---
title: 推論規則
tags: [type-theory, logic, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-18
---

「前提から結論を導く」ルールの形式的な記法。型システムの定義はこれで書かれる。

## プログラマ向けの一言

**TypeScript コンパイラが「この式の型は何か」を決めるルールブック。** 「x が number で y が number なら x + y は number」—— これが推論規則。

## 記法

```
  前提1   前提2   前提3
  ─────────────────────  ルール名
        結論
```

横線の上が「これが成り立つなら」、下が「これが導ける」。

## コードで理解する

```ts
// --- 変数の型（Var ルール）---
//
//   x: T がスコープにある
//   ─────────────────────  Var
//         x : T
//
// TypeScript で言うと:
const x: number = 42;
x; // ← 型は number。スコープに x: number があるから。


// --- 関数適用の型（App ルール）---
//
//   f : A → B    a : A
//   ───────────────────  App
//       f(a) : B
//
// TypeScript で言うと:
const f = (n: number): string => n.toString();  // f : number → string
const a: number = 42;                            // a : number
f(a);  // ← 型は string。App ルールで導出される。
// f("hello") はエラー: "hello" : string ≠ number


// --- 関数定義の型（Abs ルール）---
//
//   x: A と仮定した上で body: B が導ける
//   ─────────────────────────────────  Abs
//       (x: A) => body  :  A → B
//
const double = (x: number): number => x * 2;
// x: number と仮定 → x * 2: number → 関数全体の型は number → number


// --- if 式の型 ---
//
//   cond: boolean   then_: T   else_: T
//   ─────────────────────────────────────  If
//      cond ? then_ : else_  :  T
//
// 両方のブランチが同じ型でないとエラー
const result = true ? 42 : "hello";
// 42: number, "hello": string → 型は number | string


// --- let の型（Let ルール）---
//
//   e1 : A    x: A の下で e2 : B
//   ────────────────────────────  Let
//     let x = e1; e2  :  B
//
const y = 42;         // e1 : number → y: number
const z = y + 1;      // y: number の下で y + 1 : number
```

## 型推論 = 推論規則を逆向きに適用する

```ts
// 型推論: 型を書かなくても推論規則から導出する

const add = (a: number, b: number) => a + b;
// コンパイラの推論:
// 1. a: number, b: number（アノテーションから）
// 2. a + b の + は number × number → number（組み込みルール）
// 3. よって add : (number, number) => number

const identity = <T>(x: T) => x;
// 1. x: T（ジェネリクスパラメータ）
// 2. 本体は x を返す → 返り値も T
// 3. よって identity : <T>(x: T) => T

// Hindley-Milner 型推論（Haskell, OCaml）:
// 型アノテーションなしでも推論規則から最も一般的な型を自動推論する
// let f x = x + 1  → f : int -> int（+ が int → int → int だから）
```

## 関連

- [[curry-howard|カリー=ハワード同型対応]] — 推論規則 ⟺ 型付け規則
- [[intuitionistic-logic|直観主義論理]] — 推論規則で定義される論理体系
- [[tapl|TAPL]] — 推論規則を体系的に学べる教科書
- [[dependent-type|依存型]] — より表現力の高い推論規則
- [[bidirectional-typing|双方向型検査]] — 推論規則を check/synth の2判断に割る実装技法
