---
title: 篩型
tags: [type-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:32:46+09:00
---

既存の型に述語（条件）を付加して絞り込む型。Refinement type。基底型 `b` と述語 `p` から `{v:b | p(v)}`（「`p` を満たす `b` の値」）を作る。

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

## SMT ソルバが検証を回す仕組み

篩型が「お手軽」なのは、述語が **decidable な論理の素片**（線形算術・等式・配列・未解釈関数など、まとめて EUFA や QF_UFLIA と呼ばれる量化子なし一階理論）に閉じていて、その充足可能性を **SMT ソルバ（Z3 等）が自動で判定できる**から。人間が証明を書く [[theorem-proving|定理証明]] と違い、**証明義務（VC, verification condition）の放電が自動化**される。

流れはこう:

1. **VC 生成** — 型検査器が各部分式に対し「この値は本当に述語を満たすか」を含意式に落とす。例: `divide a b` で `b : {v:Int | v /= 0}` を要求する箇所に、呼び出し側が `b = 0` でないことを示す含意 `Γ ⊢ (呼び出し文脈の事実) ⇒ b /= 0` を生成。
2. **SMT へ投げる** — その含意の**否定**が unsat（充足不能）なら含意は恒真 = 型は通る。sat なら反例（`b = 0` のような割り当て）が返り、**型エラー**になる。
3. **subtyping = 含意** — 篩型の部分型関係 `{v:b | p} <: {v:b | q}` は「`p ⇒ q` が恒真」と定義される。サブタイプ判定がまるごと SMT クエリになる。

```haskell
{-@ type Pos = {v:Int | v > 0} @-}
{-@ incr :: Pos -> Pos @-}
incr x = x + 1
-- VC: x > 0 ⇒ x + 1 > 0  → 否定 (x > 0 ∧ x + 1 <= 0) は線形算術で unsat → OK
```

## 篩型 vs 依存型 vs 単純型

| 軸 | 単純型 | 篩型 (Refinement) | 依存型 (Dependent) |
|---|---|---|---|
| 表現できること | `Int`, `Int -> Int` | `{v:Int \| v > 0}`（基底型 + 述語） | `Vec n a`（型が値を計算に使う） |
| 述語の言語 | なし | **decidable 断片**（線形算術・等式・配列…） | 任意の項（チューリング完全な計算） |
| 検証の担い手 | 構文的な型一致 | **SMT ソルバが自動**で含意を判定 | 人間 or tactic が**証明を構築** |
| 自動化 | 完全 | ほぼ自動（注釈は必要） | 一般に手動（証明義務が残る） |
| 決定可能性 | 決定可能 | 述語を decidable 断片に保てば決定可能 | 一般に**決定不能** |
| 表現力 | 低 | 中 | 高 |
| 代表 | Java, Go の型 | Liquid Haskell, F*, Refinement Reflection | Idris, Agda, Coq, Lean |

要点: 篩型は依存型から「型の中で値を計算する」力を**意図的に削り**、述語を SMT が判定できる範囲に絞ることで自動化と既存言語への組み込みやすさを得た**スイートスポット**。F* のように両方を持つ言語もあり、その場合 SMT で落ちる部分は篩型として、落ちない部分は対話証明として扱う。

## 実在する篩型の実装

```haskell
-- Liquid Haskell: GHC のコメント注釈 {-@ ... @-} で篩を書く。SMT で検証。
{-@ divide :: Int -> {v:Int | v /= 0} -> Int @-}
divide :: Int -> Int -> Int
divide a b = a `div` b
-- divide 10 0  → SMT が 0 /= 0 を反証できず、コンパイル時に型エラー
```

```fsharp
// F* (F Star): 篩型 + 依存型。SMT(Z3) を後ろで使う。
val divide : int -> b:int{b <> 0} -> int
let divide a b = a / b
```

```ts
// TypeScript の Zod / io-ts: ランタイム篩型。コンパイル時ではなく
// パース時に述語を実行し、通れば「ブランド付き」型に絞り込む(parse, don't validate)。
const Positive = z.number().positive();   // 述語 .positive() = x > 0
type Positive = z.infer<typeof Positive>; // = number（型レベルでは素の number）
Positive.parse(-1); // ← 実行時に ZodError。静的には防げない
```

注意: Zod / io-ts は**静的な篩型ではない**。述語は実行時にしか効かず、型レベルでは `number` のまま。コンパイル時保証が欲しいなら Liquid Haskell / F* のように SMT を回す処理系が要る。Zod の価値は「外界との境界（API 入力・env）で一度だけ検証し、以降は型で運ぶ」点にある。

## トレードオフ

篩型は強力だが無料ではない:

- **注釈コスト** — 関数境界・データ型のフィールド・不変条件に篩注釈を書く必要がある。推論は基底型までで、述語は基本的に人間が宣言する（Liquid Haskell には局所的な refinement inference があるが万能ではない）。
- **SMT の限界（決定不能領域に触れると詰む）** — 述語に非線形算術（`x * y > 0` の一般形）や量化子（`forall`）を入れると、SMT は **unknown を返す**か発散しうる。`x mod 7` のような演算も理論次第で苦手。実務では「決定可能な断片に述語を抑える」スキルが要る。
- **エラーの不透明さ** — 反例が SMT 内部の変数割り当てで返り、ソース上のどの仮定が足りないか分かりにくい。補助的な補題（lemma）や `assert` で SMT を導く必要が出る。
- **証明の脆さ** — コードを少し変えると今まで通っていた VC が落ちることがある（SMT のヒューリスティクス依存）。再現性のために `--timeout` や seed 固定が要る場面もある。
- **適用範囲** — 「値の範囲・整合性」には強いが、「停止性」「複雑な代数的性質」は依存型/定理証明の領域。篩型はそこへ手を伸ばすと自動化の利点を失う。

→ position: テストより強く、依存型より軽い。**「自動化された軽量検証」が欲しいときの第一候補**。

## 押さえどころ（カード化候補）

- **篩型とは** → 基底型 `b` に述語 `p` を付けて `{v:b | p(v)}` に絞り込む型。`number` ではなく「0 より大きい number」を型にする。バリデーションをランタイムからコンパイル時へ。
- **SMT が検証を回す** → 型検査器が各箇所で証明義務(VC)を含意式に落とし、その否定を SMT ソルバ(Z3 等)へ投げる。unsat なら型 OK、sat なら反例付き型エラー。サブタイプ判定 `{v|p}<:{v|q}` は「`p⇒q` 恒真」= まるごと SMT クエリ。
- **依存型との違い** → 篩型は述語を decidable 断片(線形算術・等式・配列)に**意図的に制限**し検証を自動化。依存型は型の中で任意計算ができる代わりに一般に証明義務が人手に残る。篩型 = 自動化を取った依存型のスイートスポット。
- **実装の三者** → Liquid Haskell(`{-@ @-}` 注釈 + SMT)、F*(篩型 + 依存型、Z3 後ろ)、Zod/io-ts(**ランタイム**篩型で静的保証なし、型は素の `number` のまま)。
- **トレードオフ** → 注釈コスト、非線形算術・量化子で SMT が unknown/発散、反例の不透明さ、コード変更で VC が脆く落ちる。「決定可能な断片に述語を抑える」のが実務スキル。

## 関連

- [[dependent-type|依存型]] — 篩型はその軽量版。述語を SMT が判定できる断片に絞った代わりに検証を自動化した
- [[phantom-type|幽霊型]] — 型レベルで状態を追跡する別の手法。述語ではなくタグで不変条件を運ぶ（SMT 不要だが表現力は低い）
- [[formal-methods|形式手法]] — 篩型は SMT 自動化により「テストより強く依存型より軽い」位置を占める軽量形式検証
- [[theorem-proving|定理証明]] — 証明義務を人手で放っていた所を SMT に自動放電させたのが篩型。F* は両者を併用
