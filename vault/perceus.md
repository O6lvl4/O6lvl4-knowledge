---
title: Perceus
tags: [computer-science, memory-management, reference-counting, compiler]
created_at: 2026-05-24
updated_at: 2026-05-24
---

GC なしの精密参照カウント (RC) + reuse 解析アルゴリズム。Reinking, Xie, de Moura, Leijen (Microsoft Research) による PLDI 2021 論文 (Distinguished Paper Award)。Koka 言語のメモリ管理の中核。関数型プログラミングでありながら命令型と同等のメモリ効率を達成する。

## 核心アイデア

```
// 通常の RC:
let mapped = list.map(data, f)  // alloc → ヒープ確保
// data dies → rc_dec → free → フリーリストに返す
// 次の alloc → フリーリストから取る

// Perceus:
let mapped = list.map(data, f)  // data の RC==1 なら data のメモリを直接上書き
// alloc も free も発生しない
```

3つの核心技術:
1. **Drop insertion**: 変数が dead になったとき自動で `rc_dec` を挿入
2. **Reuse analysis**: RC==1 なら同サイズのメモリをその場で再利用
3. **Drop specialization**: drop と reuse を融合して free+alloc ペアを消滅させる

## Drop Insertion

線形リソース計算 (λ₁) に基づく。各変数はちょうど1回使用されるか、明示的に drop される。

原則:
- **dup は可能な限り遅く** (導出の葉まで押し出す)
- **drop は可能な限り早く** (束縛の直後に生成)

```
// Koka の map 関数に Perceus が dup/drop を挿入した後
fun map(xs, f)
  match xs
    Cons(x, xx) ->
      dup(f)              // f は2回使われる → dup
      val y  = f(x)
      val ys = map(xx, f)
      Cons(y, ys)
    Nil ->
      drop(f)             // f はこの分岐で不使用 → 即 drop
      Nil
```

ANF (A-Normal Form) 上で動作し、各変数の「最後の使用地点」が構文的に確定するため、drop 位置を正確に決定できる。

## Reuse Analysis

パターンマッチで分解されたオブジェクトと、同じ分岐で構築される新オブジェクトが同サイズなら、メモリを直接再利用する。

### Reuse Token

```
fun map(xs, f)
  match xs
    Cons(x, xx) ->
      val ru = if is_unique(xs) then &xs else NULL  // reuse token 発行
      dup(f)
      val y  = f(x)
      val ys = map(xx, f)
      if ru != NULL
        ru->head = y; ru->tail = ys  // in-place 再利用 (alloc なし)
      else
        alloc Cons(y, ys)            // 共有されているなら通常確保
    Nil ->
      drop(f)
      Nil
```

条件:
- 古いオブジェクトと新しいオブジェクトが同じバイトサイズ (同じ型でなくてよい)
- 実行時に RC==1 (ユニーク参照)
- コンパイラが reuse token を発行する構文位置にあること

## Drop Specialization

drop と reuse を融合する最適化:

```c
// 通常の drop: free する
if (is_unique(x)) { drop(x.f1); drop(x.f2); free(x); }
else { decref(x); }

// Drop specialization: free せずに reuse token として返す
if (is_unique(x)) { drop(x.f1); drop(x.f2); return &x; }  // reuse token
else { decref(x); return NULL; }
```

fast path (RC==1) では free+alloc ペアが完全に消滅する。

## FBIP (Functional But In-Place)

Perceus の reuse analysis を前提にした設計パターン。Lorenzen, Leijen, Swierstra, ICFP'23 ("FP²") で形式化。

| キーワード | 保証 | スタック | ヒープ割当 |
|---|---|---|---|
| `fip` | 完全 in-place | 定数 | ゼロ (引数がユニークなら) |
| `fbip` | ほぼ in-place | 非定数可 | ゼロ (解放は可) |

```koka
// fip: alloc/free ゼロで動作することをコンパイラが保証
fip fun reverse-acc(xs : list<a>, acc : list<a>) : list<a>
  match xs
    Cons(x, xx) -> reverse-acc(xx, Cons(x, acc))  // Cons セルを in-place 再利用
    Nil -> acc
```

map, filter, ツリー走査 (Zipper パターン) が in-place で動作する条件をコンパイラが静的にチェック。

## Koka 言語

| 項目 | 値 |
|---|---|
| 設計者 | Daan Leijen (Microsoft Research) |
| 最新バージョン | v3.2.3 (2026-03-17) |
| パラダイム | 関数型、Algebraic Effects + Handlers |
| コンパイルターゲット | C11 → gcc/clang |
| メモリ管理 | Perceus (GC なし) |
| アロケータ | mimalloc |
| ライセンス | Apache 2.0 |

Algebraic Effects: 副作用を型レベルで追跡し、ハンドラで処理する。例外、async/await、非決定性を言語機能ではなくライブラリとして定義可能。

## ベンチマーク

PLDI'21 の結果 (メモリ割当中心のベンチマーク):
- 赤黒木 (rbtree): 純粋関数型 Koka が C++ の in-place 変更版の 10% 以内
- 永続データ構造では Koka/Lean が C++ を上回るケースもある (reuse + mimalloc)
- 全体として OCaml, Haskell, Swift, Java と競合的

第三者ベンチマーク (Pen 言語):
- Perceus RC は Atomic RC と比べ 1.87x - 4.31x 高速

## 関連研究

| 研究 | 関係 |
|---|---|
| Lean 4 "Counting Immutable Beans" (IFL'19) | Perceus に先行。借用参照で dup/drop を省略。Perceus が形式化と reuse analysis を強化 |
| Frame Limited Reuse (Lorenzen & Leijen, ICFP'22) | Perceus の reuse 解析の脆弱性を改善。drop-guided reuse でより堅牢に |
| FP² (ICFP'23) | FBIP の形式化。fip/fbip キーワードによるコンパイル時保証 |
| Swift ARC | コンパイラ挿入型 RC だが reuse analysis なし。サイクル参照がありうる |
| Lobster | 所有権解析で RC 操作の約 95% を静的除去。reuse analysis は持たない |

### Perceus vs [[rust|Rust]] の所有権

| 側面 | Rust | Perceus (Koka) |
|---|---|---|
| 所有権 | コンパイル時に静的決定 | 実行時 RC で追跡 |
| 解放タイミング | スコープ終了時 (静的) | 使用終了直後 (RC==0 の瞬間) |
| メモリ使用量 | スコープベースで不必要に長保持する場合あり | 即座に解放、スコープベースの半分で済むケースも |
| プログラマ負担 | ライフタイム注釈、借用規則 | 完全に透過的、注釈不要 |
| RC オーバーヘッド | なし | あり (reuse/borrow で大幅削減) |
| reuse | なし (ムーブセマンティクス) | あり (自動 in-place 更新) |

## 制限

| 制限 | 詳細 |
|---|---|
| サイクル参照 | Koka は純粋関数型なのでサイクルなし。`ref` を使うと可能だが手動破壊が必要 |
| マルチスレッド | 共有データにはアトミック RC (relaxed ordering) が必要。非共有は非アトミックで高速 |
| Reuse 不成立 | RC > 1 (共有)、サイズ不一致、中間参照保持時。通常の alloc/free にフォールバック |
| Fragility | 小さなリファクタリングで reuse が消失する可能性 (Frame Limited Reuse で一部改善) |
| 短命大量オブジェクト | GC の世代別回収が一括処理で効率的なケースがある。RC は個別 drop コスト |

## [[region-inference|Region Inference]] との関係

| 側面 | Perceus | Region Inference |
|---|---|---|
| 解放単位 | オブジェクト単位 (RC==0 で即解放) | リージョン単位 (letregion 終了で一括解放) |
| 再利用 | reuse token で同サイズオブジェクトを in-place 再利用 | リージョン内は bump allocator で再利用なし |
| 空間リーク | RC==0 で即解放なのでリーク少ない | LIFO 制約で不必要に長生きする問題あり |
| 判定時点 | 実行時 (RC チェック) | コンパイル時 (型推論) |
| 併用可能性 | bump allocator と共存可能。リージョン内で Perceus 的 reuse を行う構成が考えられる |

## 押さえどころ（カード化候補）

- Perceus の核心 → RC==1 (ユニーク参照) のオブジェクトを同サイズの新オブジェクトとして直接再利用。alloc も free も発生しない。GC なしで関数型プログラミングを命令型と同等の効率に
- Drop insertion の原則 → dup は可能な限り遅く (葉まで)、drop は可能な限り早く (束縛直後)。線形リソース計算に基づき、各変数はちょうど1回使用 or 明示的 drop
- Reuse token の仕組み → パターンマッチで分解時に RC==1 なら reuse token を発行。同サイズのコンストラクタに渡して in-place 再利用。RC>1 なら NULL → 通常 alloc にフォールバック
- Drop specialization → drop と reuse を融合。RC==1 のとき free せずに reuse token として返す。fast path で free+alloc ペアが完全に消滅
- FBIP (Functional But In-Place) → fip: 定数スタック + ヒープ割当ゼロを保証。fbip: 解放は許容。コンパイラが静的にチェック。list.reverse, tree.map が alloc ゼロで動作
- Perceus vs Rust → Rust: 所有権をコンパイル時に静的決定、ライフタイム注釈が必要。Perceus: 実行時 RC で追跡、注釈完全不要、reuse で in-place 更新。Rust にはムーブがあるが reuse はない
- サイクル参照の扱い → Koka は純粋関数型なので不変データにサイクルが構造的に不在。ref (可変参照) を使えばサイクル可能だが手動破壊が必要
- Reuse が効かないケース → RC > 1 (共有されている)、サイズ不一致、中間参照保持。通常の alloc/free にフォールバック。小さなリファクタリングで reuse が消失する fragility も
- Lean 4 との関係 → Lean 4 の "Counting Immutable Beans" が先行研究。借用参照で dup/drop を省略。Perceus が形式化と reuse analysis を強化した発展版
- Frame Limited Reuse → Perceus の reuse 解析の脆弱性を改善。drop-guided reuse でより堅牢なアルゴリズム。各関数呼び出しで保持するメモリが定数因子で限界づけられることを保証
- ベンチマーク結果 → 赤黒木で純粋関数型 Koka が C++ in-place 版の 10% 以内。永続データ構造では C++ を上回るケースも。reuse + mimalloc の組み合わせ効果
- Perceus と Region Inference の併用可能性 → 解放単位が異なる (オブジェクト vs リージョン)。bump allocator (リージョン) 内で Perceus 的 reuse を行う構成が原理的に可能
- Koka の Algebraic Effects → 副作用を型レベルで追跡しハンドラで処理。例外、async/await、非決定性をライブラリとして定義可能。Perceus + Effects で GC もランタイムシステムも不要な C11 コード生成
- 精密 RC の最適化 → 値型はスタックにアンボックス配置 (RC 不要)。借用推論 (borrow inference) で引数の dup/drop を省略。スレッドは shared/local 分割で非共有は非アトミック RC

## Links

- [Perceus (PLDI 2021)](https://www.microsoft.com/en-us/research/publication/perceus-garbage-free-reference-counting-with-reuse/)
- [Koka Language (GitHub)](https://github.com/koka-lang/koka)
- [Koka Book](https://koka-lang.github.io/koka/doc/book.html)
- [Frame Limited Reuse (ICFP 2022)](https://www.microsoft.com/en-us/research/publication/reference-counting-with-frame-limited-reuse/)
- [FP² (ICFP 2023)](https://dl.acm.org/doi/10.1145/3607840)
- [Counting Immutable Beans (Lean 4)](https://arxiv.org/abs/1908.05647)

## 関連

- [[region-inference]] — 別のアプローチで GC なしメモリ管理。Perceus とは解放単位が異なる (オブジェクト vs リージョン)
- [[rust]] — 所有権 + 借用規則による静的メモリ管理。Perceus は実行時 RC + reuse で注釈不要
- [[copy-on-write]] — RC==1 でのコピー回避は CoW と同じ精神。Perceus の reuse はさらに進んで alloc 自体を回避
