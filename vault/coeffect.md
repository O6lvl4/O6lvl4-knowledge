---
title: Coeffect
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-31T10:57:33+09:00
---

Effect の双対概念。Effect が「計算が**外界に及ぼす**作用（出力側）」を型で追うのに対し、Coeffect は「計算が**文脈・環境・資源に要求する**もの（入力側）」を追う。Tomas Petricek の "Coeffects: A calculus of context-dependent computation" が出典。

## Effect と Coeffect

| | Effect | Coeffect |
|---|---|---|
| 向き | 計算 → 外界（出力で何を起こすか） | 文脈 → 計算（入力に何を要求するか） |
| 例 | IO、状態変更、例外、非決定 | 変数の使用回数、必要なケイパビリティ、暗黙パラメータ、データのプライバシ階級、過去フレーム（ストリームの window） |
| 型のモデル | [[monad\|モナド]] / graded monad | [[comonad\|コモナド]] / graded comonad |
| 添字の意味 | 起こりうる作用の集合 | 要求する資源・文脈の量 |

## graded（添字付き）modal type

資源量を型に持ち上げる: `□_r A`（資源 `r` のもとで `A`）。線形型・アフィン型（使用回数 0/1/n の追跡）はこの特殊形。研究言語 **Granule** が graded modal types で coeffect を一級に扱う。

### 型付けの小例（使用回数の追跡）

grade を「使用回数」を表す半環 `(ℕ, +, ·, 0, 1)` から取り、`[A] r`（= `□_r A`）を「`A` を `r` 回使える」と読む。各規則は「前提 ⟹ 結論」で読む：

| 規則 | 前提 | 結論 |
|---|---|---|
| `var` | （なし） | `x :[1] A ⊢ x : A`（使用1回を消費） |
| `promote`（r 倍） | `Γ ⊢ e : A` | `r·Γ ⊢ [e] : [A] r`（文脈の grade を r 倍） |

文脈の grade は**加算で合流**する。関数 `dup` は引数 `x` を2回使うので grade 2 を要求する：

```granule
-- x を本体で 2 回使うので、型は [A] 2 を要求する
dup : forall {a : Type} . a [2] -> (a, a)
dup [x] = (x, x)        -- OK: x を 2 回消費 → ちょうど grade 2

-- discard : 0 回使用（アフィンに捨てる）
drop : forall {a : Type} . a [0] -> ()
drop [_] = ()
```

`dup` に `a [1]`（1回しか使えない値）を渡すと grade 不足で**型エラー**になる。grade の半環を取り替えれば、使用回数だけでなく「機密レベル（security lattice）」「必要権限の集合」「過去フレーム数（ストリーム window）」も同じ規則系で追跡できる。

## なぜ重要か

「このコードは何を**必要とするか**」を型で静的に保証できる。例えば「この関数は変数 x を高々1回しか使わない」「この計算は GPS 権限を要求する」「この値は機密レベル2を要求する」を型レベルで追跡し、リソース安全性・情報フロー制御・線形性を一様な枠組みで扱える。Effect system（できること）と Coeffect system（要ること）は補完的。

## 押さえどころ（カード化候補）

- **Coeffect とは** → Effect の双対。Effect が「計算が外界に及ぼす作用（出力側）」を追うのに対し、Coeffect は「計算が文脈・資源に要求するもの（入力側）」を追う。出典は Petricek の coeffect calculus。
- **型のモデル** → Effect は [[monad|モナド]] / graded monad、Coeffect は [[comonad|コモナド]] / graded comonad。添字は要求する資源・文脈の量。
- **graded modal type** → `□_r A`（資源 `r` のもとで `A`）。grade は半環から取り、文脈で加算合流する。線形型・アフィン型は使用回数を grade にした特殊形。
- **半環を取り替えると一般化** → 使用回数 (ℕ)、機密レベル (security lattice)、必要権限の集合、ストリーム window 数を**同一の規則系**で追跡できる。研究言語は Granule。
- **なぜ重要か** → 「このコードは何を必要とするか」を型で静的に保証。リソース安全性・情報フロー制御・線形性を一様に扱える。Effect（できること）と相補的。

## 関連

- [[comonad|Comonad]] — coeffect system の型を与える構造
- [[algebraic-effects|Algebraic Effects]] — 双対の相手。effect（出力）↔ coeffect（入力）
- [[monad|Monad]] — effect 側のモデル。graded monad の双対が graded comonad
- [[dependent-type|依存型]] — 型に値・量の情報を載せる点で隣接
