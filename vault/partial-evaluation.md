---
title: 部分評価
tags: [programming-paradigm, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-30T20:31:00+09:00
---

プログラムの入力の一部（**static** な入力）を先に固定し、その分の計算を済ませた**特化版プログラム（residual program）**を生成する技法。`p(static, dynamic)` を `p_static(dynamic)` に変換する。抽象化のオーバーヘッドを「抽象度を保ったまま」消すための基盤。

## Futamura 射影（二村射影）

部分評価器 `mix` をインタプリタ `int` に適用すると、コンパイルの階層が現れる。

1. `mix(int, prog)` → **prog をコンパイルした実行コード**（インタプリタの解釈オーバーヘッドを除去）
2. `mix(mix, int)` → **コンパイラ**（任意の prog をコードに変換する関数）
3. `mix(mix, mix)` → **コンパイラ生成器**（インタプリタからコンパイラを作る器械）

## 仕組み

- **binding-time analysis** — 各式を static（今すぐ計算可）/ dynamic（実行時まで未定）に分類
- static 部分を畳み込み、dynamic 部分だけを残す
- 定数畳み込み・インライン展開・ループ展開を「入力既知」の仮定で徹底した一般化と見なせる

## 関連技術との位置づけ

- **[[tagless-final|Tagless Final]]** — 原論文名が "Finally Tagless, **Partially Evaluated**"。型クラスの解釈を部分評価で特化し、抽象化コストを消す
- **staging / multi-stage programming**（MetaOCaml 等）— 部分評価を明示のコード生成として制御する
- **supercompilation / JIT の specialization** — 動機を共有する隣接技法
- 最適化クラスタ（[[stream-fusion|Stream Fusion]]・[[dead-code-elimination|DCE]]）と同じく「汎用コードを具体化して速くする」系

## なぜ重要か

汎用性と性能はふつうトレードオフだが、部分評価は**汎用に書いたコードを使用時に特化**することで両取りを狙う。インタプリタ＝コンパイラの関係（[[abstract-machine|抽象機械]]）を理論的に橋渡しする点でも中心的。

## 関連

- [[tagless-final|Tagless Final]] — 部分評価で解釈を特化する設計
- [[abstract-machine|抽象機械]] — インタプリタ特化＝コンパイルの関係を体現
- [[stream-fusion|Stream Fusion]] — 中間構造を消す隣接最適化
- [[dead-code-elimination|DCE]] — 既知入力で不要コードが落ちる
