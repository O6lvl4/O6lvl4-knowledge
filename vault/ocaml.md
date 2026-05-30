---
title: OCaml
tags: [language, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:47:00+09:00
---

ML 系の実用関数型言語（1996〜, INRIA）。**強力な型推論・[[adt-gadt|代数的データ型]]・パターンマッチ・モジュールシステム**が核。関数型＋命令型＋OOP のマルチパラダイムで、ネイティブコンパイルにより高速・予測可能。

## 型システム

- **[[hindley-milner|Hindley–Milner]] ＋拡張** — GADT、多相ヴァリアント、行多相（拡張可能レコード）
- **モジュールシステム** — `functor`（モジュールを取りモジュールを返す）で大規模な抽象・パラメータ化を実現。OCaml の最大の特徴のひとつ

## Multicore OCaml (5.0〜)

並列実行（domains）を入れると同時に、**[[algebraic-effects|代数的エフェクト]]／エフェクトハンドラを言語機能として導入**。協調的並行・独自の制御構造をライブラリで書ける。研究言語の機能を実用言語が取り込んだ象徴的な例。

## 性能と実行モデル

ネイティブコンパイラに加え、バイトコードは [[abstract-machine|ZAM]]（Zinc Abstract Machine）で実行。GC は低レイテンシ寄り。

## 用途

コンパイラ・言語処理系（Rust の初代実装、Flow、Hack、Facebook Infer）、**金融（Jane Street）**、形式手法（Coq は OCaml 実装）。[[make-illegal-states-unrepresentable|不正な状態を表現不能にする]]の標語は Jane Street（Yaron Minsky）由来。

## 関連

- [[fsharp|F#]] — OCaml を .NET に持ち込んだ子孫
- [[hindley-milner|Hindley–Milner 型推論]] — 型推論の土台
- [[algebraic-effects|Algebraic Effects]] — 5.0 で言語機能化
- [[abstract-machine|抽象機械]] — ZAM がバイトコード実行モデル
