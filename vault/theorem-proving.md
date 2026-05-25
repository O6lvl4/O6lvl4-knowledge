---
title: 定理証明
tags: [formal-methods, computer-science]
created_at: 2026-05-01
updated_at: 2026-05-19
---

[[formal-methods|形式手法]]の一種。プログラムの性質を数学的に証明する。

## プログラマ向けの一言

**「この関数は絶対にバグらない」をコンパイラに検証させる。** 証明もコードで書き、型チェッカーが証明の正しさを機械的に検証する。

## コードで理解する

```ts
// 普通のプログラミング: テストで「たぶん正しい」
function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}
// test: reverse(reverse([1,2,3])) === [1,2,3]  ← この入力では正しい
// でも「すべての入力で reverse(reverse(x)) === x」は示せない

// 定理証明: 「すべての入力で正しい」ことを証明する
// TypeScript では書けないが、概念を示すと:

// 命題: ∀ xs. reverse(reverse(xs)) === xs
// 証明:
//   base case: reverse(reverse([])) = reverse([]) = []  ✓
//   inductive step:
//     reverse(reverse(x :: xs))
//     = reverse(reverse(xs) ++ [x])    ← reverse の定義
//     = x :: reverse(reverse(xs))      ← 補題
//     = x :: xs                        ← 帰納法の仮定
//   QED

// この証明をコードとして書いて、コンパイラが検証するのが定理証明系
```

## 定理証明系の例

```coq
-- Coq (Gallina) での証明の雰囲気:
Theorem rev_involutive : forall (A : Type) (l : list A),
  rev (rev l) = l.
Proof.
  induction l as [| x xs IH].
  - simpl. reflexivity.
  - simpl. rewrite rev_app_distr. simpl. rewrite IH. reflexivity.
Qed.
(* Qed でコンパイラが証明を検証し、正しければ通る *)
```

## 主要な定理証明系

- **Coq** — 最も歴史のある証明支援系。[[curry-howard|カリー=ハワード対応]]に基づく
- **Lean** — 数学者コミュニティで急速に普及中。mathlib が巨大な数学ライブラリ
- **Agda** — Haskell 風の構文を持つ[[dependent-type|依存型]]言語
- **Isabelle/HOL** — 自動化が強い。高階論理ベース

## 関連

- [[formal-methods|形式手法]] — 定理証明はその一手法
- [[model-checking|モデル検査]] — 証明を書く代わりに全探索する手法
- [[curry-howard|カリー=ハワード同型対応]] — 「型=命題、プログラム=証明」
- [[dependent-type|依存型]] — 定理証明系の型システムの基盤
