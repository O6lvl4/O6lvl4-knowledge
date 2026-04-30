---
title: Almide
tags: [language, llm, compiler, rust, wasm]
---

LLM によるコード生成に最適化されたプログラミング言語。Rust と WebAssembly にコンパイルされる。

## Core Metric: MSR (Modification Survival Rate)

AI が書いたコードに対して連続的な修正を加えたとき、コンパイル + テストが通り続ける割合。Almide はこの数値を最大化するように設計されている。

| Model | Pass Rate | 1-Shot Rate |
|---|---|---|
| Claude Sonnet 4.6 | 100% (30/30) | 47% |
| Llama 3.3 70B | 61% (17/28) | 33% |

## Design: Minimal Thinking Tokens

LLM が構文・意味・修復戦略で分岐する回数を最小化する。

### 曖昧性の除去

- null なし → `Option[T]` のみ
- 例外なし → `Result[T, E]` のみ
- ジェネリクスは `[T]`（`<T>` は比較演算子と曖昧）
- ループは `for x in xs` と `while cond` の2形式のみ
- 早期リターンなし → 最後の式が戻り値、`guard...else` で構造化脱出
- ラムダは `(x) => expr` の一形式のみ
- 文の終端は改行（セミコロンなし、ASI なし）
- `if` は `else` 必須（dangling else 問題なし）
- 暗黙の型変換なし → `int.to_string(n)` のように明示

### Effect System

`effect fn` は安全機構ではなく **生成空間の削減器**。

- pure 関数は pure 関数しか呼べない → 有効な補完候補が劇的に減る
- `effect fn` が I/O 境界を明示 → LLM は副作用が合法な箇所を正確に把握
- 関数シグネチャだけで何が呼べるか判断可能 → 関数本体を読む必要がない

## Syntax Highlights

```almd
// 関数定義
fn greet(name: String) -> String =
  "Hello, " ++ name ++ "!"

// レコード型
type User = { name: String, age: Int }

// バリアント型（leading | で判別）
type Shape =
  | Circle(Float)
  | Rect{ w: Float, h: Float }

// パターンマッチ（網羅的）
fn area(s: Shape) -> Float =
  match s {
    Circle(r) => 3.14159 * r * r
    Rect{ w, h } => w * h
  }

// Effect function（副作用あり）
effect fn read_config(path: Path) -> Result[String, String] =
  fs.read_text(path)

// Fan concurrency（構造化並行性）
effect fn fetch_both() -> Result[(String, String), String] =
  fan { http.get("https://a.com"); http.get("https://b.com") }

// パイプライン
fn process(data: List[Int]) -> List[Int] =
  data
    |> list.filter((x) => x > 0)
    |> list.map((x) => x * 2)
    |> list.sort_by((a, b) => int.compare(a, b))
```

## Concurrency: fan

`async/await` は存在しない。`effect fn` が非同期境界で、コンパイラが残りを処理する。

- `fan { a(); b() }` — 並行実行、全完了待ち、タプルで返却
- `fan.map(xs, fn)` — コレクションの並列 map
- `fan.race(thunks)` — 最初に完了したものを返し、残りをキャンセル
- `fan.any(thunks)` — 最初に成功したものを返す
- `fan.settle(thunks)` — 全結果を収集（失敗含む）

ルール: `fan` 内で `var` キャプチャ不可（データ競合防止）、1つ失敗で全体 fail-fast。

## Module System

```almd
// コアモジュール（auto-import）
// int, string, list, map, set, option, result, env, json, ...

// fs のみ明示 import が必要
import fs

// プロジェクト内のサブモジュール
import self.parser
import self.utils.{helper_a, helper_b}
```

## Toolchain

- `almide run file.almd` — コンパイル + 実行
- `almide build` — ネイティブバイナリ生成
- `almide build --target wasm` — WebAssembly 出力
- `almide test` — テスト実行
- `almide fmt` — フォーマッタ

## Links

- [GitHub](https://github.com/almide/almide)
- [Playground](https://almide.github.io/playground/)
