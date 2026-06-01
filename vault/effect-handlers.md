---
title: 効果ハンドラ (effect handlers)
tags: [programming-paradigm, type-theory]
created_at: 2026-05-31
updated_at: 2026-05-31T23:05:38+09:00
---

[[algebraic-effects|Algebraic Effects]] が「`throw`/`try-catch` の一般化」と言うとき、その一般化の正体がこれ — **例外・可変状態・generator・async・非決定性・コルーチンを、たった1つの「効果を perform → handler が(限定)継続を受け取って処理」という機構の特殊例にまとめる**こと。Plotkin & Pretnar "Handlers of Algebraic Effects" (2009) が理論的出発点。

## 1つの機構が制御構造を飲み込む

ハンドラは「`perform` された地点までの**限定継続** `k` を受け取る関数」。`k` を**何回呼ぶか**で、おなじみの制御構造が再現される。

| 制御構造 | 効果としての姿 | handler が継続 `k` を |
|---|---|---|
| 例外 (exception) | `raise e` を perform | **呼ばない**(脱出のみ) |
| 可変状態 (state) | `get` / `put s` を perform | 1回呼ぶ(状態を引数で引き回す) |
| generator / iterator | `yield v` を perform | 1回呼ぶ(値を集めて一時停止) |
| async / await | `await p` を perform | 1回呼ぶ(完了時に再開＝スケジューラ) |
| 非決定性 / backtracking | `choose [a,b]` を perform | **複数回**呼ぶ(各選択肢で再開) |
| コルーチン | 双方向 yield | 相互に resume |

## 鍵は「継続を何回 resume するか」

効果の性質はこの一点でほぼ決まる:

- **0 回(resume しない)** → 例外。投げたら戻らない
- **1 回(one-shot)** → 状態・async・generator。普通の逐次再開
- **複数回(multi-shot)** → 非決定性・探索。同じ地点から枝分かれして何通りも再開

→ だから「async/await や generator や例外を**言語が個別に組み込む**」のをやめ、**効果機構1つをユーザーに開放**すれば全部ライブラリで書ける、というのが Koka / OCaml 5 / Eff の設計思想。

## 限定継続が実装基盤

handler が受け取る `k` は、**perform 地点から最も近い handler まで**を切り取った[[continuation|限定継続]](`shift`/`reset` 相当)。つまり効果ハンドラ = 「型のついた・名前のついた限定継続」とも言える。逆に限定継続があれば効果ハンドラはライブラリ実装できる。

```
handle (perform Op v) with
  | Op v, k -> ...      -- k = perform の続き(限定継続)。k(result) で再開
  | return x -> ...     -- 効果を投げずに終わった場合
```

## なぜ重要か

「**効果は代数的演算、ハンドラはその解釈**」という見方で、副作用を副作用を**第一級・合成可能・差し替え可能**にする。同じプログラムに別ハンドラを与えれば、本番=実 I/O / テスト=モック / 探索=全列挙、が**コード本体を変えずに**切り替わる。[[monad|Monad]] が型に副作用を閉じ込めて `flatMap` のネストと「色付き関数」問題を生むのに対し、効果ハンドラは直接的なコードのまま複数効果を自由に重ねられる。

## 押さえどころ（カード化候補）

- **効果ハンドラとは** → perform で効果を投げ、handler が限定継続 `k` を受け取って処理する機構。例外・状態・generator・async・非決定性を**1つの仕組みの特殊例**に一般化する。
- **継続の resume 回数で決まる** → 0回=例外、1回=状態/async/generator、複数回=非決定性/backtracking。
- **限定継続が基盤** → handler の `k` は perform 地点〜handler までの限定継続(shift/reset 相当)。効果ハンドラ ≈ 型と名前のついた限定継続。
- **設計思想** → async/generator/例外を言語が個別実装せず、効果機構1つをユーザーに開放(Koka/OCaml 5/Eff)。
- **Monad との差** → Monad は型に閉じ込め flatMap でネスト・色付き関数問題。ハンドラは直接的に書け複数効果を合成可能。

## Links

- [Plotkin & Pretnar — Handlers of Algebraic Effects (2009)](https://doi.org/10.1007/978-3-642-00590-9_7)

## 関連

- [[algebraic-effects]] — 本ノートの母体。効果ハンドラはその「一般化」の中身
- [[algebraic-operations]] — ハンドラが解釈する「代数的演算」の理論。演算 arity が resume 回数に対応
- [[continuation]] — 限定継続(shift/reset)が効果ハンドラの実装基盤
- [[monad]] — 副作用を扱う対の手法。型に閉じ込める vs 投げて処理する
- [[coeffect]] — effect(出力)の双対。文脈・資源の要求(入力)
- [[ocaml]] — OCaml 5 が効果ハンドラを言語機能として導入
