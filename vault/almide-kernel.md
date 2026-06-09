---
title: almide-kernel — 検証付き高性能カーネル
tags: [almide, compiler, formal-methods, optimization]
created_at: 2026-06-09
updated_at: 2026-06-09T09:09:53+09:00
---

[[almide|Almide]] で高性能な数値カーネル(transpose・行列演算・畳み込み等)を、性能の出る **schedule**(ループ変換・タイル化・ベクトル化)で書きつつ、その変換が素朴実装と等価であることを機械的に保証するサブシステム。先行例は MIT の [[exo|Exo]](exocompilation)。核心は、Exo が SMT に投げる「変換 = equivalence」の証明を、**permutation に限れば SMT 無し・1実行で全入力について決定可能にできる**という発見にある。

## Exo との比較

| | **Exo** | **almide-kernel** |
|---|---|---|
| 正しさ | effect analysis + SMT(静的に全入力の equivalence を解く) | **permutation kernel は SMT 不要で全証明**(index 入力1回)/ reduction は within-tolerance(許容誤差内)で照合 |
| schedule | 人間が書く | 人間が書く(将来 [[almide\|Almide]] が導出するのが狙い) |
| 出力 | C(独自バックエンド) | Rust(→ LLVM)・Almide ネイティブ・**per-target**(AVX / simd128) |

Exo は schedule(高速化変換)を人間が書き、変換前後が意味的に等価かを effect analysis と SMT ソルバで静的に証明する。"exocompilation" とは、最適化をコンパイラの裁量でなくユーザーが明示し、正しさだけ機械が担保する立て付け。almide-kernel は同じ「schedule は人間・正しさは機械」の枠組みを取りつつ、**証明手段を変換の種類で分ける**。

## 核心: permutation は SMT が要らない

Exo の SMT が解いているのは「この変換は**あらゆる入力値**に対して出力を変えないか」という、入力空間が無限の問題。だが **permutation**(transpose, reshape, ループ入れ替えによる添字の並べ替え)は **値に依存しない** — 出力は入力要素の並べ替えにすぎず、どこへ動くかは値ではなく添字だけで決まる。

ここから1つの手が出る:

- 恒等インデックス配列 `input[k] = k` を**1回だけ**カーネルに通す。
- 各要素は「自分が元いた位置」を札として持つので、出力を見れば **どの入力位置がどの出力位置へ写ったか(置換写像の全体)** が1実行で抽出できる。
- permutation は値非依存だから、この写像が確定すれば **全入力について equivalence が証明済み** になる。SMT は要らない。

つまり Exo が SMT を要する箇所のうち permutation 部分は、**1回の実行で decidable** に落ちる。

### reduction には効かない

reduction(総和・max-pool・行縮約など)は permutation ではない。複数の入力を1つに**畳み込む = 値に依存する**演算なので、恒等インデックスを通しても写像は取り出せない。しかも浮動小数では加算順序で結果が変わり厳密一致が意味を持たない。よって reduction は **within-tolerance**(許容誤差内の数値照合)にフォールバックする。almide-kernel が変換を permutation / reduction で切り分けるのはこのため。

## なぜ1実行で決定可能になるのか

値非依存な dataflow 変換は、**1本の基底入力での振る舞いだけで完全に決まる**。恒等インデックス配列はその基底 — 各スロットに自分の位置を書き込むので、カーネルを走らせると札が伝播し、出力がスロット→スロットの写像をそのまま晒す。添字領域は有限で、基底1本がそれを exhaustively に探る。

SMT が背負っていた「無限の値入力空間にわたる equivalence」は、変換が **添字空間(有限)を経由して factor する**瞬間に崩れる。記号推論なしの全数チェックに化ける。これは [[theorem-proving|定理証明]]でいう **decidable な断片**を見つける動きそのもの — 一般の equivalence は半決定的(SMT/ATP の領分)だが、permutation という制約を入れると有限・決定可能になる。

## Links

- [Exo (GitHub)](https://github.com/exo-lang/exo)

### 出典

- **Web 検索由来**: Exo の論文名・著者・所属(MIT)・PLDI 2022 / ASPLOS 2025・MIT ライセンス。
- **リポジトリ直読由来**: `~/workspace/github.com/exo-lang/exo`(約 19M、`--depth 1` で clone)を読んで確認 — リポジトリ構造、`Check_*` 関数群(検査ロジック)、`new_eff.py`(effect analysis の実装)。

## 関連

- [[exo]] — 先行例。schedule は人間・正しさは機械の枠組みと、SMT による equivalence checking の出どころ
- [[almide]] — almide-kernel はその数値カーネル/検証サブシステム。Pipeline Verification Chain と同じ「証明あり・パズル無し」の系譜
- [[almide-differential-gate]] — 同じ正しさ保証でも、こちらは**コンパイル時の証明**。差分ゲートは**実行時に旧実装と照合**する oracle 方式で、reduction の within-tolerance 照合はそれに近い
- [[theorem-proving]] — 一般の equivalence は SMT(半決定的)。permutation は decidable 断片に落として SMT を回避する
- [[formal-methods]] — schedule の正しさを機械保証する点で形式手法の応用
- [[equality-saturation]] — 等価変換つながり。eq-sat は等価形を探索、almide-kernel は等価性の証明を1実行に還元
- [[deterministic-codegen]] — per-target(AVX/simd128)出力でも決定性が保てないと within-tolerance 照合の前提が崩れる
