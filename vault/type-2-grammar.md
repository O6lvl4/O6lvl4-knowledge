---
title: Type 2 文法（文脈自由文法）
tags: [formal-language, automata-theory, computer-science]
---

[[chomsky-hierarchy|チョムスキー階層]]の Type 2。プログラミング言語の構文定義に最も広く使われる文法クラス。

## 定義

生成規則: A → γ

- 左辺は非終端記号1つだけ
- 右辺は終端記号と非終端記号の任意の列

「文脈自由」の意味: A がどんな文脈（周囲の記号列）にあっても、同じ規則で置換できる。文脈に依存しない。

## 例: a^n b^n

```
G = (N, Σ, P, S)
N = { S }
Σ = { a, b }
P = { S → aSb, S → ab }
```

導出例（aabb を生成）:

```
S → aSb → aabb
```

導出例（aaabbb を生成）:

```
S → aSb → aaSbb → aaabbb
```

## 認識する機械: プッシュダウンオートマトン (PDA)

有限オートマトンにスタックを追加した計算モデル。通常の有限オートマトンと2点で異なる:

1. スタックのトップを使って状態遷移を判断する
2. 遷移の一部としてスタック操作（push/pop）を行う

### PDA による a^n b^n の認識

```
Input: aaabbb, Stack: S -> aSb
Input: aabbb,  Stack: Sb
Input: aabbb,  Stack: aSbb
Input: abbb,   Stack: Sbb
Input: abbb,   Stack: abbb
Input: bbb,    Stack: bbb
Input: bb,     Stack: bb
Input: b,      Stack: b
Input: (empty), Stack: (empty) → Accept
```

### NPDA と DPDA

- **NPDA** (非決定性): 複数の遷移候補がありうる。上の例で S → aSb と S → ab のどちらを選ぶか非決定的
- **DPDA** (決定性): 各状態で遷移が一意に決まる

NPDA が認識できる言語 = 文脈自由言語の全体。DPDA はそのサブセット（決定性文脈自由言語）のみ認識する。

## プログラミング言語との関係

ほぼすべてのプログラミング言語の構文は文脈自由文法（の変種）で定義される:

- **BNF / EBNF** — 文脈自由文法の表記法
- **LL パーサ** — 左から読み、左端導出（再帰下降）
- **LR パーサ** — 左から読み、右端導出（yacc, bison）
- **PEG** — 文脈自由文法に似るが、選択に順序がある（パックラットパーサ）

## Type 3 との境界

- a^n b^n → Type 2 が必要（有限オートマトンでは n を記憶できない）
- a*b* → Type 3 で十分（個数の一致を要求しない）

## Type 1 との境界

- a^n b^n → Type 2 で十分
- a^n b^n c^n → Type 1 が必要（スタック1本では2つの量を同時追跡できない）
