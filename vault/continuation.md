---
title: 継続 / 限定継続
tags: [programming-paradigm, computer-science]
created_at: 2026-05-02
updated_at: 2026-05-31T21:33:23+09:00
---

「この後の計算の残り全部」を値として扱う概念。

## プログラマ向けの一言

**コールバックの一般化。** `async/await` も `try/catch` も `yield` も、裏では「ここから先の処理」を一時停止して後で再開する仕組み = 継続。

## 継続 (Continuation)

```ts
// 普通のコード
function add(a: number, b: number): number {
  return a + b;
}
const result = add(1, 2) * 3; // (1+2) * 3 = 9

// 「add(1, 2) の結果を受け取って、その後何をするか」= 継続
// この例では「結果を受け取って、3を掛ける」が継続
const continuation = (x: number) => x * 3;
continuation(add(1, 2)); // 9

// CPS (Continuation-Passing Style): 継続を明示的に渡すスタイル
function addCPS(a: number, b: number, k: (result: number) => void): void {
  k(a + b); // 結果を継続 k に渡す
}
addCPS(1, 2, (sum) => {
  console.log(sum * 3); // 9
});

// ↑ これ、コールバックと全く同じ形
// Node.js のコールバック地獄は CPS そのもの
```

## 継続 = async/await の正体

```ts
// async/await は継続の糖衣構文

// async/await
async function fetchAndProcess() {
  const data = await fetch("/api");  // ここで一時停止
  const json = await data.json();    // 再開後、またここで一時停止
  return json.value * 2;             // 再開後、最終結果
}

// これを CPS で書くとこうなる（= コールバック）
function fetchAndProcessCPS(k: (result: number) => void) {
  fetch("/api", (data) => {          // fetch の継続
    data.json((json) => {            // json の継続
      k(json.value * 2);             // 全体の継続
    });
  });
}
// await = 「ここから先の処理を継続として保存して、結果が来たら再開」
```

## 限定継続 (Delimited Continuation)

```ts
// 継続:   「ここから先の処理 *全部*」
// 限定継続: 「ここから *ある区切りまで* の処理」

// Generator は限定継続の一種
function* range(n: number) {
  for (let i = 0; i < n; i++) {
    yield i;  // ← ここで一時停止。「次の yield まで」が限定継続
  }
}

const gen = range(3);
gen.next(); // { value: 0, done: false }  ← 再開して次の yield まで実行
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: undefined, done: true }

// try/catch も限定継続的
// throw = 「現在の継続を捨てて、catch まで巻き戻る」
// catch = 「巻き戻り先の区切り」
try {
  // ここから...
  throw new Error("boom"); // 現在の継続を破棄
  // ...ここまでの継続は捨てられる
} catch (e) {
  // catch が「区切り」。ここから新しい継続が始まる
}
```

## 押さえどころ（カード化候補）

- **継続とは** → 「この後の計算の残り全部」を値として扱う概念。コールバックの一般化
- **CPS** → 継続を引数 `k` として明示的に渡すスタイル。`addCPS(a,b,k)` が `k(a+b)` を呼ぶ。Node のコールバック地獄は CPS そのもの
- **async/await の正体** → 継続の糖衣構文。`await` = 「ここから先を継続として保存し、結果が来たら再開」。CPS に脱糖するとコールバックのネストになる
- **限定継続** → 継続が「先全部」なのに対し「ある区切りまで」を切り取ったもの。Generator の `yield`（次の yield まで）が一種
- **try/catch との対応** → `throw` = 現在の継続を破棄して catch まで巻き戻る、`catch` = 巻き戻り先の区切り

## 関連

- [[algebraic-effects|Algebraic Effects]] — 限定継続を使って副作用を扱う仕組み
- [[monad|Monad]] — 継続を扱う別のアプローチ（Cont モナド）
- [[abstract-machine|抽象機械]] — CEK 機械は継続を状態として明示化
- [[tail-call-optimization|末尾呼び出し最適化]] — CPS 変換で全呼び出しが末尾化する
