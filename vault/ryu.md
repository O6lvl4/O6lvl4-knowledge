---
title: Ryū (最短往復の float→文字列変換)
tags: [computer-science, compiler]
created_at: 2026-06-04
updated_at: 2026-06-04T11:19:23+09:00
---

IEEE-754 浮動小数点数を、**パースし直すと同じビット列に戻る中で最短の10進文字列**に変換するアルゴリズム(Ulf Adams, "Ryū: fast float-to-string conversion", PLDI 2018)。**固定長整数演算だけ**で「最短かつ往復保証」を達成し、多倍長への fallback を持たない点が新しかった — 当時の最速だった Grisu3 比で約3倍。

## 何を解くか — 最短往復

float を印字するとき何が「正しい」か。各有限 float は、それに丸められる実数の **half-ulp 区間**(両隣の float との中点で挟まれる帯)を持つ。最短往復問題は「**その区間に入る、最も桁数の少ない10進数**」を選ぶこと。`0.1`(2進で正確に表せない)の候補:

- 正確な10進展開: `0.1000000000000000055511…`(長すぎる)
- 過剰精度の丸め: `0.10000000000000001`
- **最短往復**: `0.1` ← parse すると元の f64 に戻る中で最短桁

条件は2つ同時に効く — ①**往復**(read-back で同一ビット)②**最短**(桁数最小)。丸めは round-to-nearest, ties-to-even に整合させる。

## どう動くか — fallback 無しの鍵

古典 Dragon4 は多倍長(bignum)演算で正確だが遅い。Ryū の洞察は「**結果の先頭数桁しか要らないなら、巨大な乗算は不要**」(ulfjack README)。

- float の周りの**10進境界区間**を、事前計算した**5の冪のテーブル**と固定長の multiply-shift だけで求め、その区間に入る最短桁を生成する。多倍長は一切使わない。
- 具体定数(binary64, 原実装 `d2s_full_table.h`/`d2s_intrinsics.h`):
  - `DOUBLE_POW5_SPLIT` **326 エントリ** / `DOUBLE_POW5_INV_SPLIT` **342 エントリ**(各 `uint64` ペア)、125 bit 精度
  - 中核は `mulShift64`(64×128 bit 乗算 → 179 bit 中間 → シフト)。整数幅は最大 **256 bit で有界**、決して任意精度にならない
- Grisu3 は速いが「最短と保証できない入力」を検出し、**~0.5%** を Dragon4 へ fallback する(dotnet 計測: 99.5% が最適、残り 0.5% を slow path 行き)。**Ryū は fallback 無し** — 全有限 f32/f64 を固定長整数だけで最短まで出し切るのが論文の主貢献。論文は完全な正しさの証明を含む(機械検証ではなく紙の証明)。

## 系譜 — Dragon 一族

| アルゴリズム | 出典 | 位置づけ |
|---|---|---|
| Dragon4 | Steele & White, PLDI 1990 | 最短・正確だが多倍長で遅い。命名の祖 |
| Grisu(2/3) | Loitsch, PLDI 2010 | 整数で高速。Grisu3 は ~0.5% を Dragon4 に fallback |
| Errol | Andrysco ら, POPL 2016 | 常に正しい高速法。Grisu3 比 2× |
| **Ryū** | Adams, PLDI 2018 | fallback 無しで最短。Grisu3 比 ~3×。固定長整数のみ |
| Schubfach | Giulietti, ~2018/2021 | 鳩の巣原理(独 *Schubfach*)。Java(JDK19+)が採用 |
| Dragonbox | Jeon, 2020– | Schubfach 系。現状 Ryū と同等〜上回る |

命名は全部ドラゴン由来: Dragon4 → Grisu(漫画の小さな竜) → **Ryū(日本語の竜)** → Dragonbox。作者本人いわく「White と Steele のは Dragon。同じ系譜で日本語の dragon = Ryu にした」。

## 性能と現在地

- 速度(原 C 実装ベンチ, f64): Ryū **27.5 ns** vs Grisu3 **99.0 ns**(~3.6×)。Java 移植では旧 JDK 実装比 ~12×。
- ただし**今や最速ではない**。後発の **Schubfach / Dragonbox が Ryū に並ぶ〜上回る**(Russ Cox 2026 / Lemire 2026)。Go は 2025-11 に最短経路を Ryū → Dragonbox に置換し geomean **~22%** 高速化(固定精度は Ryū-printf を維持)。
- それでも「固定長整数だけで最短・fallback 無し」を最初に実現した設計として、Schubfach/Dragonbox の土台になった。

## 採用状況(2026 時点)

| 言語/実装 | 最短変換 | 備考 |
|---|---|---|
| MSVC `<charconv>` `std::to_chars` | **Ryū / Ryū printf** | Microsoft STL が Ryū 由来 |
| Rust エコシステム | dtolnay の **`ryu` クレート**(serde_json 等) | **std/core は Ryū でなく Grisu+Dragon fallback**(`flt2dec`)。最短になるのはこちらでも同じ |
| Go | 旧 Ryū → **Dragonbox**(2025-11〜) | 固定精度の Ryū-printf は維持 |
| Java | **Schubfach**(JDK19+) | 旧 `Double.toString` は別法で非最短だった |

→ よくある誤解「Rust = Ryū」は不正確。Rust **std** は Grisu+Dragon で、Ryū は外部 `ryu` クレートとして普及している(だから `0.3_f64.to_string()` が `"0.3"` になるのは std の Grisu+Dragon の働き)。

## 変種: Ryū printf

固定精度版("Ryū Revisited: Printf Floating Point Conversion", Adams, OOPSLA 2019)。base Ryū が**桁数を自分で決める(最短)**のに対し、Ryū printf は**呼び出し側が指定した桁数**で `%f`/`%e`/`%g` を出す。任意基数にも一般化。既存 printf 実装比で **3.8〜55×**(glibc ~15×、musl ~4×、MSVC ~9×、macOS libc ~24×)。

## 押さえどころ（カード化候補）

- **正体** → float→文字列の「最短往復」変換。half-ulp 区間に入る最小桁数の10進を出す。
- **新規性** → 固定長整数だけで最短・**fallback 無し**(Grisu3 は ~0.5% を Dragon4 に逃がす)。Grisu3 比 ~3×。
- **系譜** → Dragon4(正確・遅)→ Grisu(速・稀に fallback)→ **Ryū** → Schubfach/Dragonbox(現状 Ryū 超え)。全部ドラゴン命名。
- **採用** → MSVC charconv。Rust は **std でなく** dtolnay `ryu` クレート(std は Grisu+Dragon)。Go は Dragonbox へ、Java は Schubfach。
- **変種** → Ryū printf(固定精度 %f/%e/%g、OOPSLA 2019、既存 printf 比 3.8〜55×)。

## Links

- [Ryū: Fast Float-to-String Conversion (PLDI 2018)](https://dl.acm.org/doi/10.1145/3192366.3192369)
- [Ryū Revisited: Printf Floating Point Conversion (OOPSLA 2019)](https://2019.splashcon.org/details/splash-2019-oopsla/52/Ry-Revisited-Printf-Floating-Point-Conversion)
- [ulfjack/ryu — 原実装(C/Java・ベンチ・テーブル)](https://github.com/ulfjack/ryu)
- [dtolnay/ryu — Rust クレート](https://github.com/dtolnay/ryu)
- [jk-jeon/dragonbox — 後継(Ryū 超え)](https://github.com/jk-jeon/dragonbox)

## 関連

- [[traversal-totality]] — 同じ float を別実装/別フォーマッタで文字列化すると食い違う問題(`0.3` vs `0.30000000000000004`)の具体因子
- [[deterministic-codegen]] — 出力が決定的でも、フォーマッタが違えば文字列は乖離しうる
