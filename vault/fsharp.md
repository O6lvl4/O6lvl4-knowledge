---
title: F#
tags: [language, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:46:00+09:00
---

.NET 上の**関数型優先（functional-first）**言語（2005, Don Syme / Microsoft Research）。[[ocaml|OCaml]] の系譜（ML ファミリ）を .NET に持ち込んだもの。純粋ではないが、既定が不変・式指向。

## 型と設計

- **[[hindley-milner|Hindley–Milner 型推論]]** — 注釈をほぼ書かずに静的型が付く
- **判別共用体（[[adt-gadt|ADT]]）＋レコード＋パターンマッチ** — [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]]ドメインモデリングが文化（Scott Wlaschin "Domain Modeling Made Functional"）
- **units of measure** — 型レベルで物理単位を検査（`1.0<m/s>`）
- **type providers** — 外部データソース（DB/JSON/Web）のスキーマを型として自動生成

## computation expressions

`async { }` / `seq { }` / `task { }` や自作の `let!` 構文で、[[monad|モナド]]的な do 記法を一般化して書ける。非同期・列・オプションなどを同じ構文で扱う。

## 立ち位置

.NET 相互運用で OOP も書けるマルチパラダイム。金融・ドメインロジック重視の業務系で「型で正しさを縛る」用途に強い。静的ブログ生成や Web（Giraffe/Saturn）まで実用域。

## 関連

- [[ocaml|OCaml]] — 直接の系譜（ML ファミリ）
- [[hindley-milner|Hindley–Milner 型推論]] — 型推論の土台
- [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]] — F# ドメインモデリングの核
- [[monad|Monad]] — computation expressions の背後
