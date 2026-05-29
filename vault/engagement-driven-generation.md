---
title: エンゲージメント駆動生成
tags: [ai, llm, writing]
created_at: 2026-05-29
updated_at: 2026-05-29T17:35:17+09:00
---

エンゲージメント(拡散・反応)を**報酬関数**に据えて、LLM の生成そのものを最適化する手法群。[[viralbert]] が「伸びるか**予測**する」段階だったのに対し、これは予測器/シミュレータを報酬に変えて「**伸びる文章を生成**する」段階。2024〜2025 に研究・実運用が立ち上がった。

## 中核の設計パターン

ライブラリというより、繰り返し現れる**1つのパターン**:

```
LLM で候補を N 本生成
  → エンゲージメント報酬モデル/シミュレータでスコア
  → 上位を選別 (best-of-n) もしくは RL でポリシー更新
```

報酬側に [[viralbert]] のようなバイラル性予測器を挿せば成立する。**生成器(LLM)と報酬(何が伸びるか)を分離**するのが肝。

## 代表的な研究・実装

| 手法 | 何をするか | 報酬の作り方 | 特徴 |
|---|---|---|---|
| **Engagement-Driven Content Generation** (arXiv 2411.13187) | エンゲージmentを最大化する文章を RL で生成 | SNS の反応を**形式的エンゲージメントモデルでシミュレート** | 実ネットワークなしで報酬を得る |
| **PushGen** (arXiv 2512.14490, 2025) | プッシュ通知を生成 | **報酬モデルで候補をランキング選別** + 制御可能なカテゴリプロンプト | **数億ユーザー規模で実運用デプロイ** |

## RLAIF — 報酬を AI に作らせる

訓練手法の総称が **RLAIF (Reinforcement Learning with AI Feedback)**。人間アノテータの代わりに preference モデル(GPT-4, Gemini 等)が pairwise 比較・スコアを返し、それを報酬モデルに蒸留して PPO / DPO 等でポリシー最適化する。エンゲージメント報酬を人手で集める必要がなくなるため、この系統を支える土台になっている。

## エージェント・製品の層(2026)

- **自作の王道**: LangChain / CrewAI + X(Twitter)API で自律投稿エージェントを組む。OSS で実装するならここ。
- **商用**: NoimosAI(実績データで戦略を自律変更)、Beam AI(hook・CTA・バイラル狙いの投稿生成)、Soshie、Olly(virality enhancer 拡張)等。

⚠️ 製品層の出典は SEO/マーケ系ブログが多く、「200K stars」「バイラル保証」のような数値・主張は**裏取りできず誇大の可能性**。学術的に検証された実体は研究層(上表)の方。

## なぜ効くか / 限界

- **効く理由**: [[human-vs-ai-text]] の「インプレを稼ぐ=平均からの逸脱」という性質を、報酬モデルが外から教えることで LLM の中庸への収束を矯正できる。
- **限界**: 報酬がシミュレータや過去データ由来なので、**報酬ハッキング**(釣り・clickbait への暴走)と**プラットフォームのアルゴリズム変化への脆弱性**が残る。[[viralbert]] が示した「伸びはフォロワー数=配信構造に支配される」という結論も効いていて、文章最適化だけでは天井がある。

## Links

- [Engagement-Driven Content Generation with LLMs (arXiv 2411.13187)](https://arxiv.org/abs/2411.13187)
- [PushGen: Push Notifications Generation with LLM (arXiv 2512.14490)](https://arxiv.org/pdf/2512.14490)
- [RLAIF 概説 (EmergentMind)](https://www.emergentmind.com/topics/reinforcement-learning-with-ai-feedback-rlaif)

## 関連

- [[viralbert]] — 予測器。本手法の報酬モデルとして挿せる前世代
- [[human-vs-ai-text]] — 「報酬モデルで best-of-n を rerank」する構成の出発点。なぜ効くかの理論的背景
- [[formal-vs-functional-competence]] — LLM の中庸さ(機能的能力の欠如)を外部報酬で補う、という構図
