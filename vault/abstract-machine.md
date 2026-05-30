---
title: 抽象機械
tags: [programming-paradigm, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-30T20:30:00+09:00
---

[[lambda-calculus|λ計算]]などの高レベル計算モデルを、**状態遷移で機械的に実行**するための仮想機械。評価戦略（CBV/CBN/遅延）を明示の状態に落とし込み、インタプリタ・コンパイラ・[[continuation|継続]]の扱いの土台になる。

## 代表的な機械

| 機械 | 由来 | 特徴 |
|---|---|---|
| **SECD** | Landin 1964 | Stack/Environment/Control/Dump。λ計算を実行する最初の抽象機械 |
| **CEK** | Felleisen & Friedman | Control/Environment/**Kontinuation**。継続を状態として明示。CBV |
| **Krivine** | Krivine | call-by-name / 弱頭正規形。極めて簡潔 |
| **CAM** | Cousineau ら | Categorical Abstract Machine。**Caml** の語源 |
| **STG** | Peyton Jones | Spineless Tagless G-machine。**GHC**（Haskell）のコア、遅延評価 |
| **ZAM** | Leroy | **OCaml** バイトコードの実行モデル |
| **WAM** | Warren | Warren Abstract Machine。**Prolog** の実行モデル |

## なぜ使うか

- 評価戦略を**状態遷移として形式化**でき、正しさ証明・停止性議論がしやすい
- 高レベルな[[reduction|簡約]]（β簡約）を、環境・スタック・継続という実装可能な部品に分解する
- **CEK の K ＝ 継続**であり、コールスタックを第一級のデータとして扱える → [[continuation|限定継続]]や例外の実装が明快に

実用言語の処理系は事実上いずれかの抽象機械をコアに持つ（GHC=STG、OCaml=ZAM、Prolog=WAM）。

## 関連

- [[lambda-calculus|λ計算]] — 抽象機械が実行する対象の計算モデル
- [[continuation|継続 / 限定継続]] — CEK 等が継続を状態として明示化
- [[reduction|簡約]] — 抽象機械は簡約戦略を機械化したもの
- [[stack-oriented-programming|スタック指向]] — SECD/ZAM はスタックマシン
- [[tail-call-optimization|末尾呼び出し最適化]] — 継続/スタックの再利用と表裏
