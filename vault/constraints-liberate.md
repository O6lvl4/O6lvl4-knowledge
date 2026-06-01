---
title: 制約が自由を生む (constraints liberate)
tags: [design-principle, philosophy, computer-science]
created_at: 2026-06-01
updated_at: 2026-06-01T13:30:47+09:00
---

[[borrow-checker-value|借用チェッカー]]を一般化すると見える原則 — **よく設計された制約は、自由を奪うのでなく自由を生む**。「何かを禁じる」ことで「際限のない人間の警戒」を「機械が保証する有界な約束」に両替し、その**信頼が大胆さ・規模・合成可能性**を解き放つ。Rúnar Bjarnason の "Constraints Liberate, Liberties Constrain" が標語。

## 制約が「価値」に反転する条件

借用チェッカーから抽出した3条件は、どの制約にも効く一般則:

1. **不変条件を機械可読な場所に載せる**(型・スキーマ・lint・CI)→ 違反が**すり抜けない**
2. **局所で完結する**(全システム監査でなく、境界・シグネチャで閉じる)
3. **前倒し & 低コスト**(痛みを author/compile 時へ shift-left、実行時コストは理想ゼロ)

この3つが揃うと、制約は「面倒」から「信頼の源」に反転する。**払う見返り = 信頼 → 大胆さ**(攻めた設計・並列化・リファクタ・未知コードの実行・積極キャッシュができる)。

## 同じパターンの実例(横断)

「**X を禁じる → Y が買える**」の形で、vault のあちこちに同型が現れる。

| 制約(何を禁じる) | 買えるもの(自由) | vault |
|---|---|---|
| 共有 × 可変を禁止(aliasing XOR mut) | メモリ安全・データ競合なし・fearless concurrency | [[borrow-checker-value]] |
| 不正な状態を型で表現不能に | 「あり得ない状態」の分岐・バグが消える | [[make-illegal-states-unrepresentable]] |
| 副作用・可変を禁止(純粋) | 局所推論・安全な並列/メモ化/リファクタ | [[pure-functional-programming]] / [[functional-core-imperative-shell]] |
| codegen の非決定を禁止(RNG/clock…) | 再現性・キャッシュ・差分検証 | [[deterministic-codegen]] |
| 設定の自由を禁止(規約1本) | 決定疲れの消滅・即オンボード | [[convention-over-configuration]] |
| メモリ共有を禁止(share-nothing) | コンポーネント隔離・安全な合成 | [[component-model]] |
| 使用量/効果を型で縛る | 線形性・資源安全・効果の追跡 | [[coeffect]] / [[effect-handlers]] |
| 能力(権限)を絞る(capability) | 未知コードを安全に実行(サンドボックス) | [[soup]] |

→ いずれも「人間が頭で守るしかなかった規律」を制約として外在化し、機械に守らせている。

## なぜ自由が増えるのか(逆説の核)

直感に反するが: **選択肢を減らすほど、安全に踏める一歩は大きくなる**。

- 「どこでも mutate できる」自由 → どこが壊れるか分からない → **怖くて大改修できない**
- 「mutate は `&mut` の唯一所有だけ」制約 → 壊れ得る場所が型で見える → **恐れず並列化・改修できる**

**自由(liberties)を全部残すと、不変条件を人間が全部背負う = 実質的に不自由**。制約はその背負いを機械へ移し、人間を解放する。「Liberties constrain」の意味。

## 正直な緊張

万能ではない。価値ある制約は必ず代償を持つ:

- **健全だが不完全(sound, not complete)** — 正しいのに弾かれるものが出る(借用チェッカーの自己参照、純粋関数の I/O…)。逃げ道(`unsafe`/`Rc`/shell)が要る。
- **拘束服リスク** — 制約のスコープを誤ると、守りたくない自由まで奪い生産性を殺す([[convention-over-configuration|CoC]] の「魔法」批判)。
- **設計の妙 = 禁じる集合 ≈ 要らない集合** — 良い制約は「**禁じられるものが、ほぼ最初から欲しくなかったもの**」。ここがズレると [[accidental-complexity|偶有的複雑性]]が増えるだけ。

これは [[simple-vs-easy]] とも響く — 制約は短期の easy を削るが、寿命を通じた simple/safe を買う。

## 押さえどころ（カード化候補）

- **一言** → よく設計された制約は自由を生む。「人間の際限ない警戒」を「機械の有界な保証」に両替し、信頼→大胆さを解き放つ(Bjarnason "Constraints Liberate")。
- **価値に反転する3条件** → ①不変条件を機械可読に載せる ②局所で完結 ③前倒し&低コスト。揃うと「面倒」が「信頼の源」になる。
- **逆説の核** → 選択肢を減らすほど安全な一歩が大きくなる。全自由を残す=不変条件を人間が全部背負う=実質不自由。
- **実例は同型** → 借用チェッカー/不正状態の排除/純粋性/決定性/CoC/share-nothing/capability… すべて「X を禁じて Y を買う」。
- **設計の妙** → 禁じる集合 ≈ 要らない集合。ズレると拘束服(偶有的複雑性)になる。sound-not-complete の逃げ道も要る。

## Links

- [Rúnar Bjarnason — Constraints Liberate, Liberties Constrain](https://www.youtube.com/watch?v=GqmsQeSzMdw)
- [Dijkstra — Go To Statement Considered Harmful (1968)](https://doi.org/10.1145/362929.362947)

## 関連

- [[borrow-checker-value]] — 本ノートの出発点。制約=価値の最も成功した実例
- [[make-illegal-states-unrepresentable]] — 「不変条件を型に載せる」の中核手段
- [[deterministic-codegen]] — 非決定を禁じて再現性を買う、同型の例
- [[convention-over-configuration]] — 設定の自由を禁じて決定疲れを消す
- [[pure-functional-programming]] — 副作用を禁じて局所推論を買う
- [[simple-vs-easy]] — easy を削って simple/safe を買う、という交換
- [[accidental-complexity]] — 制約のスコープを誤ると逆に複雑性が増える
