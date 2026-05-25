---
title: SwissTable
tags: [computer-science, data-structure, hash-table, algorithm]
created_at: 2026-05-24
updated_at: 2026-05-24
---

Google が Abseil C++ ライブラリ (`absl::flat_hash_map` / `absl::flat_hash_set`) で実装した高性能ハッシュテーブルアルゴリズム。**制御バイト配列をデータと分離し、SIMD 命令で一括探索する**ことで、従来のオープンアドレッシング法を大幅に上回る性能を実現する。

2017年に Google 社内で開発され、CppCon 2017 の Matt Kulukundis による講演 "Designing a Fast, Efficient, Cache-friendly Hash Table, Step by Step" で公開された。現在は Rust ([[hashbrown]])、Go (go1.24 の `map` 実装)、Zig など複数言語に移植されている。

## 従来手法の問題

### チェイン法 (Separate Chaining)

```
bucket[0] → [K,V] → [K,V] → null
bucket[1] → null
bucket[2] → [K,V] → null
```

- 各バケットにリンクリスト (または Vec)
- ポインタ追跡でキャッシュミスが頻発
- ノードごとのアロケーション (メモリフラグメンテーション)
- 1エントリにつきポインタ分 (8バイト) のオーバーヘッド

### 従来のオープンアドレッシング (線形探索)

```
[K,V,meta] [K,V,meta] [K,V,meta] [K,V,meta] ...
```

- スロットごとにメタデータ (空/使用中/削除) をインラインに格納
- 探索は1スロットずつ逐次検査 → クラスタリングで性能劣化
- ロードファクターを 70% 程度に抑える必要がある
- Robin Hood hashing (Rust の旧 std HashMap) でもこの基本問題は残る

## SwissTable の核心: メタデータ分離 + SIMD

SwissTable はオープンアドレッシングだが、**メタデータ (制御バイト) をデータスロットから分離して密に配置**する。

### メモリレイアウト

```
┌─────────────────────────────────────┐
│ Control Bytes (1 byte × N)          │  ← 密に連続配置
│ C0  C1  C2  C3  C4  C5  ...  C_N-1 │
├─────────────────────────────────────┤
│ Data Slots (sizeof(K,V) × N)        │  ← 各スロットに K,V ペア
│ [K,V]₀ [K,V]₁ [K,V]₂ ...          │
└─────────────────────────────────────┘
```

※ hashbrown (Rust 実装) ではデータスロットが逆順に配置されるなど、細部は実装により異なる。

### 制御バイト (Control Bytes)

各スロットに **1バイト** のメタデータが対応する。3つの状態をエンコード：

| ビットパターン | 名称 | 意味 |
|---|---|---|
| `0b1111_1111` (0xFF) | `EMPTY` | 未使用スロット |
| `0b1000_0000` (0x80) | `DELETED` | 削除済み (トゥームストーン) |
| `0b0xxx_xxxx` | `FULL` | 使用中。下位7ビットに **H2 ハッシュ** を格納 |

最上位ビットだけで「空か使用中か」を即座に判定できる。

**従来手法との比較：** 従来のオープンアドレッシングではメタデータが各スロットにインラインで埋め込まれ、1スロットあたり 8バイト以上のオーバーヘッドになることが多い。SwissTable は **1スロットあたり 1バイト** のみ。

### ハッシュの分割: H1 / H2

64ビットハッシュ値を2つの用途に分割する：

```
hash (64 bits)
├── H1 (上位57ビット) → テーブル内の探索開始位置 (グループインデックス)
└── H2 (下位 7ビット) → 制御バイトに格納する「指紋」
```

- **H1**: `hash & bucket_mask` でどのグループから探索を開始するかを決定
- **H2**: 制御バイトに格納され、高価なキー等価比較の前にフィルタリングに使う

H2 が一致してもキーが異なる確率 (偽陽性) は **約 1/128**。つまり大半の不一致は 7ビット比較だけで排除でき、実際のキー比較はほぼ真のマッチ時のみ発生する。

## グループ探索 (SIMD Probing)

SwissTable の性能の核心。制御バイトを **グループ** 単位で SIMD 命令を使い一括比較する。

### グループサイズ

| プラットフォーム | グループ幅 | 使用命令 |
|---|---|---|
| x86/x86_64 (SSE2) | **16** | `_mm_cmpeq_epi8` + `_mm_movemask_epi8` |
| ARM (NEON) | **16** | `vceqq_u8` 等 |
| LoongArch (LSX) | **16** | LSX ベクトル命令 |
| ポータブル (fallback) | **8** | ビット演算で模擬 |

### 探索の流れ

```
1. hash = hasher(key)
2. group_index = H1(hash) & bucket_mask
3. h2 = H2(hash)   // 7ビット指紋

4. loop {
     // グループの制御バイト 16個を SIMD レジスタにロード
     ctrl = load_group(control_bytes[group_index])

     // H2 を 16個複製したベクトルと 1命令で並列比較
     matches = simd_cmpeq(ctrl, broadcast(h2))
     //        → 16スロット同時に「H2 が一致するか」判定

     // マッチしたスロット位置のビットマスクを取得
     for slot in bitmask_iter(matches) {
       if key == data[slot].key {
         return Found(slot)     // 真のマッチ
       }
       // H2 一致だがキー不一致 → 偽陽性 (約 1/128)
     }

     // EMPTY スロットがあるなら探索終了 (キーは存在しない)
     if has_empty(ctrl) {
       return NotFound
     }

     // 次のグループへ (三角数探索)
     group_index = next_group(group_index, stride)
   }
```

**1回の SIMD 命令で 16スロットを同時検査**できるため、従来の1スロットずつの線形探索と比べて探索速度が劇的に向上する。

### なぜキャッシュ効率が良いのか

```
制御バイト: [C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF]
             ← ──────── 16バイト = 1キャッシュライン未満 ──────── →
```

- 制御バイトは密に連続配置 → 16スロット分が **16バイト** (1キャッシュラインに収まる)
- 従来手法では 16スロットの検査に `16 × sizeof(K,V,meta)` のメモリアクセスが必要
- SwissTable では制御バイトでフィルタリングしてから、マッチしたスロットのデータ **だけ** をフェッチ

## 三角数探索 (Triangular Probing)

グループ間の移動はリニアではなく、**三角数列**に基づくステップで行う：

```
stride = 0
pos = H1(hash) & bucket_mask

反復ごと:
  stride += Group::WIDTH
  pos = (pos + stride) & bucket_mask
```

ステップ列: `0, W, 2W, 3W, 4W, ...` (W = グループ幅)

テーブルサイズが 2の冪であることと合わせて、**全グループを正確に1回ずつ訪問**することが数学的に保証される。これにより、最悪ケースでも全テーブルを網羅的に探索できる。

## ロードファクター

| ハッシュテーブル実装 | 最大ロードファクター |
|---|---|
| `std::unordered_map` (C++) | 100% (チェイン法) |
| Robin Hood (旧 Rust std) | 〜90% |
| **SwissTable** | **87.5% (7/8)** |
| 従来リニア探索 | 〜70% |

87.5% という高いロードファクターが成立するのは、SIMD グループ探索により衝突コストが低いため。メモリ効率と速度の両立を達成している。

## 削除とトゥームストーン

オープンアドレッシングでは削除が探索チェーンを壊す問題がある。SwissTable の戦略：

- **探索チェーン内にある** 場合: `DELETED` (0x80) マーク → 探索チェーンの連続性を維持
- **チェーンの末端** の場合: 直接 `EMPTY` (0xFF) に設定可能

トゥームストーンは新しい挿入時に再利用される。ただし `growth_left` カウンターはトゥームストーンでは減少しない (容量の人工的枯渇を防止)。

大量削除が発生するワークロードでは、トゥームストーン蓄積が探索を遅延させる。このとき rehash (in-place) でトゥームストーンを一掃する。

## 空テーブル最適化

空のテーブルは、静的に確保された `EMPTY` バイト配列 (グループアライメント済み) を参照する。**最初の挿入までヒープアロケーションは一切発生しない**。`HashMap::new()` のコストは実質ゼロ。

## 各言語での採用状況

| 言語 | 採用 | 実装 |
|---|---|---|
| **C++ (Abseil)** | `absl::flat_hash_map` / `absl::flat_hash_set` | オリジナル実装 |
| **Rust** | `std::collections::HashMap` (1.36〜) | [[hashbrown]] クレート経由 |
| **Go** | 標準 `map` (go1.24〜) | `internal/runtime/maps` で Swiss Table 実装 |
| **Zig** | `std.HashMap` | SwissTable ベース |

## パフォーマンス比較 (概数)

| 操作 | SwissTable | Robin Hood | `std::unordered_map` (C++) |
|---|---|---|---|
| lookup (hit) | **1.0x** (基準) | 1.5〜2x 遅い | 2〜3x 遅い |
| lookup (miss) | **1.0x** | 1.5〜2x 遅い | 3〜5x 遅い |
| insert | **1.0x** | 1.2〜1.5x 遅い | 2〜3x 遅い |
| メモリ/エントリ | 1 byte overhead | 8 bytes overhead | ポインタ + ノード |

※ miss (不在キーの探索) での差が特に大きい。SwissTable は EMPTY を見つけた瞬間に探索を終了でき、SIMD でそれを高速に検出できるため。

## 押さえどころ（カード化候補）

- SwissTable の核心設計 → **制御バイト (1byte/slot) をデータと分離し、SIMD 命令で16スロットを1命令で一括探索する。H2 (7ビット指紋) で偽陽性率 1/128 のフィルタリングを行い、高価なキー比較を最小化**
- H1/H2 分割の目的 → **H1 は探索開始位置の決定、H2 は制御バイトに格納する7ビット指紋。H2 一致時のみ実際のキー比較を行うため、不一致の検出が極めて高速**
- 制御バイトの3状態 → **EMPTY (0xFF): 未使用、DELETED (0x80): 削除済み、FULL (0x0?): 使用中で下位7ビットにH2格納。最上位ビットだけで空/使用中を判定**
- SwissTable のグループ探索 → **SSE2/NEON で制御バイト16個をレジスタにロードし、H2 を broadcast して cmpeq → bitmask。1命令で16スロットの一致判定。従来は1スロットずつ逐次比較**
- SwissTable のキャッシュ効率が高い理由 → **制御バイトが連続配置で16スロット分=16バイト。まず制御バイトでフィルタし、マッチしたスロットのデータだけフェッチ。データ本体へのアクセスが最小化される**
- 三角数探索の目的 → **グループ間の移動を stride += WIDTH で行い、2の冪テーブルと合わせて全グループを正確に1回ずつ訪問することを保証。リニア探索のクラスタリング問題を回避**
- SwissTable のロードファクター → **87.5% (7/8)。従来リニア探索の ~70% より大幅に高い。SIMD グループ探索で衝突コストが低いため、高密度でも性能を維持**
- SwissTable でのミス探索が速い理由 → **EMPTY スロットを見つけた時点で「このキーは存在しない」と確定できる。SIMD で EMPTY の存在を1命令で検出**
- 空テーブル最適化 → **空テーブルは静的 EMPTY 配列を参照。最初の挿入までヒープアロケーションゼロ。HashMap::new() のコストは実質ゼロ**
- SwissTable の採用状況 → **Abseil C++ (オリジナル)、Rust std (hashbrown 経由, 1.36〜)、Go 標準 map (1.24〜)。業界標準のハッシュテーブル実装になりつつある**

## Links

- [CppCon 2017: Matt Kulukundis "Designing a Fast, Efficient, Cache-friendly Hash Table, Step by Step"](https://www.youtube.com/watch?v=ncHmEUmJZf4)
- [Abseil Swiss Tables Design Notes](https://abseil.io/about/design/swisstables)
- [Swisstable, a Quick and Dirty Description (Faultlore)](https://faultlore.com/blah/hashbrown-tldr/)
- [Faster Go maps with Swiss Tables (Go Blog)](https://go.dev/blog/swisstable)

## 関連

- [[hashbrown]] — SwissTable の Rust 実装。Rust 標準ライブラリの HashMap バックエンド
- [[wasm-simd]] — WASM 環境では bitmask の非対称性により hashbrown は SIMD 不使用 (ポータブル fallback)
