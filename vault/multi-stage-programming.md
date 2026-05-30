---
title: 多段階計算
tags: [programming-paradigm, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-30T20:43:00+09:00
---

プログラムの実行を複数の**ステージ**に分け、あるステージで次ステージの**コードを生成・合成・実行**する技法（multi-stage programming, MSP）。「コード値」を第一級に扱い、quasiquote（`<. e .>`）で囲んで生成・`run` で実行する。MetaOCaml が代表。

## [[partial-evaluation|部分評価]]との違い

| | 部分評価（自動） | 多段階計算（手動） |
|---|---|---|
| 制御 | 処理系が static/dynamic を判定 | プログラマが bracket/escape/run で**明示** |
| 生成コードの型安全 | 保証は実装依存 | **型安全なコード生成**（生成物も型付け） |
| 狙い | 既知入力での特化 | 段階的な特化・コード生成全般 |

両者は「汎用に書いて使用時に特化する」動機を共有する。

## 用途

- **特化による高速化** — 汎用カーネルを次元・形状で特化（コンパイル時テンソル形状検査）
- **DSL のコンパイル** — 高レベル記述から効率コードを生成
- 音楽 DSL（mimium の多段階計算）など、ドメイン特化言語の実行効率化

近縁: Template Haskell、Scala LMS、Terra、staging 全般。

## 関連

- [[partial-evaluation|部分評価]] — その自動版。MSP は明示制御版
- [[tagless-final|Tagless Final]] — 解釈を特化して高速化する設計と動機が重なる
- [[abstract-machine|抽象機械]] — インタプリタ／コンパイラの境界を扱う点で隣接
