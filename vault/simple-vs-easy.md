---
title: Simple vs Easy
tags: [design-principle, philosophy, computer-science]
created_at: 2026-05-29
updated_at: 2026-05-29T12:26:42+09:00
---

Rich Hickey ([[clojure|Clojure]] 作者) が講演 "Simple Made Easy" (2011) で提示した区別。**simple と easy は別物であり、混同するとソフトウェアが壊れる**という主張。日本語圏では eed3si9n 訳「シンプルさの必要性」がほぼ唯一のまとまった紹介で、概念自体は [[clojure|Clojure]] コミュニティ発だが Go コミュニティでも頻繁に参照される。

## 語源で切り分ける

| | 語源 | 意味 | 対義語 | 軸 |
|---|---|---|---|---|
| **Simple** | *simplex* = one fold/braid | 一つの役割・概念・タスクだけを担う | complex（撚り合わさった） | **客観的** |
| **Easy** | *adjacent* = lie near | 自分に「近い」(手が届く/馴染みがある/能力的に届く) | difficult（困難） | **主観的** |

決定的なのは軸の違い。**simple は「絡まり具合」を外から観察できるので客観的に判定できる。easy は「誰にとって近いか」に依存するので相対的**。`gem install` 一発で入る = easy だが、それが simple とは限らない。

## complect — 諸悪の根源

Hickey の造語(復活させた古語)。「**絡み合わせる・編み込む**」こと。複数の関心事を結びつけると complex になり、毛玉(hairball)化して**一部だけ取り出して変更することが不可能になる**。

> "We are going to complect" は設計上の悪手を名指しする動詞として使われる。

## なぜ simple が重要か

理由は「美しいから」ではなく、**変更可能性 (changeability)** に直結するから。

```
complect → 全体を理解しないと一部すら触れない → 理解の限界がそのまま変更の限界になる
simple   → 関心事が独立 → 局所的に理解でき、局所的に変更できる
```

Hickey はこれを **architectural agility (設計上の機敏さ) の源は simplicity** と表現する。テストやリファクタリング技法は事後の対症療法で、根本は最初から complect しないこと。

## easy を追うと complexity が積もる

easy な選択(手近・馴染み・即導入)は**短期の労力を減らすが、システムに複雑さを織り込む**。複雑さのツケは後の変更時に「全体を把握する認知負荷」として一括請求される。

> easy はその場の生産性、simple は寿命を通じた生産性。トレードオフの時間軸が違う。

## complect しやすい道具（Hickey の名指し）

| complect する道具 | 代わりに使うべき simple な手段 |
|---|---|
| state / object | value（不変値） |
| 位置引数 | 名前付き引数 / map |
| 継承・switch・複雑な条件分岐 | polymorphism |
| ORM | （「世界で最も複雑なものの一つ」）生のデータ操作 |
| XML | JSON / データリテラル |
| 情報を型でラップ | map（ハッシュテーブル）を直接 |

共通する処方箋は **「データを値のまま、関心事を分離したまま扱え」** — Clojure の設計思想そのもの。

## Go との接続

Clojure 発の概念だが、Go コミュニティの "simplicity" 信仰と深く響き合う。Rob Pike の **"Simplicity is complicated"**（simple な言語を作るのは難しい労力が要る）は、Hickey の「easy ではない道(simple)を選べ」と同じ構図。Go が機能追加に保守的なのは、easy な糖衣構文より simple な言語コアを優先する判断と読める。

ただし両者は同じ語を別の力点で使う:
- **Hickey**: simple = 関心事が absolute に分離している (complect していない)
- **Go 文化**: simple = 言語機能・読み手の認知負荷が小さい（≒ 読みやすさ・少なさ）

「少ない/読みやすい」は Hickey 基準では easy 寄りのこともあるので、同じ "simple" でも指すものがずれうる点に注意。

## Links

- [シンプルさの必要性 · eed3si9n](https://eed3si9n.com/ja/simplicity-matters/) — "Simple Made Easy" の日本語訳

## 関連

- [[functional-programming]] — value 優先・関心分離という処方箋の土台
- [[lisp]] — Clojure とその「コード = データ」思想
- [[convention-over-configuration]] — easy さを設計で担保する別アプローチ（対照的）
- [[the-rails-doctrine]] — DHH の設計哲学。easy/simple のトレードオフを別の立場から
- [[accidental-complexity]] — simple の追求は偶有的複雑性を削る営みそのもの
- [[clojure]] — Hickey が設計した言語。思想の実装
- [[constraints-liberate]] — easy を削って simple/safe を買う交換の一般形(制約が自由を生む)
