---
title: 代数的演算 (algebraic operations)
tags: [type-theory, programming-paradigm]
created_at: 2026-06-01
updated_at: 2026-06-01T09:55:12+09:00
---

副作用を「**代数的理論(演算の signature + 等式)の演算**」としてモデル化する考え方。Plotkin & Power の理論で、[[algebraic-effects|Algebraic Effects]] の「**代数的**」が何を指すかの正体。効果が「代数的演算」だからこそ、[[effect-handlers|ハンドラ]]がその「解釈」になり、[[monad|モナド]]と繋がる。

## 演算は「継続を引数に取る」形をしている

各副作用を、結果の続き(継続)を引数に取る演算として書く(generic effects)。

| 効果 | 演算の型 | 読み |
|---|---|---|
| 状態 get | `get : (S → X) → X` | 状態を読んで続きへ渡す |
| 状態 put | `put : S × X → X` | 状態を書いて続きへ |
| 非決定 choose | `choose : X × X → X` | 2つの続きに分岐 |
| 例外 raise | `raise : X` (0引数=空) | 続きが無い(脱出) |

ポイントは演算が**計算 `X` を引数・結果に持つ**こと。`raise` が0引数(arity 0)なのは「続きが無い=戻らない」を表す。[[effect-handlers|継続の resume 回数]](0/1/多)はこの arity と対応する。

## 「代数的」= 等式で意味を縛る

演算には**等式 (algebraic theory)** が課される。例えば状態の法則:

```
get (λs. put s k)        = k                 -- 読んだ値をそのまま書くと無変化
put s (get (λs'. k s'))  = put s (k s)       -- 書いた直後に読むと書いた値
put s (put s' k)         = put s' k          -- 連続 put は最後だけ効く
```

この等式系(= **Lawvere theory** / 代数的理論)が「状態とは何か」を意味として定義する。演算 + 等式で代数を作るから「代数的」。

## 自由モデル → 自由モナド → ハンドラ

- 代数的理論の**自由モデル**を取ると、それが副作用の**[[monad|モナド]]**になる(free monad)。→ 代数的効果とモナドが理論で繋がる所以。
- **ハンドラ** = その理論の(自由でない)別モデルへの**準同型 = 解釈**。同じ演算列に違うモデルを与える = 同じプログラムに違うハンドラを与える、と一致する。

## 何が代数的に表せるか(線引き)

「代数的」であるには、演算が**継続に対して一様(可換)に振る舞う**必要がある。

- **代数的**: 状態・例外・非決定・入出力 → 効果ハンドラで素直に扱える
- **非代数的**(この枠に素直に乗らない): `call/cc` のような継続そのものを捕まえる操作、一部の higher-order な効果。これらは別扱い(Plotkin-Pretnar の handler や後続研究が拡張を議論)

この線引きが「どの副作用が algebraic effects で扱いやすいか」を決めている。

## 押さえどころ（カード化候補）

- **代数的演算とは** → 副作用を「代数的理論(演算 signature + 等式)の演算」でモデル化する考え(Plotkin & Power)。algebraic effects の「代数的」の中身。
- **演算の形** → 継続を引数に取る(generic effects)。`get:(S→X)→X`、`raise:X`(arity 0=戻らない)。arity が継続の resume 回数に対応。
- **等式で意味を定義** → put-put / put-get 等の法則(Lawvere theory)が「状態とは何か」を縛る。演算+等式だから「代数的」。
- **自由モデル=自由モナド** → 代数的理論の自由モデルが副作用モナド。ハンドラは別モデルへの準同型(解釈)。
- **線引き** → 状態/例外/非決定/IO は代数的、`call/cc` 等は非代数的。これが扱いやすさの境界。

## Links

- [Plotkin & Power — Algebraic Operations and Generic Effects (2003)](https://doi.org/10.1023/A:1023064908962)

## 関連

- [[algebraic-effects]] — 「代数的」効果の「代数的」の理論的根拠
- [[effect-handlers]] — ハンドラ = 代数的理論の別モデルへの解釈。演算 arity と resume 回数が対応
- [[monad]] — 代数的理論の自由モデルが副作用モナド(free monad)になる
- [[category-theory]] — Lawvere theory / 代数的理論の圏論的背景
