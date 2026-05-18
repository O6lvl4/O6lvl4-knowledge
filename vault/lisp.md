---
title: LISP
tags: [programming-paradigm, computer-science, language]
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

## 方言

- **Common Lisp** — 実用的な大規模 LISP
- **Scheme** — ミニマルな LISP。教育用途で有名（SICP）
- **Clojure** — JVM 上で動くモダン LISP。イミュータブルデータ構造
- **Emacs Lisp** — Emacs の拡張言語
- **Racket** — Scheme 系。言語を作るための言語

## 関連

- [[lambda-calculus|λ計算]] — LISP の理論的基盤。LISP は λ 計算の実装と言える
- [[functional-programming|関数型言語]] — LISP は最初の関数型言語
