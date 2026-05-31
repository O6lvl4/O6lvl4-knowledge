---
title: Type 1 文法（文脈依存文法）
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:04+09:00
---

[[chomsky-hierarchy|チョムスキー階層]]の Type 1。「文脈を見て」判断する文法。

## プログラマ向けの一言

**入力長に比例するメモリ（配列）を使って判定できる言語。** スタック (push/pop) だけでは足りないが、入力をまるごとコピーして自由に読み書きすれば判定できる。

## 例: a^n b^n c^n

スタック1本（Type 2）では無理だが、配列を使えば簡単:

```ts
// a^n b^n c^n: a が n 個、b が n 個、c が n 個 並ぶ文字列
function matchAnBnCn(input: string): boolean {
  const n = input.length;
  if (n % 3 !== 0) return false;
  const k = n / 3;

  // 配列として自由にアクセスできるから、3つの区間を同時にチェックできる
  for (let i = 0; i < k; i++) {
    if (input[i] !== "a") return false;
  }
  for (let i = k; i < 2 * k; i++) {
    if (input[i] !== "b") return false;
  }
  for (let i = 2 * k; i < 3 * k; i++) {
    if (input[i] !== "c") return false;
  }
  return true;
}

matchAnBnCn("abc");       // true  (n=1)
matchAnBnCn("aabbcc");    // true  (n=2)
matchAnBnCn("aaabbbccc"); // true  (n=3)
matchAnBnCn("aabbc");     // false
```

## なぜ Type 2（スタック）では無理か

```ts
function cannotDoWithStack(input: string): boolean {
  const stack: string[] = [];

  // フェーズ1: a を push
  // フェーズ2: b を見ながら pop → ここでスタックが空になる
  // フェーズ3: c の個数をチェックしたいが… スタックはもう空
  //           n がいくつだったか忘れている！

  // スタックは「1つのカウンタ」しか持てない
  // a と b の対応 OR a と c の対応はチェックできるが、両方同時は無理
  return false;
}
```

## 「文脈依存」の意味

```ts
// Type 2（文脈自由）: ルールは「A をどこでも同じように展開」
// Type 1（文脈依存）: ルールは「A の周りが〇〇のときだけ展開」

// プログラマの感覚でいうと:
// Type 2 = ローカル変数だけで処理が決まる（関数の中で完結）
// Type 1 = 周囲のコンテキスト（スコープ、型情報）を見ないと判断できない

// 例: TypeScript の型チェック
let x = 42;
x.toUpperCase(); // ← これがエラーかどうかは x の型（文脈）を見ないとわからない
                  // 構文的には合法（Type 2 の範囲）だが、
                  // 意味的に正しいかは文脈依存（Type 1 以上の問題）
```

## 認識する機械: 線形有界オートマトン

```ts
// Type 0（チューリングマシン）: メモリ無制限
// Type 1（線形有界オートマトン）: メモリは入力の定数倍まで
//
// コードで言うと:
function linearBounded(input: string): boolean {
  const memory = new Array(input.length * C);  // C は定数。これ以上確保できない
  // ↑ この制約のもとで判定する
  // 現実のプログラムは大体ここに収まる（入力に比例するメモリで動く）
}
```

## 実用での位置づけ

```ts
// コンパイラのフェーズで見ると:
// 1. 字句解析 (lexer)  → Type 3 で十分（正規表現）
// 2. 構文解析 (parser) → Type 2 で十分（文脈自由文法）
// 3. 意味解析 (型チェック、名前解決) → Type 1 以上の問題
//
// つまりプログラマが「パーサだけじゃ足りない」と感じる部分が Type 1 の領域
```

## 押さえどころ（カード化候補）

- **メモリモデル**: Type 1 は入力長の定数倍メモリ（配列）で判定できる言語。スタック1本では足りないが、入力をまるごと読み書きできれば判定可能。
- **代表例 a^n b^n c^n**: スタック1本（Type 2）では a と b の対応を取った時点でカウンタが空になり c を数えられない。配列なら3区間を同時にチェックできる。
- **「文脈依存」の意味**: ルールが「A の周囲が特定の状況のときだけ展開」される。プログラマ感覚では「周囲のスコープ・型情報を見ないと判断できない」処理に対応。
- **認識器**: 線形有界オートマトン（LBA）— チューリングマシンのテープを入力の定数倍に制限したもの。現実のプログラムの大半はここに収まる。
- **コンパイラ上の位置**: 字句解析=Type 3、構文解析=Type 2、意味解析（型チェック・名前解決）=Type 1 以上。

## 関連

- 親: [[chomsky-hierarchy]] — Type 1 はこの階層の上から2番目（文脈依存）の層。
- 上の隣: [[type-0-grammar]] — メモリ制限を外すと Type 0（チューリングマシン）。「必ず停止する／しないかもしれない」の境界が Type 1 と Type 0 の間にある。
- 下の隣: [[type-2-grammar]] — 一段下の文脈自由文法。a^n b^n は Type 2 で扱えるが a^n b^n c^n は扱えず、この差が Type 1 と Type 2 を分ける典型例。
- 兄弟: [[type-3-grammar]] — 最下位の正規文法。
- 対応する認識器: [[pushdown-automaton]] — Type 2 の認識器。Type 1 の認識器（LBA）は PDA のスタックを「入力長に比例する書き換え可能テープ」に置き換えたものに相当し、表現力の段差を理解する対比点になる。
