---
title: zfp (Zero-cost Functional Programming for Zig)
tags: [zig, functional-programming, library, zero-cost]
---

Zig のネイティブ型の上に構築された、ゼロコストの関数型プログラミングツールキット。ラッパなし、アロケーションなし、ランタイムオーバーヘッドなし。

## Philosophy

- **ネイティブ型をラップしない。** `option` は `?T` で直接動く。`result` は `E!T` で直接動く
- **Zero cost。** すべての関数が `inline`。生成コードは手書きの `if` / `catch` ブロックと同一
- **最小 API。** 概念ごとに1関数。設計で composable
- **Idiomatic Zig。** マクロなし、隠れたアロケーションなし、マジックなし

## Modules

| Module | Description |
|---|---|
| `option` | `?T` の Functor / Monad / Applicative |
| `result` | `anyerror!T` の Functor / Monad / Applicative |
| `either` | `Left(L) \| Right(R)` 直和型 — Bifunctor、Monad |
| `pipe` | 左から右への関数パイプライン |
| `compose` | 再利用可能な合成 callable |
| `zf` | 基本コンビネータ: `id`, `flip`, `const_`, `on` |
| `tap` | パイプラインを壊さない副作用注入 |
| `arrow` | ペアコンビネータ: `first`, `second`, `split`, `fanout` |
| `slice` | スライス上の Foldable 操作 |
| `monoid` | 名前付きモノイド: `Sum`, `Product`, `Any`, `All`, `First`, `Last`, `Endo` |

## なぜ zero-cost か

Zig の `inline fn` + `anytype` パラメータはコンパイル時に完全に解決される。コンパイラが全呼び出しを通して見て、手動 `if` / `catch` 版と同じコードを生成する。仮想ディスパッチ、boxing、間接参照すべてなし。

## option 例

```zig
const option = @import("zfp").option;

// Before — ネスト深い
fn process(input: ?[]const u8) ?i32 {
    if (input) |s| {
        const n = std.fmt.parseInt(i32, s, 10) catch return null;
        if (n > 0) return n * 2;
    }
    return null;
}

// After — 平らなパイプライン、同一マシンコード
fn process(input: ?[]const u8) ?i32 {
    return option.andThen(
        option.andThen(input, parseInt),
        doubleIfPositive,
    );
}
```

## monoid 例

```zig
const monoid = @import("zfp").monoid;

const total    = monoid.Product.concat(&items);
const any_true = monoid.Any.concat(&flags);

// First / Last on optional slices
const results = [_]?[]const u8{ null, "timeout", null, "not found" };
monoid.First.concat(&results); // → "timeout"
monoid.Last.concat(&results);  // → "not found"
```

## Module 追加プロトコル

新規 module 追加時は CLAUDE.md で全ステップ必須:

1. `src/{module}.zig` 実装（`pub inline fn` + `anytype` のみ、ネイティブ型を直接扱う）
2. `src/root.zig` で再 export
3. `build.zig` にテストステップ追加
4. README に Modules テーブル + before/after サンプル追加
5. `docs/education/{module}.md` (EN) と `{module}.ja.md` (JA) を両方作成

教育ドキュメントは Functor / Monad の概念、Zig ネイティブ型がなぜ正しいか、なぜ zero-cost か、合成例、関連表まで網羅する固定構造。

## Installation

`build.zig.zon` に追加:

```zig
.dependencies = .{
    .zfp = .{
        .url = "https://github.com/O6lvl4/zfp/archive/refs/tags/v0.1.0.tar.gz",
        .hash = "zfp-0.1.0-mqQCVeXtAQAq0F8xYpiUA6Pcm5Qm_33YVDxkhNq_7nMV",
    },
},
```

Zig `0.15.0` 以降必須。

## Links

- [GitHub](https://github.com/O6lvl4/zfp)
