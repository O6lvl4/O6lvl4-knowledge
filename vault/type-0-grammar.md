---
title: Type 0 文法（句構造文法）
tags: [formal-language, automata-theory, computer-science]
---

[[chomsky-hierarchy|チョムスキー階層]]の最上位。制約なし = 計算可能なすべて。

## プログラマ向けの一言

**あなたが書ける任意のプログラムと同じ表現力。** ただし「必ず答えが返ってくる」保証がない。無限ループする可能性がある。

## 各 Type の具体実装を並べて比較

同じ「入力を受けて true/false を返す関数」でも、使っていい道具が違う:

```ts
// --- Type 3: 変数1個だけ。メモリなし。 ---
// 言語: /^a*b$/ にマッチする文字列
function type3(input: string): boolean {
  let state: "reading_a" | "got_b" | "dead" = "reading_a";
  for (const ch of input) {
    if (state === "reading_a" && ch === "a") state = "reading_a";
    else if (state === "reading_a" && ch === "b") state = "got_b";
    else state = "dead";
  }
  return state === "got_b";
}

// --- Type 2: スタック (push/pop) を使える ---
// 言語: a^n b^n（a が n 個、b が n 個）
function type2(input: string): boolean {
  const stack: string[] = [];
  let phase: "a" | "b" = "a";
  for (const ch of input) {
    if (phase === "a" && ch === "a") {
      stack.push("a");
    } else if (ch === "b") {
      phase = "b";
      if (stack.length === 0) return false;
      stack.pop();
    } else {
      return false; // a フェーズで b 以外、or b フェーズで a
    }
  }
  return stack.length === 0 && phase === "b";
}

// --- Type 1: 入力長に比例する配列を使える ---
// 言語: a^n b^n c^n（a, b, c が各 n 個）
function type1(input: string): boolean {
  // 3つの区間を同時にチェック — スタック1本では不可能
  const len = input.length;
  if (len === 0 || len % 3 !== 0) return false;
  const k = len / 3;
  for (let i = 0; i < k; i++) if (input[i] !== "a") return false;
  for (let i = k; i < 2 * k; i++) if (input[i] !== "b") return false;
  for (let i = 2 * k; i < 3 * k; i++) if (input[i] !== "c") return false;
  return true;
}

// --- Type 0: 何でもあり。停止しないかもしれない ---
// 言語: 「コラッツ予想が成り立つ数の文字列表現」
// n から始めて「偶数なら÷2、奇数なら3n+1」を繰り返すと必ず1になる…か？
// 数学的に未解決。一部の入力で永遠にループする可能性を排除できない。
function type0(input: string): boolean {
  let n = parseInt(input, 10);
  if (isNaN(n) || n <= 0) return false;
  while (n !== 1) {
    if (n % 2 === 0) n = n / 2;
    else n = n * 3 + 1;
    // n = 1 に到達する保証がない（未証明）
    // → この関数が return する保証がない
  }
  return true;
}
```

## 停止問題: Type 0 の本質

```ts
// 「あるプログラムが、ある入力に対して停止するか？」を判定するプログラムは書けない
// これが Type 0 の「決定不能性」

// もし書けたとしたら…
function halts(program: Function, input: any): boolean {
  // program(input) が停止するなら true、無限ループなら false を返す
  // ...これを実装する方法は存在しない
}

// 有名な対角線論法による矛盾:
function paradox(): boolean {
  if (halts(paradox, undefined)) {
    while (true) {} // halts が true を返すなら無限ループする
  }
  return true;      // halts が false を返すなら停止する
}
// → halts(paradox) が true でも false でも矛盾する
// → halts は実装不可能
```

## Type 1 との違い

```ts
// Type 1 (a^n b^n c^n) は入力を1回なめるだけで必ず終わる
// Type 0 (コラッツ) は入力によっては永遠に終わらないかもしれない
//
// この「必ず止まるか、止まらないかもしれないか」が境界線
// Type 1 以下: 必ず停止する
// Type 0:      停止しないかもしれない
```
