---
title: Functional Core, Imperative Shell
tags: [design-principle, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:45:00+09:00
---

アプリを**純粋な決定ロジック（functional core）**と、副作用を担う**薄い殻（imperative shell）**に分ける設計。Gary Bernhardt 提唱。コアは入力→出力の純関数、殻が IO・DB・ネットワークを集約してコアを呼ぶ。

## 構造

| | Functional Core | Imperative Shell |
|---|---|---|
| 中身 | ドメインの**決定（decide）** | IO の**実行（perform）** |
| 純粋性 | 純粋（[[pure-functional-programming\|参照透過]]） | 副作用を持つ |
| テスト | 値 in → 値 out で**単体テスト容易**（モック不要） | 薄く保ち統合テストだけ |
| 量 | ロジックの大半 | できるだけ薄く |

殻が外界から値を集め → コアが次にすべきことを**値として**返し → 殻がそれを実行する、という往復。

## なぜ効くか

- **テスト容易性** — 分岐の網羅は純粋なコアを値で叩くだけ。副作用のモックが要らない
- **[[accidental-complexity|偶有的複雑性]]の削減** — 副作用と決定を混ぜないことで関心が分離する
- 関数型でない言語（TypeScript / Python）でも適用できる**移植可能な設計**

## 類縁

Hexagonal / Ports & Adapters、Elm Architecture、[[algebraic-effects|effect system]]（殻でハンドラが作用を解釈）。トレードオフは「本質的に IO に絡むロジックをどこまでコアに押し込めるか」の線引き。

## 関連

- [[pure-functional-programming|純粋関数型言語]] — コアの純粋性の土台
- [[accidental-complexity|偶有的複雑性]] — 副作用と決定の分離で複雑性を下げる
- [[algebraic-effects|Algebraic Effects]] — 殻で作用を解釈する別構造
