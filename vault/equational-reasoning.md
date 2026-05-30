---
title: 等式推論
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-30T20:47:00+09:00
---

純粋関数型では「**式をその値と等しいもので自由に置き換えられる**」（参照透過性）。これを使い、プログラムを数式のように変形・証明する手法。リファクタリングの正当性も最適化も性質証明も、同じ「等式の連鎖」で扱える。

## 根拠 — 参照透過性

同じ入力には同じ出力、副作用なし。ゆえに `x` をその定義で置換しても、定義を `x` に畳んでも**意味が変わらない**。

```
-- 例: reverse (reverse xs) = xs を構造帰納で示す、
--     map f . map g = map (f . g) で2パスを1パスに（fusion）
```

## 用途

- **リファクタリングの正当化** — 変形が意味を保つことを式変形で確認
- **最適化** — fusion 則（[[stream-fusion|Stream Fusion]]）等を等式として適用。根拠に[[parametricity|自由定理]]
- **性質証明** — 帰納法＋等式で `reverse (reverse xs) = xs` のような定理を示す（Lean 等での等式推論）

## なぜ副作用を隔離するのか

副作用（IO・可変状態）があると「同じ式が同じ値」が崩れ、置換ができない＝等式推論が破れる。関数型が副作用を [[monad|IO 型]]や[[algebraic-effects|effect]]に**隔離する**動機のひとつが、純粋部分で等式推論を保つこと。

## 関連

- [[pure-functional-programming|純粋関数型言語]] — 参照透過性が等式推論の前提
- [[reduction|簡約]] — 簡約は等式に向きを付けた適用
- [[parametricity|パラメトリシティ]] — 型から従う等式（自由定理）
- [[stream-fusion|Stream Fusion]] — 等式としての融合則
