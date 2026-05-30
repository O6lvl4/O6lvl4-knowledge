---
title: Hindley–Milner 型推論
tags: [type-theory, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-30T20:40:00+09:00
---

ML / Haskell 系の古典的型推論。**型注釈なしで最も一般的な型（principal type）を一意に自動導出**する。実装の代表が **Algorithm W**（Damas–Milner, 1982）。[[polymorphism|parametric 多相]]に **let 多相** を足した体系。

## 仕組み

1. 各部分式に**型変数**を割り当てる
2. 構文から**制約（等式）**を集める
3. **単一化（unification, Robinson）**で制約を解き、代入（substitution）を得る

```
let id = \x -> x in (id 1, id True)
-- id :: ∀a. a -> a に一般化され、各使用箇所で a を Int / Bool に具体化
```

## let 多相（核心）

- **generalize** — `let` 束縛で、環境に縛られない型変数を `∀` で量化
- **instantiate** — 使用箇所で `∀` を新しい型変数に置き換える

これにより同じ `id` を `Int` にも `Bool` にも使える。λ束縛の引数は一般化されない（単相）点が要。

## principal type の保証

HM では「最も一般的な型が必ず一意に存在する」（完全性）。だから人間が注釈を書かなくても、コンパイラが過不足ない型を決められる。

## 限界

ランクN多相・部分型・GADT・[[higher-kinded-types|HKT]]・[[refinement-type|篩型]]では完全推論が決定不能・困難になり、[[bidirectional-typing|双方向型検査]]や明示注釈が要る。現代の実装は substitution ベースの W から、**制約生成と求解を分離**した方式（HM(X), GHC の OutsideIn(X)）へ。

## 関連

- [[polymorphism|ポリモーフィズム]] — HM は parametric 多相＋let 多相の推論
- [[bidirectional-typing|双方向型検査]] — HM が破綻する高機能型での代替
- [[inference-rules|推論規則]] — HM は型付け規則＋単一化で定義される
- [[tapl|TAPL]] — 型推論の理論的土台
