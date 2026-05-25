---
title: λ計算
tags: [programming-paradigm, computer-science, type-theory]
created_at: 2026-05-18
updated_at: 2026-05-18
---

「関数の定義と適用」だけですべての計算を表現する形式体系。1930年代にアロンゾ・チャーチが考案。

## プログラマ向けの一言

**アロー関数だけでプログラムを書く世界。** `if` も `for` も数値もない。あるのは `(x) => ...` と関数呼び出しだけ。それだけでチューリング完全。

## コードで理解する

```ts
// λ計算の3つの要素:
// 1. 変数:      x
// 2. 抽象(λ):   (x) => body    ← 関数を作る
// 3. 適用:      f(x)           ← 関数を呼ぶ
// これだけ。

// λ計算で数を表現する（チャーチ数）
// 数 = 「関数を n 回適用する関数」
const zero = (f: Function) => (x: any) => x;              // 0回適用
const one  = (f: Function) => (x: any) => f(x);           // 1回適用
const two  = (f: Function) => (x: any) => f(f(x));        // 2回適用
const three = (f: Function) => (x: any) => f(f(f(x)));    // 3回適用

// 普通の数に変換して確認
const toNumber = (n: Function) => n((x: number) => x + 1)(0);
toNumber(zero);  // 0
toNumber(three); // 3

// 足し算
const add = (m: Function) => (n: Function) => (f: Function) => (x: any) =>
  m(f)(n(f)(x));
toNumber(add(two)(three)); // 5

// 真偽値
const TRUE  = (a: any) => (_b: any) => a;  // 2つの選択肢から1つ目を選ぶ
const FALSE = (_a: any) => (b: any) => b;  // 2つの選択肢から2つ目を選ぶ
const IF    = (cond: Function) => (then_: any) => (else_: any) => cond(then_)(else_);
IF(TRUE)("yes")("no");  // "yes"
IF(FALSE)("yes")("no"); // "no"
```

## 簡約

λ計算の「計算」= 式を書き換えるルール。詳細は [[reduction|簡約]] を参照。

```ts
// β簡約（ベータ簡約）: 関数適用を実行する
// ((x) => x + 1)(3)  →  3 + 1  →  4
// 引数を本体に代入するだけ

// これがλ計算における「計算の1ステップ」
```

## 関連

- [[reduction|簡約]] — α, β, η 簡約の詳細
- [[lisp|LISP]] — λ計算を最初に実装した言語
- [[functional-programming|関数型言語]] — λ計算を実用化したもの
- [[curry-howard|カリー=ハワード同型対応]] — λ計算の項 = 論理の証明
