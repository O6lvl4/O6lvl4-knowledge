---
title: Type 3 文法（正規文法）
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-18
---

[[chomsky-hierarchy|チョムスキー階層]]の最下位。正規表現と完全に等価。

## プログラマ向けの一言

**変数1個（状態）だけで判定できる言語。** メモリ（スタックや配列）を一切使わずに、文字を左から1つずつ見て、今の「状態」だけで accept/reject を決める。

## 正規表現 = 有限オートマトン = 正規文法

この3つは表現力が完全に同じ。書き方が違うだけ。

```ts
// ---- 1. 正規表現で書く ----
const regex = /^a*b$/;
regex.test("b");     // true
regex.test("ab");    // true
regex.test("aaab");  // true
regex.test("aabb");  // false（b が2個はダメ）

// ---- 2. 有限オートマトンで書く（= 状態変数1個の while ループ）----
function accepts(input: string): boolean {
  let state: "reading_a" | "got_b" | "dead" = "reading_a";

  for (const ch of input) {
    switch (state) {
      case "reading_a":
        if (ch === "a") state = "reading_a";  // a が続く間はそのまま
        else if (ch === "b") state = "got_b";  // b が来たら遷移
        else state = "dead";
        break;
      case "got_b":
        state = "dead";  // b の後に何か来たらアウト
        break;
      case "dead":
        break;
    }
  }
  return state === "got_b";
}

// ---- 3. 正規文法で書く ----
// S → aS    （a を読んで S に戻る）
// S → b     （b を読んで終了）
// ↑ これは上の switch 文と全く同じことを言っている
```

## 限界: なぜ括弧の対応が無理か

```ts
// 「a が n 個 → b が n 個」(aabb, aaabbb, ...) を判定したい
// 状態変数だけでは n を覚えられない！

function cannotDoThis(input: string): boolean {
  let state = "?";
  for (const ch of input) {
    // a を何個見たか覚えておく方法がない
    // state = "saw_1_a" | "saw_2_a" | "saw_3_a" | ...  ← 無限に状態が要る
  }
  return false; // 有限個の状態では判定不可能
}

// これをやるにはスタックが必要 → Type 2 の領域
```

## 実用

```ts
// 字句解析（lexer）: ソースコードをトークンに分割
// → 各トークンの定義は正規表現で十分
const tokenRules = [
  { type: "NUMBER",  pattern: /^[0-9]+/ },
  { type: "IDENT",   pattern: /^[a-zA-Z_]\w*/ },
  { type: "LPAREN",  pattern: /^\(/ },
  { type: "RPAREN",  pattern: /^\)/ },
];
// ↑ ここまでは Type 3 で十分
// ↓ トークン列が正しい構文かチェックするのは Type 2 の仕事（パーサ）
```
