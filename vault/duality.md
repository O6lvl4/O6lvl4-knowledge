---
title: 双対
tags: [computer-science, type-theory, mathematics]
created_at: 2026-05-18
updated_at: 2026-05-18
---

2つの概念が「矢印を逆にしただけ」の関係にあること。

## プログラマ向けの一言

**AND と OR は双対。push と pull は双対。Producer と Consumer は双対。** 片方を理解すれば、矢印を逆にするだけでもう片方が自動的に得られる。

## コードで理解する

```ts
// --- 直積と直和は双対 ---

// 直積 (Product): A AND B — 両方持つ
type Product = { a: string; b: number };
// ← 作るとき: a と b の両方が必要
// ← 使うとき: a だけ取り出す or b だけ取り出す（選ぶ）

// 直和 (Sum / Coproduct): A OR B — どちらか
type Sum = { kind: "a"; value: string } | { kind: "b"; value: number };
// ← 作るとき: a か b のどちらかを選ぶ
// ← 使うとき: 両方のケースを処理する必要がある

// Product: 作るのは AND、使うのは OR
// Sum:     作るのは OR、使うのは AND
// → 矢印（作る/使う）を逆にすると入れ替わる = 双対

// --- Iterator と Observer は双対 ---

// Iterator (pull): 消費者がデータを引っ張る
interface Iterator<T> {
  next(): { value: T; done: boolean };
}
// ← Consumer が「次をくれ」と要求する

// Observer (push): 生産者がデータを押し込む
interface Observer<T> {
  next(value: T): void;
  complete(): void;
}
// ← Producer が「これ受け取って」と通知する

// データの流れる方向が逆なだけで、構造は同じ
// for ループ ←→ イベントリスナ
// Array.map ←→ Observable.map (RxJS)

// --- async/await と Generator は双対 ---

// Generator (pull): 呼び出し側が .next() で値を引っ張る
function* producer() { yield 1; yield 2; yield 3; }

// async iteration (push): 値が来るのを待つ
async function consumer(stream: AsyncIterable<number>) {
  for await (const value of stream) { console.log(value); }
}
```

## なぜ有用か

```ts
// 双対性を知っていると:
// 1. 片方の概念を理解すれば、もう片方を自動的に導出できる
// 2. 片方の定理を証明すれば、双対の定理もタダで得られる
// 3. API 設計で対称性を見つけて、一貫したインターフェースを作れる

// 例: RxJS は Iterator の双対として Observable を体系的に設計した
// map, filter, reduce が Iterator にあるなら
// Observable にも map, filter, reduce があるべき → 実際にある
```

## 関連

- [[adt-gadt|ADT / GADT]] — 直積型と直和型の双対性
- [[continuation|継続 / 限定継続]] — CPS 変換は双対変換の一種
- [[comonad|Comonad]] — Monad の双対。代数/余代数、始代数/終余代数の対
- [[recursion-schemes|再帰スキーム]] — catamorphism（代数）と anamorphism（余代数）の双対
- [[category-theory|圏論]] — opposite category `C^op` が双対の源
