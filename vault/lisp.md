---
title: LISP
tags: [programming-paradigm, computer-science, language]
created_at: 2026-05-18
updated_at: 2026-05-31T23:01:18+09:00
---

1958年に生まれた、現存する最古の高級言語の一つ。「コードとデータが同じ構造」という設計思想を持つ。

## プログラマ向けの一言

**すべてがリスト。関数呼び出しも `(関数名 引数1 引数2)` というリスト。** コード自体がデータ構造なので、プログラムがプログラムを生成・変換することが自然にできる。

## コードで理解する

```ts
// LISP の S式を TS で表現すると、すべてが配列になる
type SExpr = number | string | SExpr[];

// LISP:  (+ 1 2)
// TS:    ["+", 1, 2]

// LISP:  (define (square x) (* x x))
// TS:    ["define", ["square", "x"], ["*", "x", "x"]]

// 超簡易 LISP 評価器
function evaluate(expr: SExpr, env: Map<string, any> = new Map()): any {
  if (typeof expr === "number") return expr;
  if (typeof expr === "string") return env.get(expr);
  if (!Array.isArray(expr)) return expr;

  const [op, ...args] = expr;
  switch (op) {
    case "+": return evaluate(args[0], env) + evaluate(args[1], env);
    case "*": return evaluate(args[0], env) * evaluate(args[1], env);
    case "if":
      return evaluate(args[0], env)
        ? evaluate(args[1], env)
        : evaluate(args[2], env);
    default:
      const fn = env.get(op as string);
      return fn(...args.map(a => evaluate(a, env)));
  }
}

evaluate(["+", 1, ["*", 2, 3]]); // 7
```

## ホモイコニシティ（同図像性）

```ts
// LISP の最大の特徴: コード = データ
// コードがリストなので、プログラムでコードを操作できる

// マクロの概念: コードを受け取ってコードを返す関数
// LISP の unless マクロ（if の逆）
// (unless condition body) → (if (not condition) body)
function macroUnless(expr: SExpr[]): SExpr[] {
  const [_, condition, body] = expr;
  return ["if", ["not", condition], body]; // コードを組み替えて返す
}

// これが TS/JS にはできない（AST を直接操作する手段がない）
// LISP ではこれが言語の標準機能
```

マクロの落とし穴は**変数捕捉**(マクロが展開先の変数を意図せず巻き込む)。Common Lisp は `gensym` で一意なシンボルを作って手で避け、Scheme の `syntax-rules` は**衛生的マクロ (hygienic macro)** が自動で防ぐ。コード=データゆえ構文そのものを作れる = **DSL を言語内で構築できる**のが Lisp 最大の実用的帰結。

## Lisp が先取りした概念

現代言語が「新機能」として取り込んだものの多くは Lisp 由来。Lisp は 1958 年時点で先回りしていた。

| 概念 | Lisp での起源 | 後発への波及 |
|---|---|---|
| **ガベージコレクション** | McCarthy (1959) | Java/Go/JS… ほぼ全マネージド言語 |
| 第一級・高階関数 | 関数 = 値 | JS/Python/Rust のクロージャ |
| 条件式 `cond` / 再帰中心 | Lisp | ほぼ全言語 |
| 動的型付け | Lisp | Python/Ruby/JS |
| **REPL**(対話的評価) | Lisp | 各言語の対話環境 |
| **マクロ / 同図像性** | S 式 = コード | Rust の macro、Elixir、テンプレート系 |
| condition system(再開可能例外) | Common Lisp | 多くの言語が未追随 |

> **Greenspun の第10法則**: 「十分に複雑な C / Fortran プログラムは、Common Lisp の半分をその場しのぎでバグだらけに再実装したものを含む」— 言語が結局 Lisp の機能を再発明する、という皮肉。

## 方言

| 方言 | 性格 | マクロ | 特徴 |
|---|---|---|---|
| **Common Lisp** | 実用・大規模 | 非衛生 `defmacro` | CLOS(多重ディスパッチ)、condition system、巨大標準 |
| **Scheme** | ミニマル・教育(SICP) | **衛生的** `syntax-rules` | 継続 [[continuation\|`call/cc`]] が一級。仕様が小さい |
| **Clojure** | JVM 上のモダン Lisp | `defmacro` + syntax-quote | [[clojure\|イミュータブル永続データ構造]]・STM |
| **Emacs Lisp** | [[emacs\|Emacs]] の拡張言語 | `defmacro` | エディタ全体の実装言語。動的束縛の歴史 |
| **Racket** | 言語を作る言語 | 強力なマクロ系 | `#lang` で DSL / 新言語を量産 |

## 押さえどころ（カード化候補）

- **LISP とは** → 1958 年生まれ、現存最古級の高級言語。「コードとデータが同じ構造（S 式 = リスト）」が設計思想
- **すべてがリスト** → 関数呼び出しも `(関数名 引数1 引数2)` というリスト。`(+ 1 2)` は `["+", 1, 2]` に対応し、評価器は再帰的にリストを評価する
- **ホモイコニシティ（同図像性）** → コード = データなので、プログラムでコードを操作できる。マクロ = コードを受け取りコードを返す関数（`unless` → `if (not …)`）。TS/JS は AST を直接操作できないのでこれができない
- **主要方言** → Common Lisp（実用大規模）、Scheme（ミニマル・SICP）、Clojure（JVM・イミュータブル）、Emacs Lisp、Racket（言語を作る言語）
- **マクロの衛生性** → 変数捕捉が落とし穴。CL は `gensym` で手動回避、Scheme の `syntax-rules` は衛生的マクロが自動回避。構文を作れる＝言語内 DSL 構築が最大の実用的帰結
- **Lisp が先取りした概念** → GC(McCarthy 1959)・第一級/高階関数・REPL・動的型付け・マクロ。現代言語の多くは Lisp の再発見(Greenspun の第10法則)

## 関連

- [[lambda-calculus|λ計算]] — LISP の理論的基盤。LISP は λ 計算の実装と言える
- [[functional-programming|関数型言語]] — LISP は最初の関数型言語
- [[clojure|Clojure]] — JVM 上の現代的 Lisp 方言
- [[emacs|Emacs]] — Elisp を実行環境にしたエディタ。コード=データの自己反映性がライブ改造を可能にする
