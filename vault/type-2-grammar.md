---
title: Type 2 文法（文脈自由文法）
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:04+09:00
---

[[chomsky-hierarchy|チョムスキー階層]]の Type 2。プログラミング言語の構文定義に最も広く使われる。

## プログラマ向けの一言

**スタック（push/pop）があれば判定できる言語。** 「開き括弧を push、閉じ括弧で pop、最後に空なら OK」— これがまさに Type 2。

## 例1: 括弧の対応チェック

プログラマなら書いたことがあるはず:

```ts
function isBalanced(input: string): boolean {
  const stack: string[] = [];

  for (const ch of input) {
    if (ch === "(") {
      stack.push(ch);          // 開き括弧 → push
    } else if (ch === ")") {
      if (stack.length === 0) return false;
      stack.pop();             // 閉じ括弧 → pop
    }
  }
  return stack.length === 0;   // 全部対応していれば空
}

isBalanced("((()))");  // true
isBalanced("(()");     // false
isBalanced(")(");      // false
```

正規表現では括弧の対応は絶対にチェックできない。スタックが必須 = Type 2 の問題。

## 例2: a^n b^n（a が n 個、b が n 個）

元の会話で出てきた例。文法は `S → aSb | ab`。

```ts
// 文法ルールどおりに生成してみる
function generate(n: number): string {
  // S → aSb を n-1 回適用し、最後に S → ab
  return "a".repeat(n) + "b".repeat(n);
}

// 判定する（= プッシュダウンオートマトン）
function matchAnBn(input: string): boolean {
  const stack: string[] = [];
  let i = 0;

  // フェーズ1: a を見たら push
  while (i < input.length && input[i] === "a") {
    stack.push("a");
    i++;
  }

  // フェーズ2: b を見たら pop
  while (i < input.length && input[i] === "b") {
    if (stack.length === 0) return false;
    stack.pop();
    i++;
  }

  // 全部読み切って、スタックも空なら OK
  return i === input.length && stack.length === 0;
}

matchAnBn("aaabbb");  // true  (n=3)
matchAnBn("aabb");    // true  (n=2)
matchAnBn("aabbb");   // false (a=2, b=3)
matchAnBn("");         // false
```

## PDA = 有限オートマトン + スタック

> 受理モデルの形式的定義・NPDA≠DPDA・2スタックでチューリング完全といった詳細は [[pushdown-automaton|プッシュダウン・オートマトン]] を参照。

```ts
// プッシュダウンオートマトン (PDA) の一般的な構造
type PDA = {
  state: string;
  stack: string[];
  transition: (state: string, input: string, stackTop: string)
    => { nextState: string; stackOp: "push" | "pop" | "none"; pushValue?: string };
};

// Type 3（有限オートマトン）との違いはスタックがあるかどうかだけ
// Type 3: state だけで判断
// Type 2: state + stack.peek() で判断
```

## NPDA vs DPDA

```ts
// 文法: S → aSb | ab
// 「aSb にする？ ab にする？」が入力を見ただけでは決まらない → 非決定性 (NPDA)

// NPDAをコードで表現すると「全パターンを試す」再帰になる
function npdaMatch(input: string, pos: number, stack: string[]): boolean {
  if (pos === input.length && stack.length === 0) return true;

  // 選択肢1: S → aSb を試す
  // 選択肢2: S → ab を試す
  // どっちかが成功すれば OK（非決定的 = 全探索）
  return tryRule1(input, pos, [...stack]) || tryRule2(input, pos, [...stack]);
}

// DPDAは「先読み」などで選択を一意にできる場合のみ動く
// プログラミング言語のパーサは大体 DPDA 相当（LL(1), LR(1) など）
```

## プログラミング言語との関係

```ts
// JSON パーサ = Type 2 パーサの典型例
// { "a": { "b": [1, 2] } }
// ↑ 入れ子構造 → スタックで { や [ の対応を追跡

// 再帰下降パーサ = 関数の再帰呼び出し = コールスタックを使った PDA
function parseExpr(): Expr {
  if (peek() === "(") {
    consume("(");
    const inner = parseExpr();  // 再帰 = stack.push() と同じ
    consume(")");               // 対応する閉じ括弧 = stack.pop()
    return inner;
  }
  return parseAtom();
}
```

## 限界

```ts
// a^n b^n c^n (a が n 個、b が n 個、c が n 個) は判定できない
// スタックで a の個数を数えて b と対応させることはできるが、
// その時点でスタックは空になっているので、c の個数をチェックする手段がない
// → Type 1 が必要
```

## 押さえどころ（カード化候補）

- **メモリモデル**: スタック1本（push/pop）があれば判定できる言語。「開き括弧で push、閉じ括弧で pop、最後に空なら OK」が典型。
- **括弧の対応**: 正規表現では絶対にチェックできず、スタックが必須。これが Type 3 との決定的な差。
- **代表例 a^n b^n**: 文法 `S → aSb | ab`。a を push し b で pop、読み切ってスタックが空なら受理。
- **NPDA vs DPDA**: 入力を見ただけで規則選択が一意に決まらないと非決定性（全探索）。先読みで一意化できれば決定性で、LL(1)/LR(1) など実用パーサは概ね DPDA 相当。
- **限界**: a^n b^n c^n は判定不可。a と b を対応させるとスタックが空になり c を数える手段が残らない → Type 1 が必要。

## 関連

- 親: [[chomsky-hierarchy]] — Type 2 はこの階層の文脈自由文法の層。プログラミング言語の構文定義に最も広く使われる。
- 対応する認識器: [[pushdown-automaton]] — Type 2 を過不足なく認識する機械そのもの。「有限オートマトン + スタック」であり、本ノートの括弧対応・a^n b^n はすべて PDA の動作で説明できる。NPDA≠DPDA や 2 スタックでチューリング完全になる詳細はこちらを参照。
- 上の隣: [[type-1-grammar]] — 一段上の文脈依存文法。a^n b^n c^n のようにスタック1本では足りない言語はここへ上がる。
- 下の隣: [[type-3-grammar]] — 一段下の正規文法。スタックを取り去り状態だけにしたものが Type 3 で、括弧対応ができなくなる点が境界。
- 兄弟: [[type-0-grammar]] — 最上位。PDA に無制限テープを与えるとこの層（チューリングマシン）に到達する。
