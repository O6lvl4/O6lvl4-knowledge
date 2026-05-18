---
title: Monad
tags: [programming-paradigm, computer-science, type-theory]
---

「文脈付きの値」を連鎖的につなげる仕組み。

## プログラマ向けの一言

**Promise のこと。** `then` でチェーンできて、前の結果を使って次の処理を決められる。`Promise`, `Optional`, `Result` はすべて Monad。

## コードで理解する

```ts
// Monad の本質: flatMap (= then = bind = >>=)
// 「箱の中身を取り出して、関数に渡して、新しい箱に入れる」

// --- Promise は Monad ---
fetch("/api/user")
  .then(res => res.json())         // Response → Promise<JSON>
  .then(user => fetch(user.url))   // JSON → Promise<Response>
  .then(res => res.text());        // Response → Promise<string>
// .then = flatMap。前の結果を使って次の Promise を作る

// --- 配列も Monad ---
[1, 2, 3]
  .flatMap(x => [x, x * 10]);     // [1, 10, 2, 20, 3, 30]
// 各要素に対して配列を返し、結果をフラットにする

// --- Optional も Monad（TS で実装）---
type Option<T> = { kind: "some"; value: T } | { kind: "none" };

function flatMap<A, B>(opt: Option<A>, f: (a: A) => Option<B>): Option<B> {
  if (opt.kind === "none") return { kind: "none" };
  return f(opt.value); // 中身を取り出して関数に渡す
}

const some = <T>(value: T): Option<T> => ({ kind: "some", value });
const none: Option<never> = { kind: "none" };

// null チェックの連鎖が flatMap で書ける
const user = some({ address: some({ city: "Tokyo" }) });
const city = flatMap(user, u =>
  flatMap(u.address, a => some(a.city))
); // Option<"Tokyo">
// → Optional chaining (user?.address?.city) と同じこと
```

## Monad の3つの法則

```ts
// Monad であるための条件（Promise で確認）:

// 1. 左単位元: of(x).then(f) === f(x)
Promise.resolve(5).then(x => Promise.resolve(x + 1));
// === Promise.resolve(6) ✓

// 2. 右単位元: m.then(of) === m
Promise.resolve(5).then(x => Promise.resolve(x));
// === Promise.resolve(5) ✓

// 3. 結合律: m.then(f).then(g) === m.then(x => f(x).then(g))
Promise.resolve(5)
  .then(x => Promise.resolve(x + 1))
  .then(x => Promise.resolve(x * 2));
// === Promise.resolve(5).then(x =>
//   Promise.resolve(x + 1).then(y => Promise.resolve(y * 2))
// ) ✓
```

## do 記法 = async/await

```ts
// Haskell の do 記法と async/await は同じもの

// Haskell (do 記法):
// do
//   user <- getUser(id)
//   posts <- getPosts(user.id)
//   return (user, posts)

// TypeScript (async/await):
async function getUserPosts(id: string) {
  const user = await getUser(id);      // Promise から値を取り出す
  const posts = await getPosts(user.id); // 前の結果を使って次の Promise
  return { user, posts };
}

// await = Haskell の <- (bind の糖衣構文)
// async = do ブロック
```

## 関連

- [[algebraic-effects|Algebraic Effects]] — Monad の「色付き関数」問題を解決する別のアプローチ
- [[continuation|継続 / 限定継続]] — Cont Monad は継続を Monad で扱う
- [[pure-functional-programming|純粋関数型言語]] — Haskell は IO Monad で副作用を管理
