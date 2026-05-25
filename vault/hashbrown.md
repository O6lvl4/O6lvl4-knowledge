---
title: hashbrown
tags: [rust, data-structure, hash-table, crate]
created_at: 2026-05-24
updated_at: 2026-05-24
---

[[swiss-table|SwissTable]] アルゴリズム（Google の `absl::flat_hash_map`）の [[rust|Rust]] 移植。**Rust 1.36 以降、`std::collections::HashMap` / `HashSet` の内部実装そのもの**である。独立クレートとして公開されており、std にはない追加機能を提供する。

開発者は Amanieu d'Antras 氏。リポジトリは `rust-lang` org 配下に移管されている。

## なぜ hashbrown を直接使うのか

std の HashMap は hashbrown だが、std 経由では使えない機能がある：

| 機能 | std HashMap | hashbrown |
|---|---|---|
| デフォルトハッシャー | SipHash 1-3 (HashDoS 耐性) | **foldhash** (高速、HashDoS 耐性なし) |
| `no_std` | 不可 | **可能** (`alloc` のみ必要) |
| カスタムアロケータ | nightly `allocator_api` のみ | **stable でも可能** (`allocator-api2`) |
| `entry_ref` API | なし | **あり** (借用キーでエントリアクセス) |
| `HashTable` | なし | **あり** (低レベル安全 API) |
| rayon 並列イテレータ | なし | **`rayon` feature** |
| serde 対応 | なし | **`serde` feature** |

hashbrown を直接使う主な動機は「速度」「`no_std`」「拡張 API」のいずれか。

## 主要な型

### `HashMap<K, V, S, A>`

std の `HashMap` のドロップイン代替。追加のジェネリックパラメータ `A` でカスタムアロケータを受け取れる。

```rust
use hashbrown::HashMap;

let mut map = HashMap::new();
map.insert("key", 42);
assert_eq!(map.get("key"), Some(&42));
```

### `HashSet<T, S, A>`

`HashMap<T, (), S, A>` のラッパー。

### `HashTable<T, A>`

v0.14.2 で導入。`Hash` / `Eq` を型に実装していなくても使える低レベル安全 API。ハッシュ値と比較関数をクロージャとして外から渡す。

```rust
use hashbrown::{HashTable, DefaultHashBuilder};
use std::hash::BuildHasher;

let mut table = HashTable::new();
let builder = DefaultHashBuilder::default();
let hasher = |val: &i32| builder.hash_one(val);

// 挿入: ハッシュ値とリハッシュ用クロージャを明示的に渡す
table.insert_unique(hasher(&1), 1, |v| hasher(v));
table.insert_unique(hasher(&2), 2, |v| hasher(v));

// 検索: ハッシュ値と等価判定クロージャを渡す
let found = table.find(hasher(&1), |&v| v == 1);
assert_eq!(found, Some(&1));
```

用途：
- キーとは異なる基準でハッシュ/比較したい場合
- 外部コンテキストに依存する等価判定
- `Hash` / `Eq` を実装できない型のテーブル管理
- インターニングテーブル、シンボルテーブル等の実装

### `RawTable<T, A>` (非推奨)

unsafe な生テーブル API。v0.15 で非推奨化、`raw-entry` feature でのみ有効。**新規コードでは `HashTable` を使うべき**。

## `entry_ref` API

std の `entry()` は所有キーを要求する。hashbrown の `entry_ref()` は借用キーでアクセスし、**キーが存在しない場合にのみ所有権変換が発生**する：

```rust
use hashbrown::HashMap;

let mut map: HashMap<String, Vec<usize>> = HashMap::new();

// std の entry(): 毎回 String を生成してしまう
// map.entry("hello".to_string()).or_insert_with(Vec::new);

// hashbrown の entry_ref(): &str で検索、挿入時のみ String 化
map.entry_ref("hello").or_insert_with(Vec::new).push(1);
map.entry_ref("hello").or_insert_with(Vec::new).push(2);
// ↑ 2回目: "hello" は既に存在するので String アロケーションは発生しない
```

ホットパスで `entry` を多用する場合、この差がパフォーマンスに直結する。

## デフォルトハッシャーの変遷

| 時期 | ハッシャー | 特徴 |
|---|---|---|
| 初期 | FxHash | Firefox 由来。高速だがアライン値で品質問題 |
| v0.7〜v0.14 | ahash | 高速。AES-NI / fallback 対応。FxHash の品質問題を解消 |
| **v0.15〜現在** | **foldhash** | ahash より更に高速。品質も良好 |

**注意: foldhash は HashDoS 耐性を提供しない。** ネットワーク由来のキー（ユーザー入力、HTTP ヘッダ等）を扱う場合は SipHash を明示的に指定すべき：

```rust
use hashbrown::HashMap;
use std::hash::RandomState;

// ネットワーク由来のキーには SipHash を使う
let mut map: HashMap<String, i32, RandomState> =
    HashMap::with_hasher(RandomState::new());
```

## `no_std` 対応

組み込みやカーネル等、`std` が使えない環境でも `alloc` クレートさえあれば動作する：

```rust
#![no_std]
extern crate alloc;

use hashbrown::HashMap;

fn example() {
    let mut map = HashMap::new();
    map.insert("sensor_id", 42);
}
```

## カスタムアロケータ

`allocator-api2` feature（デフォルト有効）により、stable Rust でもカスタムアロケータが使える：

```rust
use hashbrown::HashMap;

// A パラメータでカスタムアロケータを指定
let map: HashMap<String, i32, _, MyArenaAllocator> =
    HashMap::new_in(MyArenaAllocator::new());
```

アリーナアロケータや共有メモリアロケータ等と組み合わせて、メモリ配置戦略を制御できる。

## rayon 連携

`rayon` feature で並列イテレータが使える：

```rust
use hashbrown::HashMap;
use rayon::prelude::*;

let map: HashMap<i32, String> = (0..100_000)
    .map(|i| (i, format!("val_{i}")))
    .collect();

// 並列イテレーション
let even_count = map.par_iter()
    .filter(|(k, _)| *k % 2 == 0)
    .count();
```

## Feature Flags (v0.17)

| feature | デフォルト | 説明 |
|---|---|---|
| `default-hasher` | 有効 | foldhash をデフォルトハッシャーとして組み込む |
| `allocator-api2` | 有効 | stable でカスタムアロケータ対応 |
| `equivalent` | 有効 | `Equivalent` トレイトによるカスタム比較 |
| `inline-more` | 有効 | 追加のインライン最適化 |
| `rayon` | 無効 | 並列イテレータ |
| `serde` | 無効 | Serialize / Deserialize 実装 |
| `nightly` | 無効 | `#[may_dangle]` 等の nightly 機能 |
| `raw-entry` | 無効 | 非推奨 RawEntry API |

## hashbrown の内部実装 (SwissTable 固有の差異)

hashbrown は SwissTable の設計に忠実だが、Rust 固有の最適化がある：

### メモリレイアウト

```
[Padding] T_last ... T1 T0 | C0 C1 ... C_last [Mirror]
          ← データ (逆順) → ← 制御バイト →   ← 末尾ミラー →
```

- データスロットが **逆順** に配置される（制御バイトのインデックスとデータのインデックスが対称的になる）
- 末尾にグループ幅分のミラー制御バイトを配置（SIMD がバッファ境界を超えて読んでも安全）

### SIMD バックエンド選択

```rust
// コンパイル時に自動選択される
cfg_if! {
    if #[cfg(target_arch = "x86_64")] {
        // SSE2 (x86_64 では常に利用可能)
        // Group::WIDTH = 16
    } else if #[cfg(target_arch = "aarch64")] {
        // NEON
        // Group::WIDTH = 16
    } else {
        // ポータブル fallback (ビット演算)
        // Group::WIDTH = 8
    }
}
```

### 空テーブル最適化

```rust
let map: HashMap<String, i32> = HashMap::new();
// ↑ ヒープアロケーションゼロ。静的 EMPTY 配列を参照するのみ
// 最初の insert() でアロケーションが発生
```

## バージョン履歴の重要な変更

| バージョン | 変更 |
|---|---|
| v0.1 | 初回リリース。SwissTable の Rust 移植 |
| v0.7 | デフォルトハッシャーを FxHash → **ahash** に変更 |
| v0.14.0 | `allocator-api2` 対応。ARM NEON 最適化。`Equivalent` トレイト導入 |
| v0.14.2 | **`HashTable` 型を導入** |
| **v0.15.0** | **破壊的変更多数。** RawEntry 非推奨化、RawTable を private 化、`HashTable` が推奨に。デフォルトハッシャーを **foldhash** に変更 |
| v0.16.0 | foldhash 0.2.0 に更新 |
| v0.17.0 | MSRV 1.85。Entry API 拡張 (`into_map`, `into_table` 等) |
| v0.17.1 | 最新安定版 |

## 押さえどころ（カード化候補）

- hashbrown の正体 → **SwissTable (Google flat_hash_map) の Rust 移植。Rust 1.36 以降、std::collections::HashMap の内部実装そのもの。独立クレートとして追加機能を提供**
- hashbrown と std HashMap の最大の違い → **デフォルトハッシャーが異なる。std は SipHash 1-3 (HashDoS 耐性)、hashbrown は foldhash (高速だが HashDoS 耐性なし)**
- entry_ref の利点 → **借用キー (&str) でエントリにアクセスし、キーが存在しない場合にのみ String アロケーションが発生。std の entry() は毎回所有キーが必要で無駄なアロケーションが起きる**
- hashbrown を直接使う理由 → **no_std 対応、高速デフォルトハッシャー (foldhash)、カスタムアロケータ (stable)、entry_ref API、HashTable API、rayon 連携**
- HashTable の用途 → **Hash/Eq を実装しない型のテーブル管理。ハッシュ値と比較関数をクロージャで外から渡す。インターニングテーブルやシンボルテーブルの実装に最適**
- foldhash の HashDoS 注意 → **hashbrown のデフォルト foldhash は HashDoS 耐性がない。ネットワーク由来のキーには HashMap::with_hasher(RandomState::new()) で SipHash を明示指定すべき**
- hashbrown のデフォルトハッシャー変遷 → **FxHash → ahash (v0.7) → foldhash (v0.15)。性能と品質の改善が動機**
- hashbrown の空テーブル最適化 → **HashMap::new() はヒープアロケーションゼロ。静的 EMPTY 配列を参照するだけ。最初の insert で初めてアロケーション発生**
- v0.15 の破壊的変更 → **RawEntry/RawTable を非推奨化し HashTable を推奨に。デフォルトハッシャーを ahash から foldhash に変更。安全な API への移行**
- hashbrown のメモリレイアウト → **データスロットが逆順配置、制御バイトと分離。末尾にグループ幅分のミラー制御バイトを配置し SIMD のバッファ超過読み取りを安全に処理**

## Links

- [GitHub (rust-lang/hashbrown)](https://github.com/rust-lang/hashbrown)
- [crates.io](https://crates.io/crates/hashbrown)
- [docs.rs](https://docs.rs/hashbrown)
- [CHANGELOG](https://github.com/rust-lang/hashbrown/blob/master/CHANGELOG.md)

## 関連

- [[swiss-table]] — hashbrown が実装するアルゴリズム。Google の `absl::flat_hash_map` が原型
- [[rust]] — 実装言語。std HashMap のバックエンドとして組み込まれている
