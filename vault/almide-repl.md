---
title: almide-repl
tags: [almide, repl, cli, compiler]
created_at: 2026-05-20
updated_at: 2026-05-20
---

[[almide|Almide]] の対話的実行環境。`almide`（引数なし）で起動する。v0.19.0 で追加。

## アーキテクチャ

WASM JIT ではなく、**毎回 .almd ソースを動的生成 → コンパイル → cargo incremental build → 実行** という戦略をとる。Rust の incremental compilation が十分高速なため、REPL としての応答速度は実用的。

```
ユーザー入力
    ↓
入力分類 (TopLevel / Body / Expr)
    ↓
セッション状態に追記
    ↓
.almd ソース全体を再生成
    ↓
try_compile (quiet mode)
    ↓
cargo build (incremental)
    ↓
生成バイナリを実行 → stdout をキャプチャ → 表示
```

## 入力分類

ユーザーの入力を 3 種類に分類し、生成ソース内の配置場所を決める。

| 種別 | マッチパターン | 生成ソースでの配置 |
|---|---|---|
| **TopLevel** | `fn `, `effect fn `, `type `, `mod type `, `import ` | トップレベル宣言 |
| **Body** | `let `, `var `, `for `, 代入文（`ident = expr`） | `main()` 関数のボディ |
| **Expr** | 上記以外すべて | `let __r = <expr>` として評価し結果を表示 |

## セッション状態

`Session` 構造体が 2 つのベクタで状態を保持：

- `top: Vec<String>` — TopLevel 宣言の蓄積（fn, type, import）
- `body: Vec<String>` — Body 文の蓄積（let, var, 代入）

毎回の eval で、これらを結合して完全な `.almd` ソースを生成する。

## ソース生成

eval のたびに以下のソースが動的生成される：

```almd
import io                    // io は auto-import ではないため明示必要

// --- top (蓄積された宣言) ---
fn double(x: Int) -> Int = x * 2
type Color = | Red | Blue

// --- main ---
effect fn main() -> Unit =   // 戻り型 -> Unit は省略不可
  // --- body (蓄積された文) ---
  let x = 10
  var y = 20
  // --- 今回の入力（Expr の場合） ---
  let __r = double(x)
  io.print("${__r}\n")       // Debug format ({:?}) に post-replace
```

### 式の表示

`io.print("${__r}\n")` で生成された Rust コードを、`{:?}`（Debug format）に post-replace する。これにより `List` や `Option` などの `Display` 未実装の型も統一的に表示できる。

`String` interpolation は `format!("{}", val)`（Display）を使うため、`Vec<T>` 等は直接は表示できない。`{:?}` への書き換えがこの制約を回避している。

## RcCow の Debug 透過化

Almide はミュータブルコレクションに `RcCow<T>`（Copy-on-Write 参照カウント）を使う。デフォルトの `#[derive(Debug)]` だと `RcCow([1, 2, 3])` と表示されてしまう。

手動 `impl Debug` で内部値に委譲することで、REPL では `[1, 2, 3]` と表示される。

## コンパイル

- `compile_quiet()`: スレッドローカルの `SUPPRESS_WARNINGS` AtomicBool フラグで、REPL 中の unused variable 等の警告を抑制
- `cargo_build_generated()`: `src/cli/mod.rs` から共有。incremental build を利用
- キャッシュ: `~/.almide/repl/build/` に永続化。2 回目以降の eval は差分ビルドのみ

### コンパイラ内部の知見

- `try_compile` は `eprintln!` でエラーを直接出す設計。キャプチャ不可のため、quiet mode は AtomicBool フラグで対応
- `cargo_build_generated` は元々 private だった。REPL から使うために `pub(crate)` に変更

## コマンド

| コマンド | 動作 |
|---|---|
| `:q`, `:quit` | 終了 |
| `:h`, `:help` | ヘルプ表示 |
| `:history` | 評価履歴の表示 |
| `:clear` | セッション状態のリセット |

## 押さえどころ（カード化候補）

- REPL のコード生成戦略 → **毎回 .almd ソースを動的生成 → try_compile → cargo incremental build → 実行。WASM JIT ではなく Rust の incremental compilation を活用**
- 入力の 3 分類 → **TopLevel（fn/type/import → トップレベル宣言）、Body（let/var/代入 → main ボディ）、Expr（その他 → let __r = expr として評価表示）**
- 式の表示方法 → **io.print("${__r}\n") の生成 Rust を {:?} (Debug format) に post-replace。Display 未実装の型も統一的に表示**
- io の扱い → **io は auto-import ではない。生成ソースに import io を明示的に含める必要がある**
- RcCow の Debug 透過化 → **手動 impl Debug で内部値に委譲。RcCow([1,2,3]) ではなく [1,2,3] と表示**
- cargo キャッシュ → **~/.almide/repl/build/ に永続化。incremental build で 2 回目以降の eval が高速**

## 関連

- [[almide]] — 言語本体
- [[almide-lsp]] — LSP サーバー（同じく v0.19.0 で追加）
- [[almide-compiler-errors]] — コンパイラエラー体験
- [[copy-on-write]] — RcCow の背景にある概念
