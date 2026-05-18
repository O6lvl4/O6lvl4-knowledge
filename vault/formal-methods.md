---
title: 形式手法
tags: [formal-methods, computer-science]
---

数学的な手法でソフトウェアの正しさを保証する技術の総称。

## プログラマ向けの一言

**テストは「バグがある」ことを示せるが、「バグがない」ことは示せない。形式手法は「バグがない」ことを数学的に証明する。**

## テストとの違い

```ts
// テスト: 有限個の入力を試す
test("add", () => {
  expect(add(1, 2)).toBe(3);
  expect(add(0, 0)).toBe(0);
  expect(add(-1, 1)).toBe(0);
  // ...でも全部の入力は試せない
});

// 形式手法: 「すべての入力に対して」正しいことを証明する
// ∀ x, y ∈ Int: add(x, y) === x + y
// これはテストでは不可能。数学的証明が必要。
```

## 3つのアプローチ

```ts
// 1. 定理証明 (Theorem Proving)
// 「この関数は仕様を満たす」ことを人間が証明を書いて示す
// → 詳細は [[theorem-proving|定理証明]] を参照

// 2. モデル検査 (Model Checking)
// 状態を全探索して「違反がないか」を自動で調べる
// → 詳細は [[model-checking|モデル検査]] を参照

// 3. 型による検証
// プログラマにとって最も身近な形式手法
// TypeScript の型システムも（限定的な）形式検証

function divide(a: number, b: number): number {
  return a / b; // b === 0 のとき？ → 型では防げない
}

// より強い型（篩型）があれば:
// function divide(a: number, b: NonZero<number>): number
// → コンパイル時に b !== 0 を保証
// → 詳細は [[refinement-type|篩型]] を参照
```

## 実用されている場所

```ts
// 形式手法は「ミスが許されない」領域で使われている:
// - AWS:   S3, DynamoDB の分散プロトコルを TLA+ でモデル検査
// - 航空:  Airbus のフライト制御ソフトウェア
// - 暗号:  TLS 1.3 のプロトコル検証
// - CPU:   Intel の浮動小数点演算の検証（Pentium バグの再発防止）
// - 鉄道:  パリ地下鉄の自動運転システム

// プログラマにとって身近な例:
// - TypeScript の型チェック
// - Rust の借用チェッカー
// - Property-based testing（fast-check 等）← テストと形式手法の中間
```

## 関連

- [[theorem-proving|定理証明]] — 人間が証明を書くアプローチ
- [[model-checking|モデル検査]] — 機械が全探索するアプローチ
- [[dependent-type|依存型]] — 型で仕様を表現する
- [[refinement-type|篩型]] — 値の制約を型で表現する
