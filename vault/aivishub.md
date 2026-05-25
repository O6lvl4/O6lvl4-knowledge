---
title: AivisHub
tags: [tts, audio, api, aituber]
created_at: 2026-05-20
updated_at: 2026-05-20
---

日本語音声合成（TTS）のクラウド API サービス。[[voicevox|VOICEVOX]] フォークの **AivisSpeech** をベースにしたホスティング版で、API 経由で音声合成を利用できる。

## 料金体系

- **単価**: 1 文字 = 0.044 クレジット
- **1 クレジット = ¥1**
- 従量課金制。リクエストごとに文字数 × 0.044 cr が消費される
- 無料枠あり（使い切り後はクレジット購入）
- プレミアムプラン（詳細不明）あり

### コスト感

| 文字数 | クレジット消費 | 円換算 |
|---|---|---|
| 1 文字 | 0.044 cr | ¥0.044 |
| 100 文字 | 4.4 cr | ¥4.4 |
| 10,000 文字（≒ 1 時間発話） | 440 cr | ¥440 |

クラウド TTS（Google Cloud TTS / Amazon Polly / Azure TTS）が約 ¥2,400/100 万文字なのに対し、AivisHub は **約 18 倍** の単価。高品質な日本語キャラクター音声に対するプレミアム価格。

## API

- エンドポイント: `/v1/tts/synthesize`
- リクエストにテキストと話者 ID を指定
- レスポンスで音声データを返す

## AivisSpeech との関係

| | AivisSpeech | AivisHub |
|---|---|---|
| 実行形態 | ローカル実行 | クラウド API |
| コスト | 無料（電気代のみ） | 従量課金 |
| GPU 要否 | 必要（推奨） | 不要 |
| セットアップ | インストール必要 | API キーのみ |
| レイテンシ | ローカル依存 | ネットワーク往復 + サーバー処理 |

AivisSpeech 自体は VOICEVOX のフォークで、ローカル実行なら無料。AivisHub はそのホスティング版。

## 他の TTS との比較

→ [[aituber-cost|AITuber 配信コスト構造]] に詳細な比較あり

| サービス | 単価（1 万文字） | 音声品質（日本語キャラ） |
|---|---|---|
| **AivisHub** | ¥440 | 高い（アニメ声系） |
| **Google/AWS/Azure** | ≒ ¥24 | 標準的（キャラ声向きではない） |
| **VOICEVOX（ローカル）** | ¥0 | 高い（アニメ声系） |
| **Style-Bert-VITS2（ローカル）** | ¥0 | 高い（カスタム声可） |

ローカル GPU があるなら VOICEVOX / AivisSpeech をローカル実行するほうがコスト面で圧倒的に有利。

## 押さえどころ（カード化候補）

- AivisHub の正体 → **AivisSpeech（VOICEVOX フォーク）のクラウドホスティング版 TTS API**
- AivisHub の単価 → **1 文字 = 0.044 クレジット。1 クレジット = ¥1。クラウド TTS（Google 等）の約 18 倍の価格**
- AivisHub vs ローカル実行の違い → **AivisHub は GPU 不要・API キーのみで始められるが従量課金。AivisSpeech / VOICEVOX をローカル実行すれば無料**
- AITuber 用途での AivisHub コスト → **1 時間配信で約 ¥440（1 万文字想定）。毎日 1 時間で月額 ¥13,200**

## Links

- [AivisHub](https://hub.aivis-project.com/)
- [AivisSpeech](https://aivis-project.com/)

## 関連

- [[voicevox|VOICEVOX]] — AivisSpeech の元になった TTS ソフト
- [[aituber-cost|AITuber 配信コスト構造]] — LLM + TTS の合算コスト分析
- [[style-bert-vits2]] — 別のローカル TTS 選択肢
