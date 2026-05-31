---
title: Type 0 文法（句構造文法）
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:04+09:00
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

## 押さえどころ（カード化候補）

- **表現力**: Type 0 は制約なしの句構造文法で、計算可能なものすべて — 任意のプログラムと同じ表現力を持つ。
- **停止保証の欠如**: Type 1 以下の言語の認識器は必ず停止するが、Type 0 の認識器は無限ループしうる。これが階層の本質的な境界。
- **コラッツの例**: 「数列が必ず 1 に到達するか」を判定する関数は、未証明ゆえ停止保証がない — Type 0 的な性質の具体例。
- **停止問題**: 「任意のプログラムが停止するか」を判定する `halts` は実装不可能。`paradox` を使った自己言及で矛盾を導ける（決定不能性）。

## 関連

- 親: [[chomsky-hierarchy]] — Type 0 はこの階層の最上位（最も制約が緩く最も表現力が高い層）として位置づけられる。
- 隣の層: [[type-1-grammar]] — Type 1（文脈依存／線形有界オートマトン）はメモリを入力長の定数倍に制限した一段下の層。「必ず停止する」境界はここで引かれる。
- 兄弟: [[type-2-grammar]], [[type-3-grammar]] — さらに制約の強い下位層。Type 0 はこれらすべてを真に包含する。
- 対応する認識器: [[pushdown-automaton]] — Type 2 を認識する機械。Type 0 の認識器（チューリングマシン）はこれにスタックではなく無制限テープを与えたものに相当し、PDA との表現力差を理解する対比点になる。
