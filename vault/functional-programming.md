---
title: 関数型言語
tags: [programming-paradigm, computer-science]
---

関数を第一級の値として扱うプログラミングパラダイム。

## プログラマ向けの一言

**関数を変数に入れたり、引数に渡したり、返り値にできる言語。** JavaScript/TypeScript を書いてる時点で、あなたは既に関数型プログラミングを部分的にやっている。

## コードで理解する

```ts
// 関数が「第一級 (first-class)」= 値として扱える
const double = (x: number) => x * 2;
const apply = (f: (x: number) => number, x: number) => f(x);
apply(double, 5); // 10

// 高階関数: 関数を受け取る or 返す関数
const numbers = [1, 2, 3, 4, 5];
numbers.filter(x => x % 2 === 0);  // [2, 4]   ← filter は関数を受け取る
numbers.map(x => x * 2);           // [2, 4, 6, 8, 10]
numbers.reduce((sum, x) => sum + x, 0); // 15

// 関数の合成
const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A) => f(g(a));
const increment = (x: number) => x + 1;
const doubleAndIncrement = compose(increment, double);
doubleAndIncrement(3); // 7
```

## 関数型の中心的な考え方

```ts
// 1. イミュータビリティ（変更しない）
const bad = (arr: number[]) => { arr.push(1); return arr; }; // 元の配列を壊す
const good = (arr: number[]) => [...arr, 1];                 // 新しい配列を返す

// 2. 副作用の分離
// 副作用あり: DB読み書き、console.log、ファイルI/O、乱数
// 純粋: 同じ入力に対して常に同じ出力。副作用なし。
const pure = (x: number) => x * 2;          // 何回呼んでも同じ
const impure = () => Math.random();          // 毎回違う

// 3. 宣言的（何をするか）vs 命令的（どうやるか）
// 命令的
let sum = 0;
for (let i = 0; i < numbers.length; i++) sum += numbers[i];
// 宣言的
const total = numbers.reduce((s, x) => s + x, 0);
```

## 代表的な言語

- **Haskell** — [[pure-functional-programming|純粋関数型]]の代表。副作用を[[monad|Monad]]で管理
- **OCaml / F#** — 実用的な関数型。副作用を自由に書ける
- **Erlang / Elixir** — 並行処理に強い関数型
- **Clojure** — [[lisp|LISP]]系の現代的な関数型
- **Scala** — JVM 上の関数型 + オブジェクト指向ハイブリッド
- **Rust** — 関数型の影響が強い（イミュータブルデフォルト、パターンマッチ、Result型）

## 関連

- [[pure-functional-programming|純粋関数型言語]] — 副作用を型で制御する関数型の純粋版
- [[lambda-calculus|λ計算]] — 関数型言語の理論的基盤
- [[adt-gadt|ADT / GADT]] — 関数型言語の型定義の中心
