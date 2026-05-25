---
title: チョムスキー階層
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-18
---

形式言語を生成する形式文法の包含階層。1956年にノーム・チョムスキーが発表。

## 形式文法 = 文字列の生成ルール

「ある文字列がこの言語に属するか？」を判定する仕組み。プログラマ向けに言えば、バリデーション関数の表現力の分類。

```ts
// 形式文法を TypeScript で表現するとこうなる
type Grammar = {
  nonTerminals: string[];   // N: まだ展開できる記号（変数みたいなもの）
  terminals: string[];      // Σ: 最終的な出力文字（リテラルみたいなもの）
  rules: Rule[];            // P: 展開ルール
  start: string;            // S: 最初の記号
};
type Rule = { from: string; to: string };

// 例: a が n 個、b が n 個 並ぶ文字列（ab, aabb, aaabbb, ...）
const grammar: Grammar = {
  nonTerminals: ["S"],
  terminals: ["a", "b"],
  rules: [
    { from: "S", to: "aSb" },  // S を aSb に展開できる
    { from: "S", to: "ab" },   // S を ab に展開できる
  ],
  start: "S",
};
// S → aSb → aaSbb → aaabbb  （S を繰り返し展開して文字列を生成）
```

## 階層 = 「バリデーション関数にどれだけの道具を許すか」

```ts
// Type 3: 変数1個で足りる（状態だけ、メモリなし）
function type3(input: string): boolean {
  let state = "start";
  for (const ch of input) {
    // 今の状態と文字だけで次の状態が決まる
    state = transition(state, ch);
  }
  return state === "accept";
}

// Type 2: スタック（配列の push/pop）が必要
function type2(input: string): boolean {
  const stack: string[] = [];
  for (const ch of input) {
    // 今の状態 + スタックのトップ で判断
  }
  return stack.length === 0;
}

// Type 1: メモリは使えるが入力長に比例する量まで
function type1(input: string): boolean {
  const memory = new Array(input.length * C); // 定数倍まで
  // ...
}

// Type 0: 何でもあり = 普通のプログラム
function type0(input: string): boolean {
  // 任意のコードが書ける。ただし停止しないかもしれない
}
```

## 階層の対応表

| Type | プログラマの感覚 | 使える道具 | 身近な例 |
|---|---|---|---|
| [[type-3-grammar\|Type 3]] | 正規表現 | 変数1個（状態） | `/^a*b$/` |
| [[type-2-grammar\|Type 2]] | 再帰 / スタック | `stack.push()` / `stack.pop()` | 括弧の対応チェック |
| [[type-1-grammar\|Type 1]] | 配列を使った検証 | 入力長に比例するメモリ | 型チェック |
| [[type-0-grammar\|Type 0]] | 任意のプログラム | 制限なし | 停止問題 |

## 包含関係

```
Type 3 ⊂ Type 2 ⊂ Type 1 ⊂ Type 0

正規表現で書けるものは、再帰でも書ける。逆は無理。
再帰で書けるものは、配列でも書ける。逆は無理。
```

## なぜプログラマに関係あるか

- **正規表現** (Type 3) で括弧の対応を検証しようとして失敗した経験 → それは Type 2 の問題だから
- **パーサ** を書くとき、再帰下降パーサ (Type 2) で十分か、もっと強い仕組みが要るかの判断基準
- `JSON.parse()` は Type 2 のパーサ。TypeScript の型チェッカーは Type 1 以上の処理
