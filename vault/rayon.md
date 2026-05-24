---
title: rayon
tags: [rust, concurrency, parallelism, crate]
created_at: 2026-05-24
updated_at: 2026-05-24
srs_state: new
card_count: 12
reviewed_count: 0
next_due: 2026-05-24
---

[[rust|Rust]] のデータ並列処理ライブラリ。**`.iter()` を `.par_iter()` に変えるだけで並列化が完了する** API 設計と、Rust の型システムによるデータ競合の静的防止を両立する。内部は [[work-stealing]] スケジューラで駆動される。

作者は **Niko Matsakis** (Rust 言語チーム、borrow checker の設計者)。Rust エコシステムにおける CPU バウンド並列処理のデファクトスタンダード。

## アーキテクチャ: 2クレート構成

```
rayon (1.12.0)              rayon-core (1.13.0)
┌──────────────────┐        ┌──────────────────────┐
│ 並列イテレータ    │        │ スレッドプール管理     │
│ ParallelIterator │───────→│ work-stealing        │
│ par_sort 等      │        │ join / scope / spawn │
│ ユーザー向け API  │        │ crossbeam-deque 依存  │
└──────────────────┘        └──────────────────────┘
```

分離の理由: 複数バージョンの rayon が同一バイナリに共存しても、**グローバルスケジューラは1つだけ**であることを保証するため。rayon-core は v1.0 で安定化済み。

## 基本: par_iter

```rust
use rayon::prelude::*;

// 逐次版
let sum: i32 = data.iter().map(|&x| x * x).sum();

// 並列版 — .iter() を .par_iter() に変えるだけ
let sum: i32 = data.par_iter().map(|&x| x * x).sum();
```

`par_iter()` は `&[T]`, `&Vec<T>`, `&HashMap<K,V>` 等に対して使える。`par_iter_mut()` で可変参照、`into_par_iter()` で所有権の消費。

## 主要 API

### join — 二分岐の並列実行

```rust
let (left_sum, right_sum) = rayon::join(
    || compute_left(&data[..mid]),
    || compute_right(&data[mid..]),
);
```

- `closure_a` を現スレッドで即座に実行開始
- `closure_b` を deque に push（他スレッドが steal 可能に）
- **スタックのみ使用**、ヒープ割り当てなし → 最も低オーバーヘッド
- 再帰的分割統治に最適

### scope — 動的タスク生成

```rust
rayon::scope(|s| {
    for item in &work_items {
        s.spawn(move |_| process(item));
    }
});
// ← ここで全タスクの完了が保証される
```

- ループ内で任意個のタスクを動的に生成できる
- `join` と異なりタスクは**ヒープに割り当てられる**
- スコープを抜けると全タスク完了を待つ (構造化並行性)
- 変種: `scope_fifo()` (FIFO 順序), `in_place_scope()` (現スレッド上で実行)

### spawn — fire-and-forget

```rust
rayon::spawn(|| {
    heavy_background_work();
});
```

グローバルスコープにタスクを投入。結果の取得にはチャネル等が必要。

### ThreadPoolBuilder — カスタムプール

```rust
let pool = rayon::ThreadPoolBuilder::new()
    .num_threads(4)
    .thread_name(|i| format!("worker-{i}"))
    .stack_size(8 * 1024 * 1024)
    .build()
    .unwrap();

pool.install(|| {
    // この中の rayon 操作はこのプールを使う
    data.par_iter().for_each(|x| process(x));
});
```

- デフォルトは `available_parallelism()` (通常は論理コア数) スレッド
- `build_global()` でグローバルプールを設定 (一度きり)
- `use_current_thread()` で呼び出しスレッドをワーカー0として参加させる
- 環境変数 `RAYON_NUM_THREADS` でも制御可能

## ParallelIterator トレイト設計

### 2層のトレイト

| トレイト | 要件 | 使える操作 |
|---|---|---|
| `ParallelIterator` | `drive_unindexed(consumer)` | `for_each`, `map`, `filter`, `reduce`, `flat_map`, `find_any` 等 |
| `IndexedParallelIterator` | 上記 + `len()`, `drive(consumer)`, `with_producer(cb)` | 上記 + `zip`, `enumerate`, `skip`, `take`, `rev`, `collect_into_vec`, `position` 等 |

`IndexedParallelIterator` は正確な長さが既知のイテレータ。`Vec`, `slice`, `Range` 等。`filter()` を通すと長さが不定になるため `ParallelIterator` に降格する。

### 内部の Producer / Consumer パターン

```
ParallelIterator チェーン:
  source.par_iter().map(f).filter(g).sum()

内部変換:
  Producer (データソース)
    → split_at(mid) で再帰的に二分割
    → 閾値以下で逐次 Iterator にフォールバック

  Consumer (集約操作)
    → split_at(mid) で対応する受け手を分割
    → 部分結果を reduce_with() で統合
```

`bridge_producer_consumer` 関数が両者を接続し、`rayon::join()` で再帰的に並列実行する。

### 分割戦略の制御

```rust
(0..1_000_000)
    .into_par_iter()
    .with_min_len(1000)    // これ以下には分割しない
    .with_max_len(10000)   // これ以上の塊は作らない
    .for_each(|x| compute(x));
```

- `with_min_len()` — 逐次フォールバックの閾値。小さすぎるとオーバーヘッド増大
- `with_max_len()` — 最大チャンクサイズ。大きすぎると並列度不足
- `by_exponential_blocks()` — 逐次ブロックを指数的に拡大。ストリーミング向け
- `by_uniform_blocks(n)` — 固定サイズブロック

## 並列ソート・チャンク等

```rust
// 並列ソート
let mut v = vec![5, 3, 1, 4, 2];
v.par_sort();                        // 安定ソート
v.par_sort_unstable();               // 不安定ソート (高速)
v.par_sort_by_cached_key(|x| expensive_key(x));

// 並列チャンク
data.par_chunks(100).for_each(|chunk| process(chunk));
data.par_chunk_by(|a, b| a / 10 == b / 10);

// 並列ウィンドウ (v1.12.0〜)
data.par_array_windows::<[_; 3]>().for_each(|w| { /* 3要素ずつ */ });

// 並列文字列
"hello world".par_split_whitespace().for_each(|word| { /* ... */ });
```

## reduce と fold

```rust
use rayon::prelude::*;

// reduce: 連想操作 + 単位元
let max = data.par_iter()
    .copied()
    .reduce(|| i32::MIN, |a, b| a.max(b));

// fold: スレッドローカルな部分結果 → reduce で統合
let freq: HashMap<&str, usize> = words.par_iter()
    .fold(HashMap::new, |mut map, word| {
        *map.entry(word.as_str()).or_insert(0) += 1;
        map
    })
    .reduce(HashMap::new, |mut a, b| {
        for (k, v) in b { *a.entry(k).or_insert(0) += v; }
        a
    });
```

`fold` はスレッドごとに独立したアキュムレータを作る。`reduce` は結合的 (associative) である必要がある。

## par_bridge — 逐次→並列変換

```rust
use rayon::iter::ParallelBridge;

let results: Vec<_> = reader.lines()
    .map(|l| l.unwrap())
    .par_bridge()            // 逐次イテレータを並列化
    .map(|line| process(&line))
    .collect();
```

内部で `Mutex` を使い逐次 `next()` を同期呼び出しする。**`next()` 自体がボトルネックになりうる**。可能なら `par_iter()` を直接使うべき。

## パフォーマンス特性

| 特性 | 詳細 |
|---|---|
| スレッド数 | デフォルト = 論理コア数。`ThreadPoolBuilder` で設定可能 |
| 最小有効規模 | 個々の操作が**数マイクロ秒以上**かかる場合に効果あり |
| join のコスト | スタックのみ。ヒープ割り当てなし |
| scope のコスト | タスクごとにヒープ割り当て |
| キャッシュ局所性 | LIFO 実行で良好。ただし OS のスレッドマイグレーションで無効化されうる |
| CPU pinning 効果 | `sched_setaffinity` で最大 20% 高速化の報告あり |
| 逐次フォールバック | 分割が閾値以下になると通常の Iterator に変換して逐次実行 |

### 期待どおり速くならないとき

- **不均衡な入力**: 重い要素が偏っていると work-stealing の分割が追いつかない → `with_min_len(1)` で要素単位まで分割
- **ナノ秒級の極小操作**: オーバーヘッドが利得を上回る → `with_min_len()` を大きく設定
- **`with_max_len()` の安易な設定**: deque 操作のトラフィック増大で逆に遅くなるケースあり

## 使うべき場面 / 使うべきでない場面

| 場面 | 適否 | 理由 |
|---|---|---|
| CPU バウンドな map/filter/reduce | **最適** | データ並列の本領 |
| 大量データのソート | **最適** | par_sort が分割統治で並列化 |
| 再帰的分割統治 | **最適** | join がそのまま対応 |
| I/O バウンドタスク | **不適** | ブロッキングがスレッドプールを占有 → 飢餓 |
| 少量データ (数百以下) | **不適** | オーバーヘッド > 利得 |
| async ランタイム内 | **不適** | async ワーカーをブロック |

### async との共存パターン

```rust
// tokio 内から rayon を使うときは spawn_blocking で隔離
let result = tokio::task::spawn_blocking(move || {
    data.par_iter()
        .map(|x| heavy_computation(x))
        .collect::<Vec<_>>()
}).await.unwrap();
```

## 競合・代替との比較

| ライブラリ | 用途 | モデル |
|---|---|---|
| **rayon** | CPU バウンド データ並列 | work-stealing スレッドプール |
| **std::thread** | 低レベルスレッド操作 | OS スレッド直接管理 |
| **crossbeam** | 同期プリミティブ | スコープ付きスレッド、チャネル、deque |
| **tokio** | I/O バウンド非同期処理 | async タスク + イベントループ |

- 「データを並列に処理したい」→ **rayon**
- 「大量の I/O 接続を捌きたい」→ **tokio**
- rayon の内部は **crossbeam-deque** に依存。crossbeam は rayon のインフラ

## バージョン履歴の重要な変更

| バージョン | 変更 |
|---|---|
| 0.7 | rayon-core 分離。グローバルスケジューラの一意性保証 |
| 1.0 (2018) | 安定版リリース |
| 1.1 | FIFO spawn (`spawn_fifo`, `scope_fifo`) |
| 1.3 | タプル (最大12要素) の `IntoParallelIterator` (MultiZip) |
| **1.4** | **新スケジューラ** (ターゲットウェイクアップ)。性能大幅改善 |
| 1.6 | `fold_chunks`。`broadcast()` API |
| 1.7 | `take_any` / `skip_any`。`yield_now()` / `yield_local()` |
| 1.8 | `use_current_thread()`。`available_parallelism()` ベースのスレッド数決定 |
| 1.9 | `by_exponential_blocks` / `by_uniform_blocks`。`walk_tree` 系 |
| 1.10 | `par_chunk_by` / `par_chunk_by_mut` |
| **1.12** | `par_array_windows`。最小 Rust 1.85 |

## 押さえどころ（カード化候補）

- rayon の一言説明 → **「.iter() を .par_iter() に変えるだけで並列化」を実現する Rust のデータ並列ライブラリ。内部は work-stealing スケジューラ。CPU バウンド処理のデファクト**
- rayon の内部スケジューラ → **各スレッドがローカル deque を持ち、LIFO で自タスクを処理。暇なスレッドが他の deque から FIFO で steal。crossbeam-deque (Chase-Lev) に依存**
- join vs scope の違い → **join: 2分岐のみ、スタック割り当て、最低オーバーヘッド。scope: 動的にN個のタスクを生成可能、ヒープ割り当て。両方ともスコープ脱出時に全完了保証**
- ParallelIterator vs IndexedParallelIterator → **Indexed は len() が既知で正確な分割が可能。zip, enumerate, skip, take 等が追加で使える。filter() を通すと Indexed から降格**
- fold と reduce の違い → **fold はスレッドローカルなアキュムレータを生成 (型が異なってよい)。reduce は結合的操作で部分結果を統合 (同じ型)**
- par_bridge の注意点 → **逐次イテレータを並列化するが、内部で Mutex を使い next() を同期呼び出し。next() 自体がボトルネックになりうる。可能なら par_iter() を直接使うべき**
- rayon で効果が出ない場合 → **ナノ秒級の極小操作 (オーバーヘッド > 利得)、不均衡な入力 (重い要素の偏り)、with_max_len() の安易な設定 (deque トラフィック増大)**
- rayon と async の共存 → **async ランタイム内で直接使うと async ワーカーをブロックする。tokio::task::spawn_blocking 内で rayon を使い、CPU バウンドと I/O バウンドを分離**
- rayon-core が分離されている理由 → **複数バージョンの rayon が共存してもグローバルスレッドプールは1つだけであることを保証するため。rayon-core は semver で互換性維持**
- rayon を使うべきでない場面 → **I/O バウンド (スレッドプール占有)、少量データ (オーバーヘッド)、async ランタイム内 (ブロッキング)。これらは tokio 等に任せる**
- with_min_len / with_max_len → **分割粒度の制御。min_len は逐次フォールバックの閾値、max_len は最大チャンクサイズ。デフォルトの適応的分割が多くの場合最適**
- rayon の分割統治の流れ → **Producer が split_at で二分割 → join で並列再帰 → 閾値以下で逐次 Iterator にフォールバック → Consumer が部分結果を reduce で統合**

## Links

- [GitHub (rayon-rs/rayon)](https://github.com/rayon-rs/rayon)
- [crates.io](https://crates.io/crates/rayon)
- [docs.rs](https://docs.rs/rayon)
- [Parallel Iterators Part 2: Producers — Niko Matsakis](https://smallcultfollowing.com/babysteps/blog/2016/02/25/parallel-iterators-part-2-producers/)
- [Optimization adventures: making a parallel Rust workload 10x faster — Guillaume Endignoux](https://gendignoux.com/blog/2024/11/18/rust-rayon-optimized.html)

## 関連

- [[work-stealing]] — rayon の内部スケジューリングアルゴリズム
- [[rust]] — 実装言語
- [[hashbrown]] — rayon feature で並列イテレータを提供
