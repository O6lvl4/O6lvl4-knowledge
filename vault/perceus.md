---
title: Perceus
tags: [computer-science, memory-management, reference-counting, compiler]
created_at: 2026-05-24
updated_at: 2026-05-25
---

GC なしの精密参照カウント (RC) + reuse 解析アルゴリズム。Reinking, Xie, de Moura, Leijen (Microsoft Research) による PLDI 2021 論文 (Distinguished Paper Award)。Koka 言語のメモリ管理の中核。

論文の核心的主張: **たった3つの RC 操作ルールだけで、GC なしのメモリ管理が完結する。** さらにこの3ルールの上に reuse analysis と drop specialization を重ねることで、関数型プログラミングが命令型と同等のメモリ効率を達成する。

## RC 操作の3ルール

線形リソース計算 (λ₁) 上で、すべての RC 操作を3つのルールに帰着させる。

| Rule | 操作 | 意味 | 生成されるコード |
|---|---|---|---|
| Rule 1 | `dup(x)` | 変数をコピーするとき RC を増加 | `rc_inc(x)` |
| Rule 2 | `drop(x)` | 変数が不要になったとき RC を減少 | `rc_dec(x)` → RC==0 なら `free(x)` |
| Rule 3 | recursive drop | RC==0 で解放するとき、子フィールドを再帰的に drop | `drop(x.f1); drop(x.f2); free(x)` |

この3ルールの前提: λ₁ では **各変数はちょうど1回使用される**。複数回使うなら明示的に `dup`、使わないなら明示的に `drop`。コンパイラが自動挿入するのでプログラマは意識しない。

## Rule 1: dup — コピー時に RC 増加

変数が複数回使用される場合、コンパイラが `dup` を挿入する。

```
fun map(xs, f)
  match xs
    Cons(x, xx) ->
      dup(f)              // f は f(x) と map(xx, f) の2箇所で使用 → dup
      val y  = f(x)
      val ys = map(xx, f)
      Cons(y, ys)
    Nil -> ...
```

**原則: dup は可能な限り遅く。** 使用直前まで引き延ばし、不要な dup を回避する。実際に両方の分岐を通るとは限らないため、導出の葉まで押し出す。

## Rule 2: drop — 不要時に RC 減少

変数がその後使用されない場合、コンパイラが `drop` を挿入する。

```
fun map(xs, f)
  match xs
    Cons(x, xx) -> ...
    Nil ->
      drop(f)             // f はこの分岐で不使用 → 即 drop
      Nil
```

**原則: drop は可能な限り早く。** 束縛の直後、最初の「使わない」ことが確定した地点で即座に挿入する。これにより RC==0 到達が早まり、メモリ消費のピークが下がる。

Rust のスコープベース解放と比較すると、Perceus はスコープ終了を待たず使用終了直後に解放するため、メモリ使用量がスコープベースの半分で済むケースがある。

## Rule 3: recursive drop — 構造的再帰で子を解放

Rule 2 で RC==0 になった複合オブジェクトは、子フィールドそれぞれに対して再帰的に drop を適用してから自身を解放する。

```c
// Rule 3 の素朴な実装
void drop_Cons(Cons* x) {
    if (is_unique(x)) {        // RC==1 → これが最後の参照
        drop(x->head);         // 子フィールドを再帰的に drop
        drop(x->tail);
        free(x);               // 自身を解放
    } else {
        rc_dec(x);             // RC>1 → カウントを減らすだけ
    }
}
```

この Rule 3 が **drop specialization** と **reuse analysis** の基盤になる。RC==1 の分岐で `free(x)` する代わりにメモリを再利用に回す発想が、Perceus の核心的な最適化を生む。

## 3ルールからの最適化

3ルール自体は正しくメモリを管理するだけだが、ここに2つの最適化を重ねることで性能が劇的に向上する。

### Reuse Analysis

パターンマッチで分解されたオブジェクトと、同じ分岐で構築される新オブジェクトが同サイズなら、メモリを直接再利用する。

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

### Drop Specialization

Rule 3 の recursive drop と reuse analysis を融合する最適化。`free` せずに reuse token として返す。

```c
// Rule 3 そのまま (free する)
if (is_unique(x)) { drop(x.f1); drop(x.f2); free(x); }
else { decref(x); }

// Drop specialization (free せず reuse token として返す)
if (is_unique(x)) { drop(x.f1); drop(x.f2); return &x; }  // reuse token
else { decref(x); return NULL; }
```

fast path (RC==1) では **free+alloc ペアが完全に消滅** する。これが Perceus を「Garbage Free」と呼ぶ根拠。

### 最適化の積み上げ

```
3ルール (正しさ)
  └─ Rule 1: dup → rc_inc
  └─ Rule 2: drop → rc_dec
  └─ Rule 3: recursive drop → 子を再帰的に drop + free
        │
        ├─ Reuse Analysis (効率)
        │    RC==1 なら同サイズオブジェクトのメモリを再利用
        │
        └─ Drop Specialization (融合)
             Rule 3 の free を reuse token 発行に置換
             → fast path で alloc も free も発生しない
```

## Drop Insertion アルゴリズム

3ルールの dup/drop をコンパイラが自動配置するアルゴリズム。ANF (A-Normal Form) 上で動作する。

1. プログラムを ANF に変換 (各部分式に名前を束縛)
2. 各変数の「最後の使用地点」を構文的に確定
3. **dup**: 変数が複数回使われる箇所で、2回目以降の使用前に挿入
4. **drop**: 変数がある分岐で使われない場合、分岐の先頭で挿入

ANF のおかげで各変数の生存区間が構文的に明確になり、drop 位置を正確に決定できる。GC のような到達可能性解析は不要。

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

3ルール + reuse が正しく効いていれば、map, filter, ツリー走査 (Zipper パターン) が alloc ゼロで動作する。`fip`/`fbip` はその条件をコンパイラが静的にチェックするアノテーション。

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

- Perceus の3ルール → Rule 1: dup = rc_inc (コピー時)、Rule 2: drop = rc_dec (不要時)、Rule 3: recursive drop (RC==0 で子を再帰 drop + free)。この3つだけで GC なしメモリ管理が完結
- Rule 1 の原則 → dup は可能な限り遅く (導出の葉まで)。不要な rc_inc を回避し、分岐で使われない可能性を考慮
- Rule 2 の原則 → drop は可能な限り早く (束縛直後)。RC==0 到達を早めメモリ消費ピークを下げる。スコープベースの Rust より早期に解放
- Rule 3 → drop specialization の基盤 → Rule 3 の recursive drop で free する代わりに reuse token を返す。これが drop specialization の本質。free+alloc ペアが完全消滅
- Reuse analysis → パターンマッチで分解時、RC==1 かつ同サイズなら reuse token を発行。新コンストラクタに渡して in-place 再利用。RC>1 なら通常 alloc にフォールバック
- 3ルールの前提 → 線形リソース計算 (λ₁)。各変数はちょうど1回使用。複数回使うなら dup、使わないなら drop。コンパイラが ANF 上で自動挿入
- FBIP (Functional But In-Place) → 3ルール + reuse が完全に効く条件をコンパイラが静的保証。fip: 定数スタック + ヒープ割当ゼロ。fbip: 解放は許容
- Perceus vs Rust → Rust: コンパイル時の静的所有権、ライフタイム注釈必要、reuse なし。Perceus: 実行時 RC、注釈不要、reuse で in-place 更新
- Lean 4 との関係 → "Counting Immutable Beans" が先行。Perceus は形式化 (λ₁ + 3ルール) と reuse analysis を強化した発展版
- Reuse が効かないケース → RC > 1 (共有)、サイズ不一致、中間参照保持。フォールバックは通常 alloc/free。リファクタリングで消失する fragility あり

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
- [[almide-list-mutation]] — `rc > 1` 判定が list の破壊的 push で COW を発火させる(Perceus の実応用)
