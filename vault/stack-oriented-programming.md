---
title: スタック指向プログラミング
tags: [programming-paradigm, computer-science]
created_at: 2026-05-19
updated_at: 2026-05-19
---

スタック上の値を操作して計算を進めるプログラミングパラダイム。

## プログラマ向けの一言

**変数がない。引数も戻り値もない。あるのはスタックだけ。** 値を積んで、演算子が上から取って結果を積む。それだけ。

## コードで理解する

```ts
// スタックマシンのシミュレータ
function run(program: string): number[] {
  const stack: number[] = [];

  for (const token of program.split(" ")) {
    switch (token) {
      case "+": { const b = stack.pop()!; const a = stack.pop()!; stack.push(a + b); break; }
      case "*": { const b = stack.pop()!; const a = stack.pop()!; stack.push(a * b); break; }
      case "dup":  stack.push(stack[stack.length - 1]); break;  // 複製
      case "swap": { const b = stack.pop()!; const a = stack.pop()!; stack.push(b, a); break; }
      case "drop": stack.pop(); break;
      default:     stack.push(Number(token)); break;  // 数値をpush
    }
  }
  return stack;
}

// 3 + 4
run("3 4 +");          // [7]

// (2 + 3) * 4
run("2 3 + 4 *");      // [20]

// 括弧が要らない — 逆ポーランド記法 (RPN)
// 通常:  (2 + 3) * 4
// RPN:   2 3 + 4 *
// 演算子が来た瞬間に実行できる → パーサ不要
```

## なぜスタックか

```ts
// 通常の関数呼び出し:
//   名前付き引数 → レジスタ or スタックフレームに配置 → 関数が取り出す
//   変数のスコープ管理、引数の順序、返り値の受け渡し...

// スタック指向:
//   すべてがスタック上。push と pop だけ。
//   → コンパイラが極端に単純になる
//   → 組み込みシステムに向いている（メモリが少なくて済む）
//   → [[type-2-grammar|PDA（プッシュダウンオートマトン）]]とまさに同じモデル
```

## スタック操作語

```
dup    ( a -- a a )       スタックトップを複製
drop   ( a -- )           スタックトップを捨てる
swap   ( a b -- b a )     上の2つを入れ替え
over   ( a b -- a b a )   2番目をコピーしてトップに
rot    ( a b c -- b c a ) 3番目をトップに回す
```

`( a b -- b a )` はスタック効果記法。`--` の左が入力、右が出力。

## 代表的な言語

- [[forth|Forth]] — スタック指向の元祖 (1970)
- PostScript — PDF の元になったページ記述言語
- Factor — 現代的なスタック指向言語
- Bitcoin Script — トランザクション検証用

## 関連

- [[type-2-grammar|Type 2 文法（文脈自由文法）]] — PDA はスタックマシン
- [[forth|Forth]]
