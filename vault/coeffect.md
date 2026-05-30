---
title: Coeffect
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T20:28:00+09:00
---

Effect の双対概念。Effect が「計算が**外界に及ぼす**作用（出力側）」を型で追うのに対し、Coeffect は「計算が**文脈・環境・資源に要求する**もの（入力側）」を追う。Tomas Petricek の "Coeffects: A calculus of context-dependent computation" が出典。

## Effect と Coeffect

| | Effect | Coeffect |
|---|---|---|
| 向き | 計算 → 外界（出力で何を起こすか） | 文脈 → 計算（入力に何を要求するか） |
| 例 | IO、状態変更、例外、非決定 | 変数の使用回数、必要なケイパビリティ、暗黙パラメータ、データのプライバシ階級、過去フレーム（ストリームの window） |
| 型のモデル | [[monad\|モナド]] / graded monad | [[comonad\|コモナド]] / graded comonad |
| 添字の意味 | 起こりうる作用の集合 | 要求する資源・文脈の量 |

## graded（添字付き）modal type

資源量を型に持ち上げる: `□_r A`（資源 `r` のもとで `A`）。線形型・アフィン型（使用回数 0/1/n の追跡）はこの特殊形。研究言語 **Granule** が graded modal types で coeffect を一級に扱う。

## なぜ重要か

「このコードは何を**必要とするか**」を型で静的に保証できる。例えば「この関数は変数 x を高々1回しか使わない」「この計算は GPS 権限を要求する」「この値は機密レベル2を要求する」を型レベルで追跡し、リソース安全性・情報フロー制御・線形性を一様な枠組みで扱える。Effect system（できること）と Coeffect system（要ること）は補完的。

## 関連

- [[comonad|Comonad]] — coeffect system の型を与える構造
- [[algebraic-effects|Algebraic Effects]] — 双対の相手。effect（出力）↔ coeffect（入力）
- [[monad|Monad]] — effect 側のモデル。graded monad の双対が graded comonad
- [[dependent-type|依存型]] — 型に値・量の情報を載せる点で隣接
