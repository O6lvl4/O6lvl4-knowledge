---
title: Almide コンパイラエラー体験
tags: [almide, compiler, dx, error-handling]
created_at: 2026-05-20
updated_at: 2026-05-20
---

[[almide|Almide]] コンパイラが目指す **Elm-grade** のエラー体験。「何が間違っているか」だけでなく「どう直せばいいか」まで提示する設計。v0.19.0 で Phase 1-2 を実装。

## 設計目標

Elm コンパイラのエラーメッセージを参考に、3 つの品質軸を追求する：

| 軸 | 説明 | 実装状態 |
|---|---|---|
| **特異性 (Specificity)** | 汎用エラーではなく、状況に特化したメッセージ | Phase 1 |
| **精度 (Precision)** | キャレット（`^`）が正確に問題箇所を指す | Phase 1 |
| **行動可能性 (Actionability)** | 修正コードを `try:` ブロックで提示 | Phase 2 |

## Phase 1: E005 + E001 の重複排除

**問題**: 関数呼び出しで引数の型が合わない場合、E005（引数型不一致）と E001（一般的な型制約エラー）の 2 つが同時に発火し、同じ問題に対して冗長なエラーが出ていた。

**解決**: `unify_call_arg()` が E005 を発行した場合、`bool` を返して E001 の伝播をスキップする。

```
Before:
  error[E005]: argument expects Int, got String   ← 具体的
  error[E001]: type mismatch: Int vs String       ← 冗長

After:
  error[E005]: argument expects Int, got String   ← これだけ
```

## Phase 1: E005 キャレットの精度

**問題**: キャレットがコンマや閉じ括弧など、問題の引数とは異なるトークンを指していた。

**解決**: `Checker` 構造体に `arg_spans: Vec<Span>` フィールドを追加。E005 発行前に `current_span` を引数式の正確なソーススパンに設定。

```
Before:
  add("hello", 42)
              ^     ← コンマを指している

After:
  add("hello", 42)
      ^^^^^^^       ← "hello" を正確に指す
```

## Phase 2: 修正コードの提示

**問題**: エラーメッセージが「何が間違っているか」は伝えるが「どう直せばいいか」は伝えない。

**解決**: `conversion_template()` 静的メソッドが期待型と実際型のペアから変換パターンを導出し、`with_try()` ブロックとして提示。

```
error[E005]: argument 1 expects Int, got String

  add("hello", 42)
      ^^^^^^^

  try:
    int.parse("hello")
```

### 対応する型変換パターン

| 期待型 → 実際型 | 提示される変換 |
|---|---|
| `Int` ← `String` | `int.parse(expr)` |
| `String` ← `Int` | `int.to_string(expr)` |
| `Int` ← `Float` | `float.to_int(expr)` |
| `Float` ← `Int` | `int.to_float(expr)` |
| `List[T]` ← `Option[T]` | `option.to_list(expr)` |
| `Option[T]` ← `T` | `some(expr)` |
| `Result[T,E]` ← `T` | `ok(expr)` |

## Auto-import の境界

エラー体験に関連する重要な言語仕様として、auto-import されるモジュールとされないモジュールがある：

| auto-import | explicit import 必須 |
|---|---|
| `list`, `int`, `float` + bundled .almd 群 | `io`, `env`, `random`, `regex`, `testing` |

REPL やエラーメッセージの `try:` ブロックでは、auto-import されていないモジュールの関数を提示する場合に `import` 文の追加も案内する必要がある。

## 押さえどころ（カード化候補）

- Elm-grade エラーの 3 軸 → **特異性（状況特化メッセージ）、精度（キャレットが正確に問題箇所を指す）、行動可能性（修正コードを try: で提示）**
- E005 + E001 重複排除 → **unify_call_arg() が E005 を発行したら bool を返し、E001 の伝播をスキップ。同じ問題に対する冗長エラーを排除**
- キャレット精度の改善 → **Checker に arg_spans: Vec<Span> を追加。E005 発行前に current_span を引数式の正確なスパンに設定**
- 修正コードの提示 → **conversion_template() が期待型/実際型ペアから変換パターンを導出。try: ブロックとしてエラーメッセージに付加**
- auto-import の境界 → **list/int/float は自動。io/env/random/regex/testing は explicit import 必須。エラーの try: ブロック提示にも影響**

## 関連

- [[almide]] — 言語本体
- [[almide-repl]] — REPL（コンパイラエラーが直接表示される場面）
- [[almide-lsp]] — LSP Diagnostics（エラーをエディタに表示）
