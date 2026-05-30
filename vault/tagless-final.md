---
title: Tagless Final
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T19:30:00+09:00
---

埋め込み DSL（と副作用プログラム）を、操作を **データ構築子ではなく、結果表現の型でパラメータ化した型クラス/インターフェースのメソッド**として表現する技法。解釈＝インタプリタが「型クラスのインスタンス」になる。Carette・Kiselyov・Shan「Finally Tagless, Partially Evaluated」(2007) が出典。

## 名前の由来 — 「tagless」と「final」

- **final（終）**: DSL を「畳み込みで評価する関数表現」で持つ流儀（Church/Böhm–Berarducci エンコーディング）。対義は **initial（始）= [[adt-gadt|ADT/GADT]] で項を作りインタプリタで畳む**流儀
- **tagless（タグ無し）**: 型付き DSL を単一の ADT に埋めると、項に型タグ（または GADT）が要り、インタプリタは部分的なパターンマッチでタグ検査をする。final encoding は **ホスト言語の型システムをそのまま使う**ので、項が最初から型付きホスト式になり、タグが消える

## 形（Haskell）

操作を型クラスで宣言し、各インタプリタをインスタンスとして与える。

```haskell
class ExprSym repr where
  lit :: Int -> repr Int
  add :: repr Int -> repr Int -> repr Int

-- 項は多相: 「ExprSym のどれか」を要求するだけで AST は無い
term :: ExprSym repr => repr Int
term = add (lit 1) (lit 2)

-- インタプリタ = インスタンス（評価）
newtype Eval a = Eval { runEval :: a }
instance ExprSym Eval where
  lit n            = Eval n
  add (Eval a) (Eval b) = Eval (a + b)

-- 別解釈 = 別インスタンス（整形）
newtype Pretty a = Pretty { runPretty :: String }
instance ExprSym Pretty where
  lit n            = Pretty (show n)
  add a b          = Pretty (runPretty a ++ " + " ++ runPretty b)
```

`term` はどのインスタンスを選ぶかで評価にも整形にもなる。**同じ項に複数の解釈**を与えられる。

## Scala / 副作用での tagless-final（実務での主流）

能力（capability）を型クラスにし、プログラムを **作用型 `F[_]` で抽象**する。

```scala
trait Console[F[_]] { def putStrLn(s: String): F[Unit]; def readLn: F[String] }

def prog[F[_]: Console: Monad]: F[Unit] = ...   // F は IO でもテスト用 State でも

```

`F` を本番は `IO`、テストは `State`/`Writer` に差し替えられる。cats 系で「tagless-final スタイル」と言えば通常これ。

## Initial vs Final

| | Initial（[[adt-gadt\|ADT/GADT]] + インタプリタ） | Final（型クラス） |
|---|---|---|
| 項の表現 | データ構築子 | メソッド/インスタンス |
| インタプリタ | fold / パターンマッチ | 型クラスのインスタンス |
| **操作の追加** | ADT と全インタプリタを改修 | 新しい型クラスを足すだけ |
| **解釈の追加** | fold 関数を足す | 新しいインスタンスを足す |
| AST の検査/変換 | 容易（データがある） | 困難（具体 AST が無い） |
| 型付き項の安全性 | tagless にするには GADT が要る | ホスト型をそのまま使える |

両軸（操作の追加・解釈の追加）を型クラスの分割で広げられ、**表現問題（expression problem）**への一つの解になる。

## Free モナドとの対比

[[monad|Free モナド]]＝作用の **initial encoding**（AST を組んで後で解釈）。tagless-final＝ **final encoding**（AST を作らず直接 `F` へ）。

- **Free**: プログラムを値として **reify** でき、検査・最適化・複数パス変換が可能。代償は AST のアロケーションと間接化
- **Final**: AST を作らない分 **軽量・インライン化が効き高速**。代償は **プログラムを覗けない/書き換えにくい**

## 利点と弱点

- 利点: タグ不要、解釈を後付け拡張可能、同一項の多重解釈、作用型の抽象、中間 AST が無く高性能、ホストの型システムを活用
- 弱点: プログラムの内省/変換が難しい（具体 AST 不在）、抽象が重くなりがち、型エラーが難解、操作×インタプリタが増えるとインスタンスが膨れる

## なぜ効くか

本質は **Church/Böhm–Berarducci エンコーディング**（任意の ADT は「その畳み込み関数」として表せる）を型付き DSL に適用したもの。データとして持つ代わりに「解釈の仕方」をそのまま値にするので、始代数（データ）と終象（解釈）の[[duality|双対]]として initial/final が対になる。

## 関連

- [[adt-gadt|ADT / GADT]] — initial encoding 側。tagless にするには GADT が要る点が出発点
- [[monad|Monad]] — Free モナド（initial）との対比、`F[_]` 抽象の土台
- [[algebraic-effects|Algebraic Effects]] — 作用を扱う別アプローチ（ハンドラ＝解釈の差し替え）
- [[duality|双対]] — initial（始代数）と final（終）の対
- [[pure-functional-programming|純粋関数型言語]] — Haskell/Scala でのDSL・作用抽象の文脈
- [[polymorphism|ポリモーフィズム]] — 型クラス＝ad-hoc 多相。tagless-final はその応用
- [[partial-evaluation|部分評価]] — 原論文 "Partially Evaluated"。解釈を特化して高速化

## Links

- Carette, Kiselyov, Shan, "Finally Tagless, Partially Evaluated: Tagless Staged Interpreters for Simpler Typed Languages" (JFP 2009)
