---
title: BTreeMap
tags: [computer-science, data-structure, rust]
created_at: 2026-06-01
updated_at: 2026-06-01T09:55:02+09:00
---

**キーが整列順で保持される連想配列**。B木(多分木の平衡探索木)が基盤で、[[rust|Rust]] 標準ライブラリの `BTreeMap` が代表。HashMap([[swiss-table]])が「順不同・平均 O(1)」なのに対し、こちらは「**整列・範囲クエリ可・O(log n)**」。

## なぜ二分木でなく B木か

平衡二分探索木(赤黒木等)でも O(log n) は出るが、各ノードがキー1個＝**ポインタ追跡(キャッシュミス)が深さ分**発生する。B木は **1ノードに多数のキーを詰める**ので:

- 木が浅くなり、ポインタ追跡=キャッシュミスが減る
- 1回のキャッシュライン読み込みで複数キーを比較できる

→ **メモリ階層(キャッシュ)に優しい**のが現代の B木採用理由。元々はディスクブロック単位の探索(DB/ファイルシステム)向けだった発想を、RAM のキャッシュラインに転用した形。Rust の `BTreeMap` は1ノードに最大11要素程度を持つ。

## HashMap との比較

| | BTreeMap (B木) | [[swiss-table\|HashMap]] (ハッシュ表) |
|---|---|---|
| 探索/挿入 | O(log n) | 平均 O(1) / 最悪 O(n) |
| キーの順序 | **整列して保持** | 無秩序 |
| 範囲クエリ `range(a..b)` | **できる** | できない |
| 最小/最大・ソート列挙 | できる(`first`/`last`/順次走査) | できない(別途ソート要) |
| 必要な性質 | キーが `Ord`(順序) | キーが `Hash + Eq` |
| メモリ局所性 | ノードに密集 | 制御バイト+スロット |

## いつ使うか

- **BTreeMap**: 範囲検索・ソート順イテレーション・最小/最大が要る、キーの順序に意味がある(時系列・区間・ランキング)
- **HashMap**: 純粋な key→value ルックアップを最速にしたい、順序は不要

```rust
use std::collections::BTreeMap;
let mut m = BTreeMap::new();
m.insert(3, "c"); m.insert(1, "a"); m.insert(2, "b");

// 整列順でイテレート(HashMap では保証されない)
for (k, v) in &m { /* 1,2,3 の順 */ }

// 範囲クエリ(BTreeMap の真価)
for (k, v) in m.range(2..) { /* k>=2 だけ */ }
```

## 押さえどころ（カード化候補）

- **BTreeMap とは** → キーが整列順で保たれる連想配列。B木基盤。Rust std の代表。HashMap が順不同 O(1) なのに対し整列 O(log n)。
- **なぜ B木** → 1ノードに多数キーを詰めて木を浅くし、キャッシュミス(ポインタ追跡)を減らす。メモリ階層に優しい。
- **HashMap との分岐** → 範囲クエリ/ソート順/最小最大が要れば BTreeMap、純粋ルックアップ最速なら HashMap。
- **必要な制約** → BTreeMap はキーが `Ord`、HashMap は `Hash + Eq`。

## 関連

- [[swiss-table]] — 対になる HashMap 実装(Rust std HashMap のバックエンド)。順不同・平均 O(1)
- [[rust]] — `std::collections::BTreeMap` として標準提供
- [[fifo-lifo]] — 別の基本データ構造。用途で使い分ける一群
