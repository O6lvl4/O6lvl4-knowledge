---
title: lean4-learning
tags: [lean4, learning, tutorial, claude-code-plugin]
---

Lean 4 学習用リポジトリ群。Hello World CLI から FizzBuzz、定理証明チュートリアル、Claude Code プラグインまで段階的にカバーする。

## Overview

5 つのリポジトリが「最小実行 → ライブラリ化 → CLI → 言語の核（証明）習得 → AI 支援」という学習階段を構成する。

### hello-lean4

Lean 4 で書かれた最小の Hello World CLI。`elan` 経由でビルドし、3 プラットフォーム（Linux x86_64 / macOS arm64 / macOS x86_64）向けの prebuilt バイナリを GitHub Release で配布。

```sh
lake build
./.lake/build/bin/hello
```

### fizzbuzz-lean4-lib

FizzBuzz ライブラリ単体。`lakefile.toml` 経由で再利用可能。

```lean
def fizzbuzz (n : Nat) : String
def fizzbuzzRange (start stop : Nat) : List String
```

依存登録:

```toml
[[require]]
name = "fizzbuzzlib"
source = "git \"https://github.com/o6lvl4/fizzbuzz-lean4-lib.git\" \"main\""
```

### fizzbuzz-lean4-cli

`fizzbuzz-lean4-lib` を使った CLI。`lake build` で `fizzbuzzcli` バイナリ生成、3 プラットフォーム向け Release あり。

```sh
fizzbuzzcli           # デフォルト 1〜15
fizzbuzzcli 30        # 範囲指定
```

### lean-lang-sandbox

定理証明 + プログラミングの段階的チュートリアル集。10 トピック × 日本語コメント + `#eval`。

| # | テーマ | 内容 |
|---|---|---|
| 01 | 基本型・演算 | Nat, Int, Float, String, Bool, Char, let, #eval, #check |
| 02 | 関数 | def, fun, カリー化, where, 再帰, 停止性証明 |
| 03 | パターンマッチ | match, ガード, 網羅性, 電卓実装 |
| 04 | リスト操作 | List, map, filter, fold, Option, 再帰関数 |
| 05 | 構造体 | structure, ドット記法, with 更新, deriving |
| 06 | 帰納型 (ADT) | enum, 再帰型, 二分木, 式の木, JSON 型 |
| 07 | 型クラス | class, instance, ToString, BEq, Ord, deriving |
| 08 | IO・do記法 | IO モナド, do, for, while, try/catch, CLI |
| 09 | 定理証明入門 | Prop, theorem, tactics (intro, exact, simp, omega, decide) |
| 10 | 依存型 | Vect, Fin, Subtype, 状態マシン, コンパイル時安全性 |

加えて `Basic.lean`（P→P / AND交換 / 対偶 / safeHead デモ）、`FizzBuzz.lean`（実装 + 性質の証明）、`LEAN4_GRAMMAR.md`。

核となる主張: **「コンパイルが通る = 証明が正しい」**。Lean は命題が型、証明がプログラム。

環境: Lean 4.28.0, Lake 5.0.0。

### lean4-practice

Claude Code プラグイン形式の Lean 4 ベストプラクティスリファレンス。

```bash
claude plugin marketplace add o6lvl4/lean4-practice
claude plugin install lean4-practice@lean4-practice
/lean4-practice
```

含まれるリファレンス:

- `language.md` — 型、構文、パターンマッチ、型クラス、モナド
- `tactics.md` — タクティック（証明と自動化）
- `stdlib.md` — Std, Batteries, Mathlib 基礎
- `configuration.md` — `lakefile.toml`, `lean-toolchain`, Lake プロジェクト設定
- `testing.md` — `#eval`, `#check`, `example`, テストパターン
- `ide.md` — LSP, Lake コマンド, ツール連携

## 関連

- [[lean4-rust-backend]] — Lean 4 を Rust で実行するバックエンド
- [[lean2ts]] — Lean 4 spec を TypeScript に変換
- [[claude-code]] — `lean4-practice` のプラグインホスト

## Links

- [hello-lean4](https://github.com/O6lvl4/hello-lean4)
- [fizzbuzz-lean4-lib](https://github.com/O6lvl4/fizzbuzz-lean4-lib)
- [fizzbuzz-lean4-cli](https://github.com/O6lvl4/fizzbuzz-lean4-cli)
- [lean-lang-sandbox](https://github.com/O6lvl4/lean-lang-sandbox)
- [lean4-practice](https://github.com/O6lvl4/lean4-practice)
