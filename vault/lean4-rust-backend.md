---
title: lean4-rust-backend
tags: [lean4, rust, compiler, transpiler, ir]
---

Lean 4 のコードを Rust で実行するためのバックエンド。Lean IR を JSON で export し、Rust コードに codegen し、`lean-runtime` 上で動かす。

## Architecture

ワークスペース構成:

```
lean4-rust-backend/
├── lean-ir-export/      Lean 4 module: 環境から IR を JSON 化
├── lean-ir-codegen/     Rust binary: JSON IR → Rust source
├── lean-transpiler/     Rust binary: 補助トランスパイラ（regex ベース）
├── lean-runtime/        Rust crate: Lean ランタイム実装（mimalloc 採用）
└── examples/            hello, hello-auto, hello-ir, fizzbuzz, fizzbuzz-ir, sandbox
```

## パイプライン

```
.lean source
   │ Lean compiler + LeanIRExport.lean
   ▼
IR JSON (Lean.IR.Decl の配列)
   │ lean-ir-codegen
   ▼
Rust source (.rs)
   │ cargo build (links lean-runtime)
   ▼
ネイティブバイナリ
```

## lean-ir-export

Lean 4 モジュール。`Lean.Compiler.IR.CompilerM` を使い、Environment から IR Decl を取り出して独自 JSON 形式に書き出す。`@[extern "..."]` の C 名や `@[export ...]` の export 名も解決する。`main` は `_lean_main` にリネーム。

## lean-ir-codegen

`serde` で JSON IR を読み（`disable_recursion_limit` 必須）、`emit_rust.rs` で Rust ソースを生成。

```bash
lean-ir-codegen <input.json> [-o <output.rs>]
```

## lean-runtime

Lean ランタイムの Rust 実装。Lean の C ランタイムと互換のシンボルを提供する。

主要モジュール:

- `object` — `LeanObject`、tag bits、persistent/mt/st 判定
- `boxing` — `lean_box`、`lean_unbox`、scalar / int / float 変換
- `rc` — リファレンスカウント
- `slab` / `alloc` — slab アロケータ
- `string`, `nat`, `uint`, `sint`, `float` — primitive types
- `closure` — クロージャ表現
- `ctor` — コンストラクタ
- `io_result` — IO のエラー表現
- `panic`, `init_stubs`, `runtime`, `misc`

native ビルド時は `mimalloc` をグローバルアロケータに採用（`#[global_allocator]`）。`wasm32` では除外。

## Profile

リリースビルドは `lto = "fat"`, `codegen-units = 1`。

## 関連

- [[lean2ts]] — Lean を TypeScript に変換するツール（証明 → property test）
- [[lean4-learning]] — Lean 4 学習用リポジトリ群

## Links

- [GitHub](https://github.com/O6lvl4/lean4-rust-backend)
