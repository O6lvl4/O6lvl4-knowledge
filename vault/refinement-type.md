---
title: 篩型
tags: [type-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-18
---

既存の型に述語（条件）を付加して絞り込む型。Refinement type。

## プログラマ向けの一言

**`number` じゃなくて「0より大きい number」を型にする。** バリデーションをランタイムではなくコンパイル時にやる。

## コードで理解する

```ts
// --- 普通の TypeScript ---
function divide(a: number, b: number): number {
  return a / b; // b が 0 だったら？ → Infinity → バグ
}

// --- 篩型があれば ---
// type NonZero = { x: number | x !== 0 }
// function divide(a: number, b: NonZero): number
// → divide(10, 0) はコンパイルエラー

// TypeScript でブランド型を使って近似:
type NonZero = number & { readonly __brand: "NonZero" };

function toNonZero(n: number): NonZero {
  if (n === 0) throw new Error("zero!");
  return n as NonZero; // ランタイムチェックで「証明」する
}

function divide(a: number, b: NonZero): number {
  return a / b; // 安全。b は 0 でないことが型で保証されている
}

divide(10, toNonZero(3)); // OK
// divide(10, 0);          // コンパイルエラー（number !== NonZero）
```

## 篩型 vs 依存型

```ts
// 依存型:  型の中で任意の計算ができる
//          Vec<number, n+m>  ← 型の中で足し算
//
// 篩型:    既存の型に条件を付けるだけ（計算はしない）
//          { x: number | x > 0 }  ← 条件を付けるだけ
//
// 篩型は依存型の「お手軽版」
// 推論しやすく、既存の言語に組み込みやすい
```

## 実在する篩型の実装

```ts
// Liquid Haskell: Haskell に篩型を追加
// {-@ divide :: Int -> {v:Int | v /= 0} -> Int @-}
// divide a b = a `div` b
// → b に 0 を渡すと SMT ソルバがコンパイル時に検出

// F* (F Star): 篩型 + 依存型を持つ言語
// val divide : int -> b:int{b <> 0} -> int

// TypeScript の Zod / io-ts:
// ランタイム篩型（コンパイル時ではなく実行時にチェック）
// const Positive = z.number().positive();
// type Positive = z.infer<typeof Positive>;
```

## 関連

- [[dependent-type|依存型]] — 篩型はその軽量版
- [[phantom-type|幽霊型]] — 型レベルで状態を追跡する別の手法
- [[formal-methods|形式手法]] — 篩型は軽量な形式検証
