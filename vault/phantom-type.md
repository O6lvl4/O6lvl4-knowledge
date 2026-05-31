---
title: 幽霊型
tags: [type-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:07+09:00
---

実行時には存在しないが、コンパイル時に型の区別として機能する型パラメータ。Phantom type。

## プログラマ向けの一言

**型引数を「タグ」として使って、誤った組み合わせをコンパイルエラーにする。** 実行時のコストはゼロ。

## コードで理解する

```ts
// 問題: 通貨を混ぜるバグ
const priceJPY = 1000;
const priceUSD = 10;
const total = priceJPY + priceUSD; // 1010 ← 円とドルを足してしまった！

// 幽霊型で防ぐ
type JPY = { readonly __currency: "JPY" };
type USD = { readonly __currency: "USD" };
type Money<Currency> = number & Currency;

function jpy(amount: number): Money<JPY> { return amount as Money<JPY>; }
function usd(amount: number): Money<USD> { return amount as Money<USD>; }

function addMoney<C>(a: Money<C>, b: Money<C>): Money<C> {
  return (a + b) as Money<C>;
}

addMoney(jpy(1000), jpy(500));  // OK: Money<JPY>
addMoney(usd(10), usd(5));     // OK: Money<USD>
// addMoney(jpy(1000), usd(10)); // コンパイルエラー！ JPY と USD は混ぜられない
```

## 状態マシンを型で表現

```ts
// ファイルの open/close を型で管理
type Open = { readonly __state: "open" };
type Closed = { readonly __state: "closed" };
type FileHandle<State> = { fd: number } & State;

function openFile(path: string): FileHandle<Open> {
  return { fd: 1 } as FileHandle<Open>;
}
function readFile(file: FileHandle<Open>): string {
  return "data";  // Open なファイルからだけ読める
}
function closeFile(file: FileHandle<Open>): FileHandle<Closed> {
  return { fd: file.fd } as FileHandle<Closed>;
}

const f = openFile("/tmp/test");
readFile(f);                    // OK
const closed = closeFile(f);
// readFile(closed);            // コンパイルエラー！ Closed なファイルは読めない
```

## なぜ「幽霊」か

```ts
// 型パラメータ Currency / State は実行時にはどこにも存在しない
// number はただの number。__currency プロパティは as でキャストしただけ
// コンパイル後の JS には型情報が消える → ランタイムコスト = ゼロ
// 型としてだけ存在し、実行時には「幽霊」のように消える → 幽霊型
```

## 押さえどころ（カード化候補）

- 幽霊型とは → 実行時には存在せず、型引数を「タグ」として使い誤った組み合わせをコンパイルエラーにするテクニック。ランタイムコストはゼロ
- 通貨ミックス防止 → Money&lt;JPY&gt; と Money&lt;USD&gt; を型で分離し、addMoney&lt;C&gt;(a, b) で同一通貨同士のみ加算可。円とドルの足し算がコンパイルエラーに
- 状態マシンの型表現 → FileHandle&lt;Open&gt;/FileHandle&lt;Closed&gt; で状態遷移を型化。readFile は Open のみ受け、closeFile が Closed を返すので Closed の読み取りを禁止できる
- なぜ「幽霊」か → 型パラメータは number に as でキャストしただけで JS には型情報が消える。型としてだけ存在し実行時に消える

## 関連

- [[dependent-type|依存型]] — 型パラメータに値を入れる本格版
- [[refinement-type|篩型]] — 条件を型に付ける別のアプローチ
- [[adt-gadt|ADT / GADT]] — GADT は幽霊型をより型安全に扱える
