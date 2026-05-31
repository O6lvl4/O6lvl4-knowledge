---
title: Type 3 文法（正規文法）
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:04+09:00
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

## 押さえどころ（カード化候補）

- **メモリモデル**: 状態変数1個だけで判定できる言語。スタックも配列も使わず、文字を左から1つずつ見て現在の状態だけで accept/reject を決める。
- **三位一体の等価性**: 正規表現 = 有限オートマトン = 正規文法。表現力は完全に同じで、書き方（regex／状態遷移 while ループ／`S → aS` の規則）が違うだけ。
- **限界**: a^n b^n は判定不可。n を覚えるには無限個の状態が要る。これを扱うにはスタック（Type 2）が必要。
- **実用**: 字句解析（lexer）はトークン定義が正規表現で足り、Type 3 で十分。トークン列の構文チェックは Type 2（パーサ）の仕事。

## 関連

- 親: [[chomsky-hierarchy]] — Type 3 はこの階層の最下位（最も制約が強く最も単純）な正規文法の層。
- 上の隣: [[type-2-grammar]] — 一段上の文脈自由文法。状態だけでは数えられない括弧対応・a^n b^n を扱えるようになる境界がここ。
- 兄弟: [[type-1-grammar]], [[type-0-grammar]] — さらに上位の文脈依存・無制約の層。下位ほど認識器が単純になる。
- 対応する認識器: [[pushdown-automaton]] — Type 2 の認識器（有限オートマトン + スタック）。Type 3 の認識器（有限オートマトン）はここからスタックを取り去ったものに等しく、「スタックの有無」が Type 3 と Type 2 を分ける唯一の差であることを示す対比点。
