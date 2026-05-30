---
title: Clojure
tags: [language, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:45:00+09:00
---

JVM 上の現代的 [[lisp|Lisp]]（2007, Rich Hickey）。**不変データ・関数型・並行性**を中核に据えた実用 Lisp。homoiconic（コード＝データ）でマクロが強力。動的型。

## 中核思想

- **simple を complexity（complect＝絡み合い）より優先** — [[simple-vs-easy|Simple vs Easy]] はそもそも Hickey の "Simple Made Easy" が源流
- **不変＋永続データ構造** — HAMT による構造共有で、コピーせず安全に更新（[[copy-on-write|COW]] 的発想）
- **データ指向** — map / vector / set / EDN を中心に、独自クラス階層より素のデータで設計

## 並行性

可変状態の種類を明示的に分ける: **atom**（独立な同期更新）、**ref**（STM によるトランザクション）、**agent**（非同期）、**core.async**（CSP チャネル。[[actor-model|アクターモデル]]とは別系統の並行モデル）。不変データゆえロックが要らない。

## 型と検査

動的型だが、**spec** / **Malli** で実行時のデータ契約・生成・検査を行う（静的型の代わりに「データの形」を記述）。

## エコシステム

ホストは JVM（Clojure）/ JS（**ClojureScript**）/ .NET。**REPL 駆動開発**が文化。Datomic（不変DB）、フロント〜バックを同一言語で揃える構成も。

## 関連

- [[lisp|LISP]] — Clojure は現代化された Lisp 方言
- [[simple-vs-easy|Simple vs Easy]] — Hickey の設計哲学そのもの
- [[functional-programming|関数型言語]] — 不変・第一級関数を実務に持ち込んだ
- [[copy-on-write|Copy-on-Write]] — 永続データ構造の構造共有と通底
