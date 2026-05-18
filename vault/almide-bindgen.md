---
title: almide-bindgen
tags: [almide, cli, ffi, codegen]
---

[[almide|Almide]] モジュールから20言語のFFIバインディングを生成するジェネレータ。Almide 自身で実装されている。

## 仕組み

バイトバッファプロトコルで言語間通信。C 構造体のメモリレイアウトに依存しない。

```
Almide モジュール → .almdi (インターフェース定義)
    → almide-bindgen → Python/Go/Swift/... の FFI コード
    → cdylib (.so/.dylib/.dll) 経由で呼び出し
```

## 対応言語 (20)

Python, Go, Ruby, Swift, C#, Dart, Kotlin, Java, C++, Rust, JavaScript, C, Zig, Nim, Scala, Julia, Elixir, PHP, Lua, PowerShell

## 特徴

- 外部依存なし（PyO3, UniFFI, napi-rs 等を使わない）
- 各言語のジェネレータもすべて Almide で記述
- [[almide-lander]] が上位の統合 CLI として利用

## 関連

- [[almide-lander]] — bindgen + wasm-bindgen を統合する CLI
- [[almide-wasm-bindgen]] — WASM/JS/TS 向けの別ジェネレータ
