---
title: コンパイルの決定性 (Determinism/Purity Belt)
tags: [almide, compiler, build-systems]
created_at: 2026-06-01
updated_at: 2026-06-01T11:43:06+09:00
---

コンパイラの codegen は「**入力だけで出力が一意に決まる純関数**」でなければならない、という原則と、それを守るための仕組み。[[almide|Almide]] では非決定性の源を CI で機械的に締め出す **Determinism/Purity Belt**(`scripts/check-forbidden-impurities.sh` が grep で検出)として実装している。

## 何が「RNG」か(この文脈)

ここでの **RNG = 乱数生成器 (Random Number Generator)**。codegen パス(parse → check → lower → mono → codegen)で乱数を使うと**コンパイル出力が非決定的**になる — 同じソースから実行ごとに違う WASM が出る。Belt が grep で禁止する代表トークン:

- `thread_rng`(rand のスレッドローカル乱数)
- `fastrand`(fastrand クレート)
- `rand::random`(rand のグローバル乱数)

## 締め出す非決定性の源(まとめて禁止)

RNG 単独でなく、「codegen に絶対入れてはいけない非決定の源」を一括で禁止する。

| 源 | 例 | なぜダメか |
|---|---|---|
| **RNG** | `thread_rng` / `fastrand` / `rand::random` | 乱数で出力がブレる |
| **clock** | `std::time` / `Instant::now` | 時刻でビルドが変わる |
| **thread** | スレッド並行 | 実行順で出力が変わりうる |
| **never-reset な atomic counter** | egg の fresh-var カウンタ系 | グローバル状態に依存し、コンパイル間で番号がズレる |

counter 系は「**コンパイルごとにリセット**(決定的に採番)」すれば使える — 禁止なのは*リセットされない*グローバルカウンタ。

## なぜ決定性が要るか

1. **再現性** — ビルドが**入力だけ**で決まらないと、[[build-caching|ビルドキャッシュ]]や [[almide-differential-gate|差分ゲート]](出力照合)が壊れる。「同じ入力→同じ出力」が崩れると、キャッシュも検証も信用できない。
2. **プレイグラウンドの安定** — Almide コンパイラは `wasm32-unknown-unknown` でブラウザ実行される。出力がブレると `RuntimeError: unreachable` のようなトラップを誘発しうる。

## 押さえどころ（カード化候補）

- **原則** → codegen は入力だけで出力が決まる純関数であるべき。Almide は非決定の源を CI で grep 禁止する(Determinism/Purity Belt)。
- **RNG とは** → 乱数生成器。codegen に入れると同じソースから違う WASM が出る。`thread_rng`/`fastrand`/`rand::random` を禁止。
- **禁止4種** → RNG・clock(`Instant::now`)・thread・never-reset な atomic counter。「codegen に入れてはいけない非決定の源」を一括 grep。
- **counter は条件付き OK** → コンパイル毎にリセットして決定的採番すれば可。禁止なのはリセットされないグローバル版。
- **なぜ** → ①再現性(キャッシュ/差分ゲートの前提)②wasm32 ブラウザ実行の安定(トラップ回避)。

## 関連

- [[build-caching]] — 「同じ入力→同じ出力」が壊れるとキャッシュが無効化する。決定性はその前提
- [[almide-differential-gate]] — 出力をレガシーと照合する検証。非決定だと照合自体が成立しない
- [[pure-functional-programming]] — 参照透過性(入力だけで出力が決まる)を codegen に課した形
- [[almide]] — Determinism/Purity Belt を持つコンパイラ本体
- [[safety-critical-certification]] — 再現可能ビルドは認証(証跡)でも要件になる
- [[constraints-liberate]] — 「非決定を禁じて再現性を買う」= 制約が自由を生むの一例
- [[sweep]] — native vs WASM の出力照合。決定性が無いと発散判定が成立しない
- [[traversal-totality|走査網羅性]] — 同じく「規律を機械的ゲートに変える」兄弟。非決定の禁止 ↔ 取りこぼしの禁止
