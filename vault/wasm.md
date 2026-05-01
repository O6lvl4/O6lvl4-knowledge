---
title: WebAssembly (WASM)
tags: [concept, wasm, runtime, portability]
---

ブラウザでも、サーバーでも、組み込み機器でも同じように動く「世界共通の高速バイナリ規格」。多くの言語からこの形式に出力でき、ほぼネイティブに近い速度で動く。

## 何ができる？／なぜ重要？

世界中どこに行っても挿せる「ユニバーサルなコンセント」を想像してください。WASM はソフトウェア版のそれで、Rust や C++ で書いたプログラムを WASM という共通の形にまとめておけば、ブラウザでも、サーバーでも、スマートフォンでも、ほぼそのまま動かせます。船で例えれば「コンテナ船」です。中身が何であれ、決まったサイズの箱（コンテナ）に詰めれば、どの港にもそのまま運べます。

これが嬉しいのは、「ブラウザ向けに書き直す」「Mac 向けに作り直す」といった面倒な作業が大幅に減ることです。なければ、同じ機能を OS ごと、環境ごとに別々に作る必要があり、開発コストが膨れ上がります。

## 仕組み

```mermaid
flowchart LR
    Rust[Rust コード] --> コンパイル[コンパイラ]
    Cpp[C++ コード] --> コンパイル
    Go[Go コード] --> コンパイル
    コンパイル --> WASM[.wasm ファイル<br/>共通バイナリ]
    WASM --> Browser[ブラウザで実行]
    WASM --> Server[サーバーで実行]
    WASM --> Edge[エッジで実行]
```

複数の言語を一度 WASM という共通の形式に変換しておけば、その後はあらゆる場所（ブラウザ、サーバー、エッジ）で同じバイナリが動きます。

## 用語

- **バイナリ**: 機械が直接読める 0 と 1 の形式。人間には読めない。
- **ランタイム**: WASM を実際に動かす実行環境（例: ブラウザ、Wasmtime）。
- **WASI**: WASM がファイルやネットワークを扱うための標準仕様。
- **bindgen**: Rust など他言語と JavaScript を繋ぐ自動生成ツール。
- **サンドボックス**: WASM が外の世界に勝手にアクセスできない隔離環境。安全性が高い。
- **モジュール**: WASM の単位。関数や変数をまとめた箱。
- **ホスト**: WASM を呼び出す側のプログラム（ブラウザの JS など）。
- **JIT**: 実行直前に機械語へ変換する仕組み。WASM を高速に動かす。

## vault 内での使われ方

- [[almide]] — ネイティブバイナリと WebAssembly の両方にコンパイルされる静的型付き言語
- [[almide-wasm-bindgen]] — Almide コードを WebAssembly 経由で JS から呼ぶためのバインディング生成器
- [[almide-js]] — Almide の JS/TS フレンドリーな WASM SDK の進捗ログ + ベンチマーク
- [[almide-nn]] — Almide で書かれた Transformer ライブラリ（Whisper 推論が native + WASM で動作）
- [[almide-lander]] — Almide モジュールを WASM 含む 21 言語の native package として書き出す CLI
- [[bonsai-almide]] — Almide でビルドした 1-bit LLM をブラウザで WASM 推論するデモ
- [[playground]] — Almide コンパイラを WASM としてブラウザに載せ、コードを WASM にコンパイル/実行する環境
- [[obsid]] — Almide 用グラフィックランタイム（Canvas 2D / WebGL / 3D mesh を WASM 経由で提供）
- [[porta]] — WASM サンドボックス（wasmtime）と OS-level 制限を併用する MCP ブリッジ

## 関連概念

- [[compiler]] — WASM へ変換する翻訳工程
- [[llvm]] — 多くの言語が LLVM 経由で WASM を出力する

## Links

- [WebAssembly 公式](https://webassembly.org/)
- [Wikipedia: WebAssembly](https://ja.wikipedia.org/wiki/WebAssembly)
