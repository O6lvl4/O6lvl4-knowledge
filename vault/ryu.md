---
title: Ryū (最短往復の float→文字列変換)
tags: [computer-science, compiler]
created_at: 2026-06-04
updated_at: 2026-06-04T11:02:27+09:00
---

IEEE-754 浮動小数点数を、**パースし直すと同じビット列に戻る中で最短の10進文字列**に変換するアルゴリズム(Ulf Adams, "Ryū: fast float-to-string conversion", PLDI 2018)。正しさ(最短かつ round-trip)と速さを両立する。

## 何を解くか

`0.1` は2進で正確に表せない。f64 に最も近い値を印字するとき、候補は:

- 正確な10進展開: `0.1000000000000000055511151231257827…`(長すぎる)
- 過剰精度の丸め: `0.10000000000000001`
- **最短往復**: `0.1` ← parse すると元の f64 に戻る中で最短

Ryū は3つ目を、**常に高速・常に正確**に出す。「最短かつ round-trip する一意な表現」を選ぶのがミソ。

## 系譜

| アルゴリズム | 出典 | 特徴 |
|---|---|---|
| Dragon4 | Steele & White 1990 | 正確だが多倍長演算で遅い |
| Grisu(2/3) | Loitsch 2010 | 整数演算で高速。ただし Grisu3 は ~0.5% で遅い fallback に落ちる |
| **Ryū** | Adams 2018 | fallback 無しで常に高速・常に最短往復。名は竜(龍) — Dragon 系への目配せ |

Rust の標準ライブラリは float の `Display`/`to_string` に Ryū を使う(dtolnay の `ryu` クレートが下回り)。だから `0.3_f64.to_string()` は `"0.3"` になる。

## なぜ cross-target で問題になるか

[[traversal-totality|Almide の cross-target 等価性]]ギャップ #2 がこれ。native(Rust 経由)は Ryū で**最短往復**を出すが、WASM ランタイムが**固定精度**フォーマッタだと、**同じ float 値が違う文字列**になる(`0.3` vs `0.30000000000000004`)。→ silent な native↔WASM 乖離。直し方は wasm ランタイムに Ryū を移植し、両ターゲットを最短往復に揃えること。

## 押さえどころ（カード化候補）

- **正体** → float→文字列の「最短往復」変換。parse で同じビットに戻る中で最短桁を出す。
- **系譜** → Dragon4(正確・遅) → Grisu(速・稀に fallback) → Ryū(速・常に正確・fallback 無)。
- **どこで使う** → Rust std の float Display(`ryu` クレート)。`0.3.to_string() == "0.3"`。
- **罠** → フォーマッタが違えば同じ float が別文字列に → cross-target 乖離。

## Links

- [Ryū: Fast Float-to-String Conversion (PLDI 2018)](https://dl.acm.org/doi/10.1145/3192366.3192369)
- [ryu crate (dtolnay)](https://github.com/dtolnay/ryu)

## 関連

- [[traversal-totality]] — Almide の cross-target 等価性ギャップ #2。wasm 側に Ryū 未移植で乖離
- [[deterministic-codegen]] — 出力が決定的でも、フォーマッタが違えば文字列は乖離しうる
