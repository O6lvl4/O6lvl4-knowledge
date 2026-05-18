---
title: Type 0 文法（句構造文法）
tags: [formal-language, automata-theory, computer-science]
---

[[chomsky-hierarchy|チョムスキー階層]]の最上位。制約なし = 計算可能なすべて。

## プログラマ向けの一言

**あなたが書ける任意のプログラムと同じ表現力。** ただし「必ず答えが返ってくる」保証がない。無限ループする可能性がある。

## 例: コラッツ予想

```ts
// 「コラッツ予想が成り立つ数の文字列表現」を認識する関数
// n から始めて「偶数なら÷2、奇数なら3n+1」を繰り返すと必ず1になる…か？
// 数学的に未解決。一部の入力で永遠にループする可能性を排除できない。
function collatz(input: string): boolean {
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

// Type 1 以下の関数は必ず停止する
// Type 0 の関数は停止しないかもしれない — これが本質的な違い
```

## 停止問題

```ts
// 「あるプログラムが、ある入力に対して停止するか？」を判定するプログラムは書けない
// これが Type 0 の「決定不能性」

// もし書けたとしたら…
function halts(program: Function, input: any): boolean {
  // program(input) が停止するなら true、無限ループなら false を返す
  // ...これを実装する方法は存在しない
}

// 矛盾の証明:
function paradox(): boolean {
  if (halts(paradox, undefined)) {
    while (true) {} // halts が true を返すなら無限ループする
  }
  return true;      // halts が false を返すなら停止する
}
// → halts(paradox) が true でも false でも矛盾する
// → halts は実装不可能
```
