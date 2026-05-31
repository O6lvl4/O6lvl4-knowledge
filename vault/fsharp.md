---
title: F#
tags: [language, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:03+09:00
---

.NET 上の**関数型優先（functional-first）**言語（2005, Don Syme / Microsoft Research）。[[ocaml|OCaml]] の系譜（ML ファミリ）を .NET に持ち込んだもの。純粋ではないが、既定が不変・式指向。

## 型と設計

- **[[hindley-milner|Hindley–Milner 型推論]]** — 注釈をほぼ書かずに静的型が付く
- **判別共用体（[[adt-gadt|ADT]]）＋レコード＋パターンマッチ** — [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]]ドメインモデリングが文化（Scott Wlaschin "Domain Modeling Made Functional"）
- **units of measure** — 型レベルで物理単位を検査（`1.0<m/s>`）
- **type providers** — 外部データソース（DB/JSON/Web）のスキーマを型として自動生成

## 判別共用体＋パターンマッチの実例

判別共用体（DU）で「とりうる状態だけ」を型として定義し、`match` で網羅的に分岐する。コンパイラが漏れたケースを警告する:

```fsharp
type PaymentMethod =
    | Cash
    | Card of number: string * expiry: string
    | PayPal of email: string

let describe method =
    match method with
    | Cash                       -> "現金"
    | Card (number, _)           -> sprintf "カード末尾 %s" (number.Substring(number.Length - 4))
    | PayPal email               -> sprintf "PayPal: %s" email

// Option も DU。None を消し忘れるとコンパイラが警告
let safeDiv a b =
    match b with
    | 0 -> None
    | _ -> Some (a / b)
```

`Card` ケースを削ると「`Card` が未処理」と警告。これが [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]]ドメインモデリングの中核。

## units of measure

型レベルで物理単位を付与し、**次元の不一致をコンパイル時に弾く**。実行時コストはゼロ（消去される）:

```fsharp
[<Measure>] type m     // メートル
[<Measure>] type s     // 秒

let distance = 100.0<m>
let time     = 9.58<s>
let speed    = distance / time      // 型は float<m/s>

// let wrong = distance + time      // ← コンパイルエラー: m と s は足せない
```

`m/s` と `m` を取り違えるバグが型で防がれる。NASA の単位取り違え事故クラスの誤りを言語が排除する。

## computation expressions

`async { }` / `seq { }` / `task { }` や自作の `let!` 構文で、[[monad|モナド]]的な do 記法を一般化して書ける。非同期・列・オプションなどを同じ構文で扱う。

```fsharp
let fetchAll () = async {
    let! a = fetchAsync "https://a"   // let! が await 相当（bind を脱糖）
    let! b = fetchAsync "https://b"
    return a + b
}
```

`let!` は裏で `builder.Bind` 呼び出しに脱糖される。自作の builder を定義すれば Option/Result/独自モナドにも同じ `{ ... }` 構文を使える。

## 立ち位置

.NET 相互運用で OOP も書けるマルチパラダイム。金融・ドメインロジック重視の業務系で「型で正しさを縛る」用途に強い。静的ブログ生成や Web（Giraffe/Saturn）まで実用域。

## 押さえどころ（カード化候補）

- **判別共用体（DU）** → 「とりうる状態の列挙」を型で定義。`match` の漏れをコンパイラが警告し、`Option`/`Result` もこの形
- **units of measure** → 型レベルで物理単位を検査（`1.0<m/s>`）。次元不一致をコンパイル時に弾き、実行時コストはゼロ
- **computation expression** → `let!` が `builder.Bind` に脱糖。`async`/`seq`/`option` など bind 可能な計算を同じ `{ }` 構文で書ける
- **functional-first** → 純粋ではないが既定が不変・式指向。.NET 相互運用で OOP も書けるマルチパラダイム
- **type providers** → 外部スキーマ（DB/JSON/Web）を型として自動生成。コード生成なしに静的型を得る

## 関連

- [[ocaml|OCaml]] — 直接の系譜（ML ファミリ）
- [[hindley-milner|Hindley–Milner 型推論]] — 型推論の土台
- [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]] — F# ドメインモデリングの核
- [[monad|Monad]] — computation expressions の背後
