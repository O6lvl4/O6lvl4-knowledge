---
title: lean4-rust-backend
tags: [lean4, rust, compiler, transpiler, ir]
---

Lean 4 のコードを Rust で実行するためのバックエンド。Lean IR を JSON で export し、Rust コードに codegen し、`lean-runtime` 上で動かす。

## 何ができる？

Lean 4 という「数学の証明を計算機で確かめるための言語」で書いたプログラムを、Rust という「高速で実行できる言語」に翻訳して動かすための変換機です。日本語の小説を英語に訳して海外でも読めるようにする翻訳家のような役割を、プログラミング言語の世界で果たします。元々の Lean のコードはそのままでは実行効率がさほど高くありませんが、Rust に変換すると桁違いに速くなる、というのがこの仕組みの狙いです。

何が嬉しいかというと、「数学的に正しいことが証明されたプログラム」を、本番サーバーで現実的な速度で動かせるようになる点です。

## 用語

- **Lean 4**: 「数学の定理を計算機に厳密に証明させる」ための言語。プログラムを書くだけでなく、そのプログラムが正しいことも証明できる。
- **Rust**: 高速かつ安全なシステムプログラミング言語。
- **バックエンド**: 翻訳機の出口側。「翻訳結果として何の言語を出すか」を担当する部分。
- **IR（中間表現）**: 翻訳の途中で経由する「中間言語」。元の言語と最終言語の間のメモのようなもの。
- **JSON**: データを文字で表現する共通フォーマット。ここでは Lean IR を一旦書き出す形式として使う。
- **codegen（コード生成）**: 中間メモから最終的な Rust コードを書き出す工程。
- **runtime（ランタイム）**: 実行時に必要となる「土台ライブラリ」。文字列や数値の扱いなど、言語の基本機能を提供する。
- **mimalloc**: 「メモリの貸出窓口」を高速にする部品。ランタイムに組み込まれている。
- **ネイティブバイナリ**: その OS で直接動く実行ファイル。インタプリタを介さない最速形態。
- **LTO（Link Time Optimization）**: 「最終リンク時に全体最適化をかける」コンパイル設定。さらに高速化する。
- **WASM (wasm32)**: ブラウザなどでも動く軽量実行形式。ここでは mimalloc を外している。

## 仕組み

```mermaid
flowchart LR
    A[.lean ソース<br/>数学的な証明] --> B[Lean compiler]
    B --> C[lean-ir-export<br/>IRを JSON 化]
    C --> D[JSON IR<br/>中間メモ]
    D --> E[lean-ir-codegen<br/>Rust に翻訳]
    E --> F[.rs Rust ソース]
    F --> G[cargo build]
    G --> H[lean-runtime と結合]
    H --> I[ネイティブバイナリ<br/>高速実行]
```

Lean のコードはまず Lean コンパイラで内部表現になり、JSON という中間メモに書き出されます。次に専用の翻訳機が Rust ソースに書き換え、Rust の標準ビルドツール（cargo）が高速な機械語に変換します。実行時に必要な基本機能は `lean-runtime` という Rust 製の土台が提供します。

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
