---
title: Clojure
tags: [language, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:03+09:00
---

JVM 上の現代的 [[lisp|Lisp]]（2007, Rich Hickey）。**不変データ・関数型・並行性**を中核に据えた実用 Lisp。homoiconic（コード＝データ）でマクロが強力。動的型。

## 中核思想

- **simple を complexity（complect＝絡み合い）より優先** — [[simple-vs-easy|Simple vs Easy]] はそもそも Hickey の "Simple Made Easy" が源流
- **不変＋永続データ構造** — HAMT による構造共有で、コピーせず安全に更新（[[copy-on-write|COW]] 的発想）
- **データ指向** — map / vector / set / EDN を中心に、独自クラス階層より素のデータで設計

## homoiconic（コード＝データ）

ソースコードがそのまま言語の組み込みデータ構造（リスト・ベクタ・マップ）として表現される。`(f a b)` は「`f` を `a b` に適用する呼び出し」であると同時に、評価しなければ「3要素のリスト」というただのデータでもある:

```clojure
(+ 1 2)            ; => 3      （評価すると関数呼び出し）
'(+ 1 2)           ; => (+ 1 2) （quote するとリストというデータ）
(first '(+ 1 2))   ; => +      （データとして要素を取り出せる）
```

プログラムが自分のソースを通常の `first`/`map`/`conj` で操作できる。これがマクロを「ただのデータ変換関数」にする。

## マクロの最小例

マクロはコンパイル時に**コード（データ）を受け取り別のコードを返す**関数。評価順を制御できる点が関数と決定的に違う:

```clojure
(defmacro unless [test body]
  `(if (not ~test) ~body))   ; ` は構文quote, ~ は展開時に値を差し込む

(unless false (println "run!"))   ; => "run!"
;; マクロ展開: (if (not false) (println "run!"))
```

関数だと `body` が呼び出し前に評価されてしまうが、マクロは未評価のコードのまま受け取り `if` の中に**織り込んでから**展開する。`macroexpand-1` で展開結果を確認できる。

## 永続データ構造（HAMT）

ベクタ・マップは内部的に **HAMT（Hash Array Mapped Trie）**= 分岐数32の木で実装される。「更新」は木を丸ごとコピーせず、**変更経路上のノードだけ作り直し、残りは旧バージョンと共有**する（path copying）。結果、`assoc`/`conj` は実質 O(log₃₂ n) ≈ ほぼ定数で、旧版もそのまま生き続ける（永続性）:

```clojure
(def a [1 2 3])
(def b (conj a 4))   ; b => [1 2 3 4]
a                    ; => [1 2 3]（a は不変のまま、木の大半を b と共有）
```

これが「不変なのにコピーコストを払わない」を成立させ、ロックなしの並行性の土台になる。

## 並行性

可変状態の種類を明示的に分ける: **atom**（独立な同期更新）、**ref**（STM によるトランザクション）、**agent**（非同期）、**core.async**（CSP チャネル。[[actor-model|アクターモデル]]とは別系統の並行モデル）。不変データゆえロックが要らない。

## 型と検査

動的型だが、**spec** / **Malli** で実行時のデータ契約・生成・検査を行う（静的型の代わりに「データの形」を記述）。

## エコシステム

ホストは JVM（Clojure）/ JS（**ClojureScript**）/ .NET。**REPL 駆動開発**が文化。Datomic（不変DB）、フロント〜バックを同一言語で揃える構成も。

## 押さえどころ（カード化候補）

- **homoiconic** → コードが組み込みデータ構造そのもの。quote すれば `(+ 1 2)` はただのリストになり、`first`/`map` で操作できる
- **マクロ vs 関数** → マクロは未評価のコードを受け取りコンパイル時に展開。評価順を制御できる（`unless` が `body` を遅延させられる）のが本質的な差
- **構文quote `` ` `` と `~`** → マクロ本体でコードを組み立てる道具。`` ` `` がテンプレート、`~` が値の差し込み
- **HAMT / 永続データ構造** → 分岐32の木で path copying。更新は変更経路だけ作り直し残りを共有。旧版が生き続け、コストはほぼ定数
- **可変状態の4分類** → atom（同期独立）/ ref（STM）/ agent（非同期）/ core.async（CSP）。不変が土台なのでロック不要

## 関連

- [[lisp|LISP]] — Clojure は現代化された Lisp 方言
- [[simple-vs-easy|Simple vs Easy]] — Hickey の設計哲学そのもの
- [[functional-programming|関数型言語]] — 不変・第一級関数を実務に持ち込んだ
- [[copy-on-write|Copy-on-Write]] — 永続データ構造の構造共有と通底
