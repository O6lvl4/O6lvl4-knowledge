---
title: LLM ソーシャルシミュレーション
tags: [ai, llm, computational-social-science]
created_at: 2026-05-29
updated_at: 2026-05-29T18:56:07+09:00
---

LLM エージェントで人間集団や SNS の反応を模す研究分野。**Generative ABM(生成的エージェントベースモデル)** とも。[[engagement-driven-generation]] にとっては「**報酬を生むシミュレータ**」を作る側にあたる — 実ネットワークで実験できないので、シミュレートした反応を報酬・検証に使う。

## なぜ必要か

- 実 SNS での介入実験は**倫理・コスト・再現性**で困難
- シミュレートした反応量を [[reward-machine-learning|報酬]] や検証に流用できる
- 意見ダイナミクス・拡散・偏極の機序を制御環境で観察できる

## アプローチの3層

| 層 | 反応モデル | 特徴 |
|---|---|---|
| 古典 ABM | 数理モデル(Bounded Confidence, independent cascade 等) | 軽い・解析的だが表現が硬い |
| LLM エージェント | 自然言語で推論し投稿・反応を生成 | 豊かだが高コスト・ブラックボックス |
| **ハイブリッド (Generative ABM)** | 数理 + LLM | retweet/quote/comment 行動まで組み込み、意味/文体で採点 |

近年は **retweet・引用・コメントといった具体的行動**を生成過程に組み込み、生成投稿と実投稿の意味・文体の一致度で品質を測る方向(arXiv 2502.12073)。

## 代表的な取り組み

- **Generative Agents**(Park, Bernstein ら / Stanford, 2023)— 生成エージェント研究の源流。"1,000人シミュレーション" 系に発展。
- **OASIS / AgentSociety** 等の LLM ソーシャルシミュレータ(大規模・主に中国系ラボ)。
- 社会シミュレーション誌 **JASSS** にレビューが出る程度には体系化が進行中(arXiv 2507.19364)。

## 限界

- **内的心理・行動多様性の欠如** — LLM には本物の動機や個性がない。これは [[formal-vs-functional-competence|機能的言語能力]]・[[theory-of-mind|心の理論]]の欠如そのもので、シミュレーションの妥当性の根本的な天井になる。
- バイアス、ブラックボックス性、計算コスト、hallucination による不整合。
- **検証の難しさ** — 「本物らしく見える」と「本物と同じ統計を持つ」は別。慎重なバリデーションが要る。

## Links

- [Can LLMs Simulate Social Media Engagement? (arXiv 2502.12073)](https://arxiv.org/html/2502.12073v1)
- [Integrating LLM in Agent-Based Social Simulation (arXiv 2507.19364)](https://arxiv.org/pdf/2507.19364)

## 関連

- [[engagement-driven-generation]] — ここで作る反応モデルが、生成最適化の報酬になる
- [[formal-vs-functional-competence]] — LLM に内的心理が無いこと=シミュレーションの妥当性の限界の根拠
- [[theory-of-mind]] — エージェントが他者の心を持たないことの含意
- [[reward-machine-learning]] — シミュレートした反応量を報酬に変換する接点
