---
title: 不正な状態を表現不能にする
tags: [design-principle, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T20:46:00+09:00
---

ドメイン上ありえない状態を、**そもそも型として構築できない**よう設計する原則（"make illegal states unrepresentable", Yaron Minsky）。実行時バリデーションで弾く代わりに、**型で構築不能**にして誤りをコンパイル時に消す。

## 例

```
-- 悪い: loggedIn=true なのに user=null という不整合が表現できてしまう
type State = { loggedIn: Bool, user: User? }

-- 良い: あり得る場合だけを直和で列挙 → 不整合が存在しない
type State = LoggedOut | LoggedIn of User
```

## 手法

- **[[adt-gadt|直和型]]** で「あり得る場合だけ」を列挙する
- `Option`/`Maybe` で欠損を型に出す（null の暗黙性を排除）
- newtype・[[refinement-type|篩型]]で不変条件を型に持たせる（非空リスト、正の数 …）
- 状態遷移を型で表す（不正な遷移を呼べなくする）

## 「parse, don't validate」との関係

入力検証を「真偽判定」ではなく「**型付き値への変換**」として境界で一度だけ行う（Alexis King）。以降のコードは型がすでに正しさを保証する。[[parser-combinator|パーサ]]／[[decoder-pattern|デコーダ]]がその実装手段。

## なぜ重要か

バリデーションは「書き忘れ」「順序」「漏れ」が起きるが、型による排除は**全経路で機械的に保証**される。ドメインモデリングの核（型駆動設計）であり、バグを「直す」のでなく「**表現できなくする**」発想。

## 関連

- [[adt-gadt|ADT / GADT]] — あり得る状態だけを列挙する主要手段
- [[refinement-type|篩型]] — 不変条件を型に載せる
- [[decoder-pattern|デコーダパターン]] / [[parser-combinator|パーサコンビネータ]] — 境界で型付き値に落とす
- [[union-type|共用型 / Union 型]] — 判別共用体での状態表現
- [[fsharp|F#]] / [[ocaml|OCaml]] — この設計を文化として持つ ML 系言語
- [[borrow-checker-value]] — 同じ思想をメモリ別名レベルで実現した例(「共有×可変」を型で表現不能に)
