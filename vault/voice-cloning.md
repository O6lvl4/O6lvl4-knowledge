---
title: 音声クローン
tags: [tts, audio, ai, aituber]
created_at: 2026-05-20
updated_at: 2026-05-20
---

少量の音声データから特定の話者の声を再現する技術。任意のテキストをその声で読み上げさせることができる。AITuber のオリジナルキャラクター音声、ナレーション、吹き替え等に使われる。

## 2 つのアプローチ

### TTS モデル学習型

音声データから直接 TTS（Text-to-Speech）モデルを学習し、テキスト → 音声を生成する。

```
音声データ（5分〜3時間）
    ↓ 学習
TTS モデル
    ↓ テキスト入力
クローン音声を生成
```

- **テキストから直接音声を生成**。入力はテキストのみ
- 学習データ量と品質がそのまま出力品質に影響
- 感情やイントネーションの制御が可能な場合がある

### 声質変換型（Voice Conversion）

既存の TTS で生成した音声を、リアルタイムに別の声に変換する。

```
テキスト → VOICEVOX 等で音声生成 → RVC 等で声質変換 → クローン音声
```

- 元の TTS の発音・イントネーションを維持しつつ声だけ変える
- パイプラインが 2 段になるためレイテンシが増加
- 学習データは少なくて済む（数分で可能な場合あり）

## 主要なツール・サービス

### クラウドサービス

#### ElevenLabs

多言語対応のクラウド TTS + 音声クローン。品質は最高クラス。

| クローン方式 | 必要音声 | 品質 | 所要時間 |
|---|---|---|---|
| **Instant Voice Cloning** | 1〜5 分 | 良い（プロトタイプ向き） | 数秒 |
| **Professional Voice Cloning** | 30 分〜3 時間 | 非常に高い（商用品質） | 数時間〜 |

- 32 言語以上対応。クローン音声でも自動的に多言語で発話可能
- API あり（Pro プラン $99/月〜）
- 同意なき他人の声のクローンは禁止

料金:

| プラン | 月額 | クレジット | 音声クローン |
|---|---|---|---|
| Free | $0 | 10k | なし |
| Starter | $6 | 30k | Instant のみ |
| Creator | $11 | 121k | Professional 可 |
| Pro | $99 | 600k | Professional + API (44.1kHz) |
| Scale | $299 | 1.8M | Professional ×3 |

AITuber 用途で API を使うなら Pro ($99/月) から。従量単価は約 $0.17/分。

### ローカル実行（TTS モデル学習型）

#### [[style-bert-vits2|Style-Bert-VITS2]]

- 5〜30 分の音声データからカスタム TTS モデルを学習
- GPU 必須（VRAM 8GB 以上）。学習に数時間
- 推論速度: GPU ありで 100〜300ms
- 日本語に特化。感情表現が自然
- ランニングコスト ¥0

#### COEIROINK

- [[voicevox|VOICEVOX]] のフォーク的存在
- 自作音声モデルの追加に対応
- API 互換あり

### ローカル実行（声質変換型）

#### RVC (Retrieval-based Voice Conversion)

- 数分の音声データで声質変換モデルを学習可能
- リアルタイム変換対応
- VOICEVOX 等と組み合わせ: テキスト → VOICEVOX → RVC → 出力
- パイプラインが 2 段になりレイテンシが増加

## 比較表

| ツール | 方式 | 実行形態 | 必要音声 | 多言語 | コスト | レイテンシ |
|---|---|---|---|---|---|---|
| **ElevenLabs (Instant)** | TTS 学習 | クラウド | 1〜5 分 | 32 言語+ | $99/月〜 | ネットワーク依存 |
| **ElevenLabs (Pro)** | TTS 学習 | クラウド | 30 分〜3 時間 | 32 言語+ | $99/月〜 | ネットワーク依存 |
| **Style-Bert-VITS2** | TTS 学習 | ローカル | 5〜30 分 | 日本語特化 | ¥0 | 100〜300ms |
| **COEIROINK** | TTS 学習 | ローカル | 要確認 | 日本語 | ¥0 | VOICEVOX 同等 |
| **RVC** | 声質変換 | ローカル | 数分〜 | 言語非依存 | ¥0 | 200〜500ms（2段） |

## AITuber 用途での選択指針

| 要件 | 推奨 |
|---|---|
| 日本語オンリー、GPU あり | [[style-bert-vits2\|Style-Bert-VITS2]]（コスト ¥0、高品質） |
| 日本語オンリー、手軽に始めたい | [[voicevox\|VOICEVOX]] プリセット → 後で Style-Bert-VITS2 に移行 |
| 多言語配信、最高品質 | ElevenLabs Professional（月額 $99〜） |
| とにかく安く既存の声を変えたい | RVC + VOICEVOX |

→ コスト試算の詳細は [[aituber-cost|AITuber 配信コスト構造]] を参照

## 倫理・法的注意

- **同意のない声のクローンは禁止**。ElevenLabs はじめ主要サービスが明示的に禁じている
- 日本では肖像権・パブリシティ権の議論あり。声そのものの法的保護は未整備だが、商用利用には注意が必要
- ディープフェイクとの境界。AI 生成音声であることの開示が求められるケースが増えている

## 押さえどころ（カード化候補）

- 音声クローンの 2 アプローチ → **TTS モデル学習型（テキスト → 音声を直接生成）と声質変換型（既存 TTS の出力を別の声に変換）**
- ElevenLabs の 2 つのクローン方式 → **Instant（1〜5 分の音声、数秒で完了、プロトタイプ品質）と Professional（30 分〜3 時間の音声、商用品質）**
- ElevenLabs の多言語対応 → **32 言語以上。クローン音声でも自動的に多言語で発話可能。日本語対応**
- AITuber で日本語オンリーなら → **Style-Bert-VITS2（ローカル、GPU 必須、コスト ¥0、高品質）が最もコスパが良い**
- RVC の特徴 → **声質変換型。VOICEVOX 等の出力をリアルタイムに別の声に変換。学習データ数分で可能だがレイテンシが 2 段分増加**
- 音声クローンの倫理 → **同意のない声のクローンは禁止。AI 生成音声の開示義務が拡大傾向。日本では声の法的保護は未整備だが商用利用は注意**

## Links

- [ElevenLabs](https://elevenlabs.io/)
- [Style-Bert-VITS2 (GitHub)](https://github.com/litagin02/Style-Bert-VITS2)
- [RVC WebUI (GitHub)](https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI)

## 関連

- [[style-bert-vits2]] — ローカル TTS モデル学習型の代表
- [[voicevox|VOICEVOX]] — プリセットキャラ TTS（クローンではないが組み合わせで使う）
- [[aivishub]] — AivisSpeech のクラウド版 TTS
- [[aituber-cost|AITuber 配信コスト構造]] — TTS コスト比較を含むコスト分析
