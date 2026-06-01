---
title: 定理証明
tags: [formal-methods, computer-science]
created_at: 2026-05-01
updated_at: 2026-05-31T21:32:46+09:00
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

## 主要な定理証明系の比較

| 系 | 基盤論理 | スタイル | 自動 / 対話 | 主用途・特色 |
|---|---|---|---|---|
| **Coq** | CIC（Calculus of Inductive Constructions, [[dependent-type\|依存型]]） | tactic 言語 Ltac で証明を組む | 対話中心（`auto`/`lia`/`omega` 等の局所自動あり） | CompCert（検証済み C コンパイラ）、四色定理。プログラム**抽出**で OCaml/Haskell を生成 |
| **Lean**（Lean 4） | CIC ベースの依存型 | tactic + 関数型言語そのもの（Lean 4 は自身を Lean で実装） | 対話 + 強力な `simp`/`decide`/型クラス自動化 | mathlib による巨大な現代数学形式化。数学者コミュニティで急成長 |
| **Agda** | Martin-Löf 型理論（依存型） | **証明を直接プログラムとして書く**（tactic を基本使わない） | ほぼ対話・手動（dependent pattern match） | 型理論の研究・教育。Haskell 風構文。証明 = 全域関数 |
| **Isabelle/HOL** | **高階論理 (HOL)**（依存型ではない） | Isar（人間可読な宣言的証明）+ tactic | **自動化が最強**: `auto`/`blast`/Sledgehammer が外部 ATP・SMT を呼ぶ | seL4（検証済み OS マイクロカーネル）。大規模で実務的な証明に強い |

軸の読み方:

- **基盤論理の二分** — Coq/Lean/Agda は**依存型（型 = 命題）**。証明項そのものが型検査される（カリー=ハワード直系）。Isabelle/HOL は**高階論理**で、証明と項が分離している。前者は「証明 = プログラム」で抽出に向き、後者は論理が単純な分**自動化を載せやすい**。
- **証明の書き方** — Agda は証明を裸の関数として書く（最も型理論に忠実だが手厚い）。Coq/Lean は tactic でゴールを後ろ向きに崩す。Isabelle は Isar で「人間が読める証明」を書ける。

## 自動証明 vs 対話証明

定理証明の労力を左右する最大の軸:

| | 自動証明（automated） | 対話証明（interactive, ITP） |
|---|---|---|
| 誰が証明を進めるか | ソルバ・ATP が探索 | 人間が tactic / 証明項で指示 |
| 代表 | SMT（Z3）、ATP（E, Vampire）、SAT | Coq, Lean, Agda, Isabelle |
| 扱える論理 | 決定可能 / 半決定可能な断片 | 高階・依存型まで任意 |
| 長所 | 人手ゼロ、速い | 任意の深い定理を証明できる |
| 短所 | 表現力が限定、unknown/発散 | 証明が長大、専門知識が要る |

両者は**対立でなく協調**するのが現代的: Isabelle の **Sledgehammer** はゴールを外部 ATP/SMT に投げて自動で片付け、当たれば証明を Isar に逆輸入する。[[refinement-type|篩型]]（Liquid Haskell/F*）は「決定可能な部分は SMT に丸投げ、残りだけ人間」という思想で、**自動証明を型システムに組み込んだ**形。対話証明系の中に自動証明エンジンを埋め込み、人間は「どこを自動に任せどこを手で示すか」を設計する。

## 主要な定理証明系（要点）

- **Coq** — 最も歴史のある証明支援系。CIC に基づく。CompCert・プログラム抽出
- **Lean** — 数学者コミュニティで急速に普及中。mathlib が巨大な数学ライブラリ
- **Agda** — Haskell 風構文の[[dependent-type|依存型]]言語。証明を直接関数として書く
- **Isabelle/HOL** — 高階論理ベースで自動化が最強。Sledgehammer・seL4 検証

## 押さえどころ（カード化候補）

- **定理証明とは** → 「すべての入力で正しい」を証明として書き、型チェッカーが機械的に検証する形式手法。`Qed` でコンパイラが証明を検査する。テストの「たぶん正しい」を超える。
- **基盤論理の二分** → Coq/Lean/Agda は依存型(型 = 命題、証明 = プログラム、抽出向き)。Isabelle/HOL は高階論理(証明と項が分離、論理が単純な分**自動化を載せやすい**)。
- **証明スタイル** → Agda は証明を裸の関数で書く、Coq/Lean は tactic でゴールを崩す、Isabelle は Isar で人間可読な宣言的証明。
- **自動 vs 対話** → 自動(SMT/ATP)は人手ゼロだが決定可能断片に限定。対話(ITP)は任意の深い定理を扱えるが証明が長大。対立でなく協調する。
- **協調の実例** → Isabelle の Sledgehammer は外部 ATP/SMT に投げて自動で片付ける。篩型(Liquid Haskell/F*)は自動証明を型システムに組み込んだ形。人間は「どこを自動に任せるか」を設計する。

## 関連

- [[formal-methods|形式手法]] — 定理証明はその最強保証・高コストの一手法。無限状態も全入力で扱える
- [[model-checking|モデル検査]] — 証明を書く代わりに有限状態を全探索する自動手法。網羅は自動だが状態爆発・無限状態に弱い
- [[curry-howard|カリー=ハワード同型対応]] — 「型=命題、プログラム=証明」。Coq/Lean/Agda の依存型基盤がこの対応を体現
- [[dependent-type|依存型]] — Coq/Lean/Agda の型システム基盤。Isabelle/HOL だけは依存型でなく高階論理
- [[refinement-type|篩型]] — 自動証明(SMT)を型に組み込んだ軽量版。決定可能な部分を人手の対話証明から解放する
- [[safety-critical-certification|安全臨界ソフトウェア認証]] — DO-333 で機械証明を認証エビデンスにできる。Almide は Perceus を Lean 4 で証明
