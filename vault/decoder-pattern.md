---
title: デコーダパターン
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T20:35:00+09:00
---

外部の非構造データ（JSON・バイナリ等）を、**合成可能な「デコーダ」値の組み立て**で型付きの内部表現へ安全に変換する関数型パターン。Elm の `Json.Decode` が代表。`Decoder a` ＝「未知の入力を `a` に変換しようと試み、失敗しうる」計算の抽象。

## 仕組み

小さなデコーダを **combinator** で合成して大きな構造のデコーダを作る。

```elm
type alias User = { name : String, age : Int }

userDecoder : Decoder User
userDecoder =
  map2 User
    (field "name" string)
    (field "age" int)
-- 入力が違えば Result の Err として失敗が値で返る
```

- `string` / `int` / `field` … 原子デコーダ
- `map` / `map2` … [[polymorphism|アプリカティブ]]的合成（独立な複数フィールド）
- `andThen` … モナド的合成（前の結果で次の解釈を分岐：タグ付きユニオンの判別など）

**パーサコンビネータと同型**（`Decoder ≈ Parser`：未知入力→型付き値＋失敗）。

## スキーマ駆動デリアライズとの違い

| | デコーダパターン | スキーマ/タグ駆動（serde, `json.Unmarshal`） |
|---|---|---|
| デコーダの地位 | **第一級の値**。実行時に合成・分岐できる | 型定義＋注釈から自動導出 |
| 緩い/曖昧な入力 | 明示的に分岐・既定値・バージョン差を吸収 | 型に合わないと一括失敗しがち |
| ボイラープレート | 自分で書く | 少ない |

緩い外部入力・複数バージョン・[[adt-gadt|直和型]]への判別変換に強い。代償は記述量。

## なぜ重要か

「パースは検証」— 非構造データを**型付き値に変換する境界**を、合成可能で失敗を値（Result）で扱う形に閉じ込める。3Dジオメトリのような複雑フォーマットの読み込みも、原子デコーダの組み立てとして宣言的に書ける。

## 関連

- [[adt-gadt|ADT / GADT]] — デコード先の内部表現。`andThen` でタグ判別して直和に振り分ける
- [[polymorphism|ポリモーフィズム]] — `map`/`map2`/`andThen` はアプリカティブ/モナドの構造
- [[union-type|共用型 / Union 型]] — 曖昧な入力を判別共用体へ落とす対象
