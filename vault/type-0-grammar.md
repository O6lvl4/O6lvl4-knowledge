---
title: Type 0 文法（句構造文法）
tags: [formal-language, automata-theory, computer-science]
---

[[chomsky-hierarchy|チョムスキー階層]]の最上位。制約なし = 計算可能なすべて。

## プログラマ向けの一言

**あなたが書ける任意のプログラムと同じ表現力。** ただし「必ず答えが返ってくる」保証がない。無限ループする可能性がある。

## チューリングマシン = 普通のプログラム

```ts
// Type 0 が認識できる言語 = チューリングマシンが認識できる言語
// チューリングマシン = 無制限のメモリを持つ計算モデル
//                   = 要するに普通のプログラム

// 各 Type を「関数にどこまで許すか」で並べると:
function type3(input: string): boolean {
  // 変数1個だけ                    ← 有限オートマトン
}
function type2(input: string): boolean {
  // stack (push/pop) まで          ← PDA
}
function type1(input: string): boolean {
  // 入力長 × 定数 のメモリまで      ← 線形有界オートマトン
}
function type0(input: string): boolean {
  // 何でもあり。while(true) も書ける ← チューリングマシン
  // ただし、この関数が return する保証はない
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
// Type 1: メモリに上限がある → 必ず停止する（有限の状態しかないので無限ループ検出可能）
// Type 0: メモリに上限がない → 停止しないかもしれない

// 実用的には:
// - あなたが書く普通のプログラムは大体 Type 1 に収まる
//   （入力サイズに比例するメモリで動き、必ず停止する）
// - Type 0 が必要になるのは「この問題は原理的に解けるか？」という理論の話
```

## 各 Type の比較まとめ

```ts
// 言語         | 使える道具           | 停止保証 | 身近な例
// -------------|---------------------|---------|------------------
// Type 3 (正規) | 状態変数1個          | あり     | /^a*b$/
// Type 2 (CFG)  | + スタック          | あり     | JSON.parse()
// Type 1 (CSG)  | + 入力長ぶんの配列   | あり     | TypeScript 型チェック
// Type 0 (句構造) | 制限なし           | なし     | 停止問題
```
