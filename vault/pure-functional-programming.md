---
title: 純粋関数型言語
tags: [programming-paradigm, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:23+09:00
---

すべての関数が純粋（副作用なし）であることを型システムで強制する[[functional-programming|関数型言語]]。

## プログラマ向けの一言

**副作用を書くのに型の許可が要る言語。** `console.log` すら自由に呼べない。その代わり、関数のシグネチャを見るだけで「この関数は何をするか」が完全にわかる。

## 純粋 vs 非純粋

```ts
// --- 非純粋な関数型（OCaml, Scala, JS/TS）---
// 好きなところで副作用を起こせる
function greet(name: string): string {
  console.log("Side effect!");   // 自由に書ける
  return `Hello, ${name}`;
}

// --- 純粋関数型（Haskell）の考え方を TS で表現 ---
// 副作用を起こすには「IO という箱」に入れないといけない
type IO<A> = { run: () => A }; // 実行するまで副作用は起きない

function pureGreet(name: string): string {
  // ここでは console.log を呼べない（型が許さない）
  return `Hello, ${name}`;
}

function greetWithLog(name: string): IO<string> {
  return {
    run: () => {
      console.log("Side effect!");  // IO の中でだけ許される
      return `Hello, ${name}`;
    }
  };
}
// greetWithLog("world")      ← この時点では何も起きない
// greetWithLog("world").run() ← 実行して初めて副作用が発生
```

## 参照透過性

```ts
// 純粋関数型の核心: 参照透過性 (referential transparency)
// 「式をその結果で置き換えても、プログラムの意味が変わらない」

const x = double(3); // 6
// double(3) を 6 に置き換えてもプログラムの意味は同じ → 参照透過

let counter = 0;
const increment = () => ++counter;
const y = increment(); // 1
// increment() を 1 に置き換えると counter が増えない → 参照透過でない
```

## 代表: Haskell

```haskell
-- Haskell では型が副作用を明示する
double :: Int -> Int           -- 純粋。副作用なし。
double x = x * 2

greet :: String -> IO String   -- IO がついている = 副作用あり
greet name = do
  putStrLn "Side effect!"
  return ("Hello, " ++ name)
```

## 押さえどころ（カード化候補）

- **純粋関数型言語とは** → すべての関数が純粋（副作用なし）であることを型システムで強制する関数型言語。副作用を書くのに型の許可が要る
- **IO の箱** → 副作用は `IO<A>`（実行するまで何も起きない箱）に入れないと書けない。`greetWithLog("world")` の時点では無、`.run()` で初めて副作用が発生
- **参照透過性** → 式を結果で置き換えてもプログラムの意味が変わらない性質。`double(3)` を `6` に置換可（透過）、`increment()`（counter を増やす）は不可（非透過）
- **代表は Haskell** → 型が副作用を明示。`Int -> Int` は純粋、`String -> IO String` は副作用あり

## 関連

- [[functional-programming|関数型言語]] — 純粋関数型はその厳密版
- [[monad|Monad]] — Haskell が副作用を扱う仕組み
- [[algebraic-effects|Algebraic Effects]] — Monad とは別の副作用管理アプローチ
- [[functional-core-imperative-shell|Functional Core, Imperative Shell]] — 純粋なコアと副作用の殻を分ける設計
- [[equational-reasoning|等式推論]] — 参照透過性が可能にする式変形・証明
- [[constraints-liberate]] — 「副作用を禁じて局所推論を買う」= 制約が自由を生むの一例
