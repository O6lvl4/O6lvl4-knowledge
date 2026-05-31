---
title: TAPL
tags: [type-theory, computer-science, book]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:07+09:00
---

"Types and Programming Languages" (Benjamin C. Pierce, 2002)。型理論とプログラミング言語の理論を学ぶ定番の教科書。

## プログラマ向けの一言

**「型とは何か」を数学的に厳密に理解するための本。** 型チェッカーがどう動いているか、なぜ型システムがプログラムの正しさを保証できるのか、を基礎から構築する。

## 内容の構成

```ts
// Part I: 型なしの世界
// - 型なしλ計算: (x) => ... だけの世界
// - 操作的意味論: プログラムの「実行」を数学的に定義
// → λ計算、簡約 の基礎

// Part II: 単純型
// - 単純型付きλ計算: 関数に型をつける
// - 型安全性の証明: progress + preservation
// → 「型が通るプログラムは実行時にクラッシュしない」を証明

// Part III: サブタイピング
// - { name: string, age: number } は { name: string } のサブタイプ
// - TypeScript の構造的型付けの理論的基盤

// Part IV: 再帰型
// - type List = null | { head: number, tail: List }
// - 自分自身を参照する型の扱い

// Part V: 多相型
// - ジェネリクス: <T>(x: T) => T
// - System F: 型変数を含むλ計算

// Part VI: 高階の型
// - 型を受け取って型を返す「型コンストラクタ」
// - Array<T> の Array の部分
```

## 中心概念: 型安全性

```ts
// TAPL が証明する最も重要な定理:

// Progress: 型が通るプログラムは「詰まらない」
// → 値であるか、もう一歩計算を進められるか、のどちらか
// → undefined is not a function は起きない

// Preservation: 計算を一歩進めても型は保たれる
// → number 型の式を評価したら結果も number
// → 計算の途中で型が壊れない

// Progress + Preservation = 型安全性 (Type Safety)
// 「型が通るプログラムは、実行時に型エラーで止まらない」
```

## 押さえどころ（カード化候補）

- TAPL とは → Pierce の "Types and Programming Languages" (2002)。型チェッカーの仕組みと型システムが正しさを保証する理由を基礎から構築する定番教科書
- 構成の流れ → 型なしλ計算 → 単純型 → サブタイピング → 再帰型 → 多相型(System F) → 高階の型、と段階的に表現力を上げていく
- Progress → 型が通る式は値であるか、もう一歩計算を進められるかのどちらか。「詰まらない」（undefined is not a function が起きない）
- Preservation → 一歩計算を進めても型は保たれる。計算の途中で型が壊れない
- 型安全性 → Progress + Preservation = 型が通るプログラムは実行時に型エラーで止まらない、という TAPL 中心の定理

## 関連する概念とページ

TAPL で扱われるトピックの多くがこの knowledge base にある:

- [[lambda-calculus|λ計算]] — TAPL の出発点
- [[reduction|簡約]] — λ計算の計算規則
- [[inference-rules|推論規則]] — 型システムの定義方法
- [[curry-howard|カリー=ハワード同型対応]] — 型と論理の対応
- [[adt-gadt|ADT / GADT]] — 代数的データ型
- [[intuitionistic-logic|直観主義論理]] — 型と論理の対応の論理側
- [[dependent-type|依存型]] — TAPL の先にある話題
- [[refinement-type|篩型]] — TAPL の先にある話題
- [[polymorphism|ポリモーフィズム]] — System F（parametric 多相）は TAPL の主要トピック
- [[bidirectional-typing|双方向型検査]] — 型検査器を実装する際の中心技法
