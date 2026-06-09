---
title: Exo — exocompilation
tags: [language, compiler, optimization, hardware]
created_at: 2026-06-09
updated_at: 2026-06-09T09:13:50+09:00
---

高性能計算カーネルを書き、最適化し、ハードウェアアクセラレータへ載せるための **user-schedulable** な低水準言語。MIT CSAIL(Jonathan Ragan-Kelley のグループ)発。設計原理は **exocompilation** — ターゲット固有のコード生成支援と最適化ポリシーを**コンパイラ本体ではなくユーザーコード(ライブラリ)へ追い出す**こと。コンパイラは小さく信頼できるコアに保ち、ハード対応と最適化判断は人間が明示する。

## なぜ exocompilation か

| | 従来のコンパイラ | Exo |
|---|---|---|
| ハード対応 | 各アクセラレータをコンパイラに焼き込む → 拡張困難・新ハードに追従できない | カスタム命令・特殊メモリ・構成状態を**ユーザーライブラリ**で定義 |
| 最適化 | 自動最適化(autoscheduler)→ SOTA 性能を保証できない | 人間が **schedule** で明示。コンパイラは正しさだけ機械保証 |
| 信頼境界 | 巨大なコンパイラ全体を信頼 | trusted なコアは小さく、ハード知識は untrusted なユーザーコード側 |

論文中の言語名は **SYSTL**、実装が Exo。「コンパイラを賢くする」のでなく「人間が賢く書ける土俵を用意し、機械は等価性だけ守る」方向。

## 2層構造: アルゴリズム / schedule

[[almide-kernel]] と同じく、**何を計算するか**(素朴で正しいアルゴリズム定義)と **どう速くするか**(schedule = ループ変換・タイル化・ベクトル化・ハード命令への置換)を分離する。これは Halide(同じ Ragan-Kelley 系)の系譜。違いは、Exo が schedule を **fine-grained な書き換え primitive の列**として表現し、各 primitive の意味保存を機械検証する点。

## 正しさ: effect analysis + SMT

schedule は人間が書くが、各変換が **元の意味を保存する(equivalence)** ことをコンパイラが静的に保証する。手段が **effect analysis + SMT ソルバ** による equivalence checking で、入力空間全体にわたる等価性を解く。リポジトリ(`github.com/exo-lang/exo`)では `Check_*` 関数群が検査ロジック、`new_eff.py` が effect analysis の実装を担う。出力は **C**(独自バックエンド)。

> この「変換 = equivalence」を SMT で解く部分こそ、[[almide-kernel]] が「permutation なら値非依存なので恒等インデックスを1回通せば SMT 無しで全証明できる」と崩した着想元。Exo は一般変換を相手に SMT を使うが、permutation という制約を入れると decidable な断片に落ちる。

## Exo 2: scheduling 言語そのものを育てる

**Exo 2: Growing a Scheduling Language**(ASPLOS 2025)は、schedule の primitive 群を固定セットでなく **ユーザーが拡張できる**ようにした続編。ユーザーは trusted な細粒度 primitive を合成して**自前の scheduling ライブラリ**を書ける。

鍵は **Cursors** 機構。ユーザー拡張可能な scheduling 言語に不可欠な3要素 — actions(コードを書き換える)/ inspection(コードを問い合わせる)/ references(コード位置を指す)— を融合し、**コード上の位置を安定的に参照**できるようにした(書き換えで位置がずれても追える)。これで scheduling ロジックをライブラリとしてカプセル化できる。

結果: 80以上の高性能カーネルにわたって scheduling の労力を償却し、scheduling コード量を**桁違いに削減**、3つの異なるプラットフォームで SOTA に伍する性能を達成。

## Links

- [The Exo Language (公式)](https://exo-lang.dev/)
- [exo-lang/exo (GitHub)](https://github.com/exo-lang/exo) — MIT ライセンス
- [Exocompilation for Productive Programming of Hardware Accelerators (PLDI 2022)](https://dl.acm.org/doi/abs/10.1145/3519939.3523446) — Ikarashi, Bernstein, Reinking, Genc, Ragan-Kelley
- [Exo 2: Growing a Scheduling Language (ASPLOS 2025 / arXiv 2411.07211)](https://arxiv.org/abs/2411.07211) — Ikarashi, Qian, Droubi, Reinking, Bernstein, Ragan-Kelley

## 関連

- [[almide-kernel]] — Exo を先行例とする検証付きカーネル。Exo が SMT で解く equivalence のうち permutation 部分を「1実行で decidable」に落とす
- [[theorem-proving]] — Exo の equivalence checking は SMT(自動・半決定的)。一般の変換等価性はここに乗る
- [[formal-methods]] — schedule の正しさを機械保証する点で形式手法の応用
- [[equality-saturation]] — 等価変換つながり。eq-sat は等価形を網羅探索して選ぶ、Exo は人間が指定した変換列の等価性を検証する
- [[deterministic-codegen]] — per-target なコード生成と、出力照合・等価性検証が成立する前提としての決定性
