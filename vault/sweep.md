---
title: sweep（敵対的差分スイープ）
tags: [testing, verification, computer-science]
created_at: 2026-06-03
updated_at: 2026-06-03T13:30:24+09:00
---

**多様な入力/プログラムを大量・系統的に生成し、2つの実装(またはターゲット)の出力を突き合わせて「発散(divergence)」を炙り出す**検証手法。[[almide-differential-gate|差分テスト]]を**敵対的(adversarial)**に振り切った形 — 人が書いた spec テストが踏まない組み合わせ・境界の穴を、意図的に多様なパターンで暴く。

## 仕組み

```
プログラム/入力を大量生成(カテゴリ別に網羅)
  → 2つの oracle で実行(例: native vs WASM / 新 vs 旧 / 参照実装 vs 高速実装)
  → 全出力を照合
  → 一致しない箇所 = divergence(バグの在処)
```

肝は **2つの "正しいはず" を互いの基準(oracle)にする**こと。どちらが正解か事前に決めなくても、**食い違えば必ずどちらかが間違っている**。これが [[almide-differential-gate|差分ゲート]]や [[safety-critical-certification|安全臨界]]の「証跡で正しさを示す」発想と同根。

## なぜ「敵対的」か — spec テストとの差

| | 通常の spec テスト | **sweep** |
|---|---|---|
| 入力 | 人が書いた限られたケース | **大量・系統生成**(組み合わせ・境界を狙う) |
| 観測 | 部分的(例: 長さ・勝者だけ) | **全出力を照合** |
| 穴 | 想定外の組合せを踏まない | **踏みに行く** |

→ 「やればやるだけ出てくる」。spec テストが見逃すバグを sweep が拾い続けるのは、**網羅の穴を確率的に突く**から([[model-checking|モデル検査]]の全探索に対し、ランダム/系統生成で広く薄く当てる)。

## 2つの oracle の作り方

- **クロスターゲット** — 同一仕様の2バックエンド(例: native(Rust 経由)と WASM)。出力が一致すべき
- **新旧** — リファクタ前後(v2 vs レガシー)= [[almide-differential-gate|差分ゲート]]
- **参照 vs 最適化** — 素朴な参照実装 vs 高速実装

いずれも前提は[[deterministic-codegen|出力の決定性]] — 同じ入力で毎回同じ出力が出ないと、そもそも「食い違い」を判定できない。

## 実例: Almide の closure cross-target sweep

closure プログラムの **native == WASM 完全性**を検証するため走らせた sweep。

- カテゴリ別に振る: **スカラ値 / フラット配列 / ネスト配列 / variant payload / HOF**
- 初回 sweep で **15 発散**を発見 → 修正し PR をマージ
- 「本当に完全か」を再確認するため**再走** → 4/6 カテゴリは clean、新たに **2バグ**:
  - **BUG A**: Unit-param closure variant の trap
  - **BUG B**: `group_by` Int-key の invalid module
- spec テストが **WASM-only かつ長さ/勝者しか見ない**ために見逃していた穴を、この sweep が炙り出した

## 親戚(位置づけ)

- **differential testing** — 2実装の差分を取る。sweep の土台
- **property-based testing / fuzzing** — ランダム/系統生成で網羅の穴を突く生成戦略
- **metamorphic testing** — 「正解が不明でも、入力変換に対する出力の関係」で検証する近縁手法

## 押さえどころ（カード化候補）

- **sweep とは** → 多様なプログラムを大量生成し、2 oracle(native/WASM 等)の出力を全照合して発散を炙り出す敵対的差分検証。
- **なぜ効く** → どちらが正解か決めずとも「食い違えば必ずどちらかが誤り」。spec テストが踏まない組み合わせ・境界を生成で突く。
- **前提** → 出力の決定性(同入力→同出力)が無いと差分判定が成立しない。
- **実例** → Almide closure の native==WASM 検証。カテゴリ別生成で初回15発散、再走で2バグ(Unit-param variant trap / group_by Int-key)。
- **親戚** → differential / property-based / fuzzing / metamorphic testing。

## 関連

- [[almide-differential-gate]] — 新旧を照合する差分ゲート(sweep のクロスターゲット版に対し同一ターゲット版)
- [[deterministic-codegen]] — 出力が決定的でないと発散判定が成立しない前提
- [[anf-closure-lifting-bug]] — 事後検証が本物のバグを炙り出した別事例(postcondition 版)
- [[model-checking]] — 全探索で網羅する対極。sweep は生成で広く当てる
