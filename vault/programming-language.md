---
title: プログラミング言語
tags: [programming-paradigm, computer-science, language]
---

人間がコンピュータに命令を伝えるための形式言語。[[chomsky-hierarchy|チョムスキー階層]]の Type 2（文脈自由文法）で構文を定義し、Type 1 以上の意味解析で型チェックや名前解決を行う。

## パラダイムによる分類

| パラダイム | 特徴 | 代表的な言語 |
|---|---|---|
| [[functional-programming\|関数型]] | 関数が第一級、イミュータビリティ | Haskell, OCaml, Clojure, Erlang |
| オブジェクト指向 | メッセージパッシング、カプセル化 | [[ruby\|Ruby]], Java, Smalltalk |
| 手続き型 | 逐次実行、変数の変更 | C, Pascal |
| 論理型 | 事実とルールから推論 | Prolog |
| マルチパラダイム | 複数を混合 | [[almide\|Almide]], Scala, Rust, TypeScript |

## 型システムによる分類

| 分類 | 特徴 | 例 |
|---|---|---|
| 動的型付け | 実行時に型チェック | [[ruby\|Ruby]], Python, [[lisp\|LISP]] |
| 静的型付け | コンパイル時に型チェック | [[almide\|Almide]], Rust, Haskell, Java |
| 漸進的型付け | 静的と動的を混在 | TypeScript, Dart |
| [[dependent-type\|依存型]] | 型が値に依存 | Idris, Agda, Lean |

## 実行モデルによる分類

| 分類 | 特徴 | 例 |
|---|---|---|
| コンパイル | ネイティブコードに変換 | [[almide\|Almide]], Rust, C, Go |
| インタプリタ | 逐次解釈実行 | [[ruby\|Ruby]], Python |
| VM | バイトコードを仮想マシンで実行 | Java (JVM), C# (CLR), Erlang (BEAM) |
| トランスパイル | 別の言語に変換 | TypeScript → JS, [[almide\|Almide]] → Rust/WASM |

## このナレッジベースにある言語

- [[almide|Almide]] — LLM コード生成に最適化された言語。Rust/WASM にコンパイル
- [[ruby|Ruby]] — プログラマの幸福を一次価値にした動的型付け言語
- [[lisp|LISP]] — コード = データ。1958年生まれの最古の高級言語の一つ

## 言語設計に関連するトピック

- [[chomsky-hierarchy|チョムスキー階層]] — 言語の構文はどのレベルか
- [[lambda-calculus|λ計算]] — 関数型言語の理論的基盤
- [[inference-rules|推論規則]] — 型チェッカーのルールブック
- [[tapl|TAPL]] — 型とプログラミング言語の教科書
- [[adt-gadt|ADT / GADT]] — 関数型言語の型定義方法
- [[algebraic-effects|Algebraic Effects]] — 次世代の副作用管理
