---
title: Almide
tags: [language, llm, compiler, rust, wasm]
---

LLM によるコード生成に最適化された[[programming-language|プログラミング言語]]。Rust と WebAssembly にコンパイルされる。~72,000 行の純 Rust コンパイラ。

## Core Metric: MSR (Modification Survival Rate)

AI が書いたコードに対して連続的な修正を加えたとき、コンパイル + テストが通り続ける割合。Almide はこの数値を最大化するように設計されている。

| Model | Pass Rate | 1-Shot Rate |
|---|---|---|
| Claude Sonnet 4.6 | 100% (30/30) | 47% |
| Llama 3.3 70B | 61% (17/28) |

計測は [[almide-dojo]] で日次実行。

## Design: Minimal Thinking Tokens

LLM が構文・意味・修復戦略で分岐する回数を最小化する。

| 曖昧性 | 他の言語 | Almide |
|---|---|---|
| null | null, nil, None, undefined | `Option[T]` のみ |
| エラー | throw, try/catch, panic | `Result[T, E]` のみ |
| ジェネリクス | `<T>` は比較演算子と曖昧 | `[T]` |
| ループ | while, for, loop, forEach | `for` / `while` の2形式のみ |
| ラムダ | =>, ->, lambda, fn | `(x) => expr` のみ |
| 文の終端 | ;, optional ;, ASI | 改行 |
| 型変換 | 暗黙の拡大変換 | 明示のみ (`int.to_string(n)`) |

### Effect System

`effect fn` は安全機構ではなく **生成空間の削減器**。

- pure 関数は pure 関数しか呼べない → 有効な補完候補が劇的に減る
- `effect fn` が I/O 境界を明示 → LLM は副作用が合法な箇所を正確に把握

## Syntax

```almd
fn greet(name: String) -> String =
  "Hello, " ++ name ++ "!"

type Shape =
  | Circle(Float)
  | Rect{ w: Float, h: Float }

fn area(s: Shape) -> Float =
  match s {
    Circle(r) => 3.14159 * r * r
    Rect{ w, h } => w * h
  }

effect fn read_config(path: Path) -> Result[String, String] =
  fs.read_text(path)

fn process(data: List[Int]) -> List[Int] =
  data
    |> list.filter((x) => x > 0)
    |> list.map((x) => x * 2)
    |> list.sort_by((a, b) => int.compare(a, b))
```

## Concurrency: fan

`async/await` は存在しない。`effect fn` が非同期境界で、コンパイラが残りを処理する。

- `fan { a(); b() }` — 並行実行、全完了待ち
- `fan.map(xs, fn)` — 並列 map
- `fan.race(thunks)` — 最初に完了したものを返す

## Architecture

```
Lexer → Parser → AST → Type Checker → Lowering → IR
                                                   ↓
                              Nanopass Pipeline (semantic rewrites)
                                                   ↓
                              Template Renderer (TOML-driven)
                                                   ↓
                                              .rs / .wasm
```

12 crate の Rust ワークスペース: syntax, types, frontend, ir, optimize, codegen, tools, base 等。

## Toolchain

- `almide run file.almd` — コンパイル + 実行
- `almide build` — ネイティブバイナリ生成
- `almide build --target wasm` — WebAssembly 出力
- `almide test` — テスト実行
- `almide fmt` — フォーマッタ

## Ecosystem

### almide org

**コンパイラツール**: [[almide-grammar]], [[tree-sitter-almide]], [[vscode-almide]]
**多言語エクスポート**: [[almide-lander]], [[almide-bindgen]], [[almide-wasm-bindgen]]
**ベンチ/ドキュメント**: [[almide-dojo]], [[almide-docs]], [[almide-playground]], [[almide-js]]
**セキュリティ**: [[porta]]
**ブラウザ**: [[almide-web]], [[bonsai-almide]]
**stdlib**: [[almide-sqlite]], [[almide-base64|base64]], [[almide-csv|csv]], [[almide-svg|svg]], [[almide-toml|toml]], [[almide-yaml|yaml]]

### almide-graphics org

**レンダラ**: [[snaidhm]] (WebGPU), [[obsid]] (Canvas2D/WebGL)
**UI**: [[ceangal]], [[ceangal-anime]]
**数学**: [[lumen]]
**3D**: [[nendo]] (VRM)
**AI**: [[almide-nn|nn]]

### almide-ai org

**LLM クライアント**: [[almai]]
**AI エージェント**: [[homullus]]

## Links

- [GitHub](https://github.com/almide/almide)
- [Playground](https://almide.github.io/playground/)
