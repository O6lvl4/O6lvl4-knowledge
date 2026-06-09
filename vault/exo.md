---
title: Exo — exocompilation
tags: [language, compiler, optimization, hardware, formal-methods]
created_at: 2026-06-09
updated_at: 2026-06-09T09:28:18+09:00
---

高性能カーネル(GEMM・畳み込み等)を**人間が手で最適化**しながら、その最適化が元の素朴定義と等価であることを機械が保証する、**Python 埋め込みの user-schedulable 言語(USL)**。MIT CSAIL(Jonathan Ragan-Kelley グループ)発。BLIS が新アーキごとに手書きする microkernel 特殊化を桁違いに楽にし、ベンダーライブラリ/手書きアセンブリ級の性能を狙う。Halide/TVM と同じ **アルゴリズム / schedule 分離**を継ぐが、他の USL と分かつ柱が2本ある:

1. **exocompilation** — ハードウェアの定義(命令・メモリ・構成レジスタ)を**コンパイラ本体でなくユーザーライブラリ**に置く。コンパイラは小さく信頼できるコアに保つ。
2. **rewrite-based scheduling** — schedule の各操作を **LoopIR → LoopIR の書き換え**として実装し、各書き換えの意味保存を effect analysis で機械検証する(Halide/TVM の lowering-based とは別系統)。

## 設計原則

- **Performance Transparency** — ユーザーに不透明な「魔法の最適化」をしない。何が起きるかは全部 schedule に書いてある。
- **WYSIWYG** — Exo IR は C 風コードをほぼそのまま写し、自明に C へ落ちる。
- **User Control** — 性能の制御権を人間に返す(autoscheduler に丸投げしない)。

## 2言語構造: object code と scheduling

Exo のプログラムは**性質の違う2つのコード**から成る。

### object code(= アルゴリズム)

`@proc` を付けた Python 関数。**構文は Python 風だが Python ではなく**、パーサが Exo IR(LoopIR)へ変換する。素朴で読める「正しい仕様」をここに固定する。

```python
@proc
def rank_k_reduce_6x16(K: size, A: f32[6,K] @ DRAM, B: f32[K,16] @ DRAM, C: f32[6,16] @ DRAM):
    for i in seq(0, 6):
        for j in seq(0, 16):
            for k in seq(0, K):
                C[i, j] += A[i, k] * B[k, j]
```

- 型・精度を明示: `f16/f32/f64/i8/i32/ui8/ui16`
- メモリ空間を明示: `name: type[shape] @ memory`(`@DRAM`, `@AVX2`, `@Neon`, …)
- ループは affine な `for i in seq(0, n)` のみ。`if/else`、代入 `=`、reduction `+=`、`alloc`、**window**(`x[i:i+2]`、型 `[f32][3]`)

**解析を成立させる3つの制約**(ここが Exo の効きどころ):

| 制約 | 内容 | なぜ要るか |
|---|---|---|
| affine 添字のみ | `data[i*j]` 等の非アフィン添字は不可(定数 div/mod は可) | 添字推論・依存解析を決定可能に保つ |
| **値依存制御フロー禁止** | `if data[i] < 3.0:` は書けない。制御値とバッファ値を分離 | データの**動き**を**値**から切り離し、等価性を静的に解けるようにする |
| 引数エイリアス禁止 | `foo(y, y)` 不可(C の `__restrict__` 相当) | 解析の精度を保つ |

> 値依存制御フローの禁止は almide-kernel の着想の土台でもある。データの動きが値から独立する → permutation なら写像が値に依存しない、という性質が言語レベルで保証される。[[almide-kernel]] を参照。

### scheduling(= 最適化)

**普通の Python コード**として書く。各 scheduling primitive は proc を受け取り**新しい proc を返す**。アルゴリズムは読みやすいまま固定され、最適化は別プログラム(書き換えの列)として分離される。

```python
avx = rename(rank_k_reduce_6x16, "rank_k_reduce_6x16_scheduled")
avx = reorder_loops(avx, 'j k')          # ループ入れ替え
avx = divide_loop(avx, 'for j in _: _', 8, ['jo','ji'], perfect=True)  # = Halide/TVM の split
avx = stage_mem(avx, 'for k in _:_', 'C[0:6, 0:16]', 'C_reg')         # レジスタへステージング
avx = set_memory(avx, 'C_reg:_', AVX2)   # メモリ空間を AVX2 レジスタに
avx = replace_all(avx, mm256_loadu_ps)   # ループを AVX2 命令へ置換
```

各ステップ後に `print(avx)` で**途中状態が読める proc として出る**(rewrite-based の利点)。primitive は6カテゴリ — buffer / loop & scope / config / subproc / memory・precision・parallelism / other。代表例: `divide_loop`・`reorder_loops`・`fission`・`fuse`・`unroll_loop`(loop)、`stage_mem`・`lift_alloc`・`expand_dim`・`bind_expr`(buffer/mem)、`replace`/`replace_all`(命令置換)、高階コンビネータ `repeat`・`simplify`。

## exocompilation: ハードをユーザーコードで定義する

新アクセラレータ対応にコンパイラを fork しない。命令・メモリ・構成状態を**ライブラリで宣言**する。

**命令 `@instr`** — proc の**本体に命令の意味**(Exo object code)を書き、**デコレータ文字列に吐く C/intrinsic** を書く(`{arg_data}` がプレースホルダ):

```python
@instr("{dst_data} = vld1q_f32(&{src_data});")
def neon_vld_4xf32(dst: [f32][4] @ Neon, src: [f32][4] @ DRAM):
    assert stride(src, 0) == 1
    assert stride(dst, 0) == 1
    for i in seq(0, 4):
        dst[i] = src[i]          # ← この本体が「命令の仕様」
```

**`replace(proc, cursor, instr)`** が、命令本体とコード片を **unification modulo linear equalities** で照合する: subproc の引数を未知数、コード片の自由変数を既知とし、整数制御式の等価性を**線形方程式系**として解く。AST が(整数制御以外)厳密一致し方程式が解ければ、そのコード片は命令の意味と等価と**証明された**ことになり、安全にハード命令へ差し替えられる。「専用バックエンド不要 — 重い処理は Exo 内で完結し、命令の意味そのものが仕様になる」。

**メモリ `Memory` サブクラス** — `alloc`/`free`/`window`/`can_read`/`global_` を C 文字列を返すメソッドとして実装。ベクタレジスタも「独自の確保・アクセス codegen を持つメモリ」として表現(`AVX2`, `AVX512`, `Neon`, `GEMM_SCRATCH` 等を同梱、ユーザー定義が推奨)。

**構成状態 `config`** — アクセラレータの構成レジスタをモデル化。`delete_config` で冗長な構成書き込みを除去。config を跨いだ推論は PLDI 論文の中心貢献の一つ。

## 正しさ: 2層の機械保証

| 層 | 何を保証 | 手段 | 実装 |
|---|---|---|---|
| frontend | assert 充足・配列範囲外なし | **SMT ソルバ**(PySMT + Z3/CVC4) | `boundscheck.py` |
| rewrite | 各 schedule 操作が**意味を保存**(全入力で等価) | **effect analysis**(read/write 効果・依存の解析) | `Check_*`(`new_eff.py`) |

schedule は人間が書くが、各 primitive の正しさはコンパイラが担保する — `LoopIR_scheduling.py` の各 primitive が `Check_*` 安全検査を呼び、効果解析で書き換えが等価かを判定する。**この rewrite 等価性の層こそ [[almide-kernel]] が「permutation は値非依存だから恒等インデックスを1回通せば effect analysis/SMT 無しで全証明できる」と崩した着想元**。Exo は一般の変換を相手に効果解析を回すが、permutation という制約を入れると 1 実行で decidable な断片に落ちる。

## コンパイルパイプラインとリポジトリ

```
Python AST → UAST(無型) → typecheck → LoopIR(主 IR)
   → [rewrite] scheduling primitives: LoopIR → LoopIR(不変・各段 printable)
   → [backend] mem/prec/win/parallel 解析 → C 生成
```

Exo は**独自レクサを持たず Python の構文解析を乗っ取る**。フル proc は UAST、コード片照合用は穴 `_` を持つ PAST にパースする。CLI は `exocc file.py` → `file.c` + `file.h`。主要ファイル:

- `API.py`(`@proc`/`@instr`/`config`)、`API_scheduling.py`(primitive 群)、`API_cursors.py`(Cursors)
- `core/LoopIR.py`(IR 定義)、`rewrite/LoopIR_scheduling.py`(primitive 実体)
- `rewrite/new_eff.py` + `new_analysis_core.py`(`Check_*` 効果解析)、`LoopIR_unification.py`(`replace`)、`proc_eqv.py`(proc 等価性の union-find)

## Exo 2(ASPLOS 2025): scheduling 言語そのものを育てる

PLDI 版の primitive は低水準で冗長(上の AVX2 例も約20ステップ)。Exo 2 は **schedule 操作自体をユーザー拡張可能**にした — trusted な細粒度 primitive を合成して**自前の scheduling ライブラリ**を書き、`tile2D`・auto-vectorize、果ては Halide の `compute_at` 風操作まで再現できる。

鍵は2つ:

- **AIR フレームワーク** — ユーザー拡張可能な scheduling 言語に不可欠な3要素: **Action**(コードを書き換える=primitive or ユーザー定義)/ **Inspection**(ループ境界・アクセスパターン等を問い合わせる)/ **Reference**(コード位置を指す)。
- **Cursors** — AIR を融合した新機構。テキストエディタのカーソルのように **AST 上の位置**(文・ループネスト・**文と文の間の gap** まで)を指す相対参照。`p.find("for i in _:_")` のパターンマッチ(`_` ワイルドカード、`#n` で n+1 番目、`;` で文列)で取得し、`next`/`prev`/`parent`/`before`/`after`/`body` で移動。型は Stmt/Gap/Block/Arg/Invalid。
  - **Cursor forwarding**: 書き換えで p1→p2 になると p1 を指すカーソルは p2 へ写し直す必要がある。各 primitive が**転送関数**を返し、`p2.forward(c1)` がそれらを合成する。書き換えで消えた文を指すカーソルは **invalid cursor** に転送される(想定挙動)。転送と移動は**非可換**。

結果: scheduling ライブラリが **80以上のカーネル**にわたって労力を償却し、scheduling コード量を**桁違いに削減**、3 プラットフォームで SOTA に伍する性能。

## 立ち位置

| | Halide / TVM | Exo |
|---|---|---|
| algorithm/schedule 分離 | あり | あり |
| schedule の実装 | **lowering-based**(コンパイラ内で段階的に降ろす) | **rewrite-based**(IR→IR、各段 printable・検査可能) |
| ハード対応 | コンパイラに組み込み | **ユーザーライブラリ**(exocompilation) |
| 命令選択 | コンパイラの裁量 | `replace` を**ユーザーが明示**+ 等価性を機械検証 |
| 正しさ | 主にテスト | effect analysis + SMT で**書き換え等価を保証** |

## Links

- [The Exo Language(公式)](https://exo-lang.dev/) — [Compiler Explorer](https://godbolt.exo-lang.dev/) で例を試せる
- [exo-lang/exo (GitHub)](https://github.com/exo-lang/exo) — MIT ライセンス。`docs/`(Design/System/object_code/instructions/memories/Cursors)が一次情報
- [Exocompilation for Productive Programming of Hardware Accelerators (PLDI 2022)](https://dl.acm.org/doi/abs/10.1145/3519939.3523446) — Ikarashi\*, Bernstein\*, Reinking, Genc, Ragan-Kelley([full+appendix PDF](https://people.csail.mit.edu/yuka/pdf/exo_pldi2022_full.pdf))
- [Exo 2: Growing a Scheduling Language (ASPLOS 2025 / arXiv 2411.07211)](https://arxiv.org/abs/2411.07211) — Ikarashi, Qian, Droubi, Reinking, Bernstein, Ragan-Kelley

### 出典の区別

- **リポジトリ直読**(`~/workspace/github.com/exo-lang/exo`、`docs/` と `examples/`): 構文・パイプライン・`@instr`/`replace`/`Memory`・primitive 語彙・AVX2 matmul の実スケジュール・Cursors/forwarding・`Check_*`(`new_eff.py`)等の実装事実。
- **Web 検索**: 論文名・著者・所属(MIT)・PLDI 2022 / ASPLOS 2025・MIT ライセンス。

## 関連

- [[almide-kernel]] — Exo を先行例とする検証付きカーネル。Exo が effect analysis/SMT で解く rewrite 等価性のうち permutation 部分を「恒等インデックス1実行で decidable」に落とす
- [[theorem-proving]] — Exo の正しさは自動寄り(frontend は SMT、rewrite は効果解析)。一般の変換等価性はここに乗る
- [[formal-methods]] — schedule の正しさを機械保証する形式手法の応用
- [[equality-saturation]] — 等価変換つながり。eq-sat は等価形を網羅探索して選ぶ、Exo は**人間が指定した書き換え列**の等価性を検証する(探索 vs 検証)
- [[deterministic-codegen]] — per-target な C 生成と、等価性検証が成立する前提としての決定性
