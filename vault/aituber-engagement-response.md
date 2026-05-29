---
title: AITuber 応答のエンゲージメント最適化
tags: [aituber, ai, llm]
created_at: 2026-05-29
updated_at: 2026-05-29T19:07:53+09:00
---

ライブ配信の AITuber 応答を、視聴者エンゲージメント([[reward-machine-learning|報酬]])で最適化する設計。[[engagement-driven-generation]] / [[inference-time-alignment]] を**最も制約の厳しいリアルタイム環境**に落とした応用。報酬は代理(エンゲージ予測)、ストリーミング必須、レイテンシ予算が数百ms〜と最厳。

## なぜ難しい / でも実は有利

- **きつい点**: 代理報酬(reward hacking リスク)+ 低レイテンシ + ストリーミング。素朴な best-of-N は間に合わない。
- **有利な点**: AITuber は **TTS が律速**。テキストは短く、生成→選別してから TTS に流せば、**逐次表示の犠牲がほぼ無い**(TTS 側が体感のリアルタイム性を吸収する)。→ テキストチャットより BoN が刺さりやすい。

## レイテンシ予算(目安・要実測)

```
chat/イベント検知 → [LLM 応答テキスト ~0.5–1.5s] → TTS → 口パク/音声
                      ↑ ここに BoN を仕込む。TTS が後段なので
                        「全文生成→選別→TTSへ」で違和感が出にくい
```

テキスト生成段の予算内に収めるため、**N と報酬器を削る**のが設計の主眼。

## 設計: 小N BoN + 軽い報酬器

```ts
// 候補は Mastra Agent で並列生成(非ストリーム)。N=2–3、温度↑で分散
const cands = await Promise.all(
  Array.from({ length: 3 }, () => agent.generate(context, { temperature: 0.9 }))
);
// 報酬は重い LLM-judge ではなく "1回 forward で済む軽い予測器"
const best = cands[argmax(await scoreEngagement(cands.map(c => c.text)))];
// 勝者だけを Mastra Agent で stream → TTS へ
return agent.stream(rephraseAsIs(best));   // 既に確定文なので実質そのまま流す
```

要点:
- **N は 2–3**。並列生成なので壁時計はほぼ1回分(同時実行できる infra 前提)。
- **報酬器は軽量必須**。LLM-judge は往復が増えるので避け、エンゲージ予測の小分類器(数ms forward)か、初期はヒューリスティック。
- **Speculative rejection** で序盤に明らかなダメ候補を間引けばさらに速い。

## 報酬を何にするか(進化パス)

| 段階 | 報酬の中身 | 手段 |
|---|---|---|
| コールドスタート | 「チャット欄が反応しそうか」 | ヒューリスティック(質問形・呼びかけ・感情フック・簡潔さ)+ 軽い judge |
| ログ蓄積後 | 応答後30sの**コメント増加量・スパチャ確率・滞在** | 配信ログで学習した [[viralbert]] 的予測器 |

実エンゲージ(コメント delta/スパチャ)を `response_id` で join して報酬器を育てる**閉ループ**。代理報酬を実測へ寄せていく。

## 反・報酬ハッキング(AITuber 固有)

エンゲージ最大化を放置すると **スパチャ強請り・釣り・煽り**へ暴走する。歯止め:

- **品質 × エンゲージの積**(`√(engagement·quality)`、[[engagement-driven-generation]] と同じ)
- **ペルソナ一貫性を報酬項に入れる** — キャラ崩れを罰する。AITuber では「キャラの一貫性」自体が価値であり、KL 正則化のドメイン版として効く。
- 安全フィルタは報酬と別経路で(エンゲージ報酬に安全を混ぜない)。

## データループと差し戻し

```
配信中: context→候補N→スコア→best を配信 + (context, cands, scores, chosen) をログ
配信後: 実エンゲージを join → 報酬予測器を再学習
        + (chosen, rejected) を DPO 選好ペアに → 応答モデルをオフライン微調整
        → 改善モデルを Mastra Agent の裏に差し戻す(プロバイダ境界)
```

## 関連

- [[engagement-driven-generation]] — 報酬で生成を最適化する一般形。本ノートはそのリアルタイム応用
- [[inference-time-alignment]] — 小N BoN / speculative rejection / guided の選択肢と理論
- [[reward-machine-learning]] — 「エンゲージ予測=報酬」の基礎
- [[viralbert]] — 配信ログで育てる報酬予測器の原型
- [[aituber-cost]] — BoN は推論を N 倍にするため、コスト構造に直結する
