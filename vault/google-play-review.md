---
title: Google Play Review
tags: [business, android, law]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:14+09:00
---

Google Play 配信前のポリシー審査ゲート。自動スキャン主体で、[[app-store-review|App Store Review]] より歴史的に緩い／速いとされてきたが、2026年は **低品質・欺瞞アプリと AI への締め付け**、**プライバシー権限の厳格化** が進む。Developer Program Policy に集約。

## 審査時間（2026年）

歴史的に「Apple より速い」とされたが、自動スキャン主体ゆえ**ばらつきが大きい**のが実態。[[app-store-review|App Store Review]] の 24-48h は中央値が安定しているのに対し、Play は順調なら速いが詰まると長い。

| ケース | 目安 | 備考 |
|---|---|---|
| 更新（既存アプリ・既存アカウント） | 1〜3日 | 機能差分が小さければ数時間で通ることも |
| 新規アプリ（順調） | 24〜72時間 | 全ポリシー準拠・フラグなし・非繁忙期の前提 |
| 新規アプリ（軽微な指摘あり） | 3〜7日 | 修正の往復を含む典型ケース |
| 重大な指摘・要大幅修正 | 〜2週間 | ワーストケース |
| 新規個人アカウント | 上記 + **14日のクローズドテストゲート** | 別途必須（下記） |

- **新規アプリ・新規アカウントほど長期化**しやすく、機微カテゴリ（金融・健康・子供向け）や繁忙期はさらに延びる
- 新規個人アカウントには別途 **クローズドテストの14日ゲート** が課される（20名以上のテスター・最低14日連続。[[android-release-flow|Release Flow]]参照）。これは Apple 側に存在しない Android 固有の障壁

## 頻出却下パターン

[[app-store-review|App Store Review]] が UX/ガイドライン違反中心なのに対し、Play は**自動検出しやすい技術的・ポリシー的欠陥**が上位を占める。

| パターン | 内容 | 回避策 |
|---|---|---|
| クラッシュ・ANR | 起動直後/主要動線でのクラッシュ、応答なし | 実機・Firebase Test Lab で主要端末を検証 |
| 権限の濫用 | 機能に不要な権限要求（連絡先・位置・SMS 等） | 最小権限。Contact/Photo Picker など権限不要 API を優先 |
| プライバシーポリシー欠落/リンク切れ | データ収集ありなのに方針未掲示、URL が 404 | Play Console とアプリ内の両方に有効な URL |
| 薄いコンテンツ・低品質 | 中身の乏しいラッパー、Web ビューだけのアプリ | ネイティブ価値を持たせる |
| メタデータ不備・誤解誘導 | 不完全な掲載情報、機能を偽るタイトル/説明 | 実機能と一致させ、全フィールドを埋める |
| 課金ポリシー違反 | デジタル財でGooglePlay課金を迂回 | Play Billing を使用（対象カテゴリ） |
| クローズドテスト未達 | 新規個人アカウントの14日ゲート未通過 | 14日・20名要件を先に消化 |
| AI 生成コンテンツの未開示 | 生成コンテンツの開示なし・有害/誤解誘導 | 開示必須（2026 改定。下記） |

## 2026年の主要ポリシー改定（4月15日告知、準拠まで最低30日）

### プライバシー・権限

- **Contacts 権限**: 連絡先への広範アクセスを制限。不要なら Android の Contact Picker を使うこと
- **Location 権限**: 高精度位置情報は location button を最小スコープとして推奨
- **Account Transfer**: 所有権移転は Play Console の公式「Transfer ownership」ワークフロー必須
- **Health & Fitness データ**: Android 16 の粒度権限・Health Connect の新データ型に対応。雇用/保険適格性判断や無断共有での利用を明確に禁止

### AI・品質

- **AI 生成コンテンツの開示が必須**。誤解を招く・有害なものは不可
- 誤解を招くタイトル、偽の機能、スパム的挙動のアプリは **削除されやすく** なる（欺瞞・低品質への強い対応）

### その他

- ニュース／雑誌アプリは **2026年5月27日まで** に Play Console で自己申告。未対応は削除
- 全アプリが **Android 15 以上を target** すること

## 押さえどころ

- **更新は速く新規は遅い** — 更新 1〜3日、新規 24〜72h（順調時）。詰まると 2 週間。Apple より中央値のばらつきが大きい
- **14日クローズドテストゲート** — 新規個人アカウント固有。Apple に存在しない Android 独自の関門
- **却下は技術的欠陥が上位** — クラッシュ/ANR・権限濫用・プライバシーポリシー欠落・薄いコンテンツ。自動スキャンで拾われやすい
- **2026 の締め付け** — AI 生成の開示必須、低品質/欺瞞アプリの削除強化、Contacts/Location 権限の厳格化、target Android 15 以上

## 関連

- [[android-release-flow|Android Release Flow]] — 審査の前後を含む全体フロー
- [[android-delivery|Android Delivery]] — 審査に出すまでの工程
- [[google-play|Google Play]] — 審査後の配信先と手数料
- [[app-store-review|App Store Review]] — Apple 側の対応審査

## Links

- [Policy announcement: April 15, 2026 (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/16926792)
- [Developer Program Policy (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/16933379)
- [April 2026 Google Play Policy Updates (ASO World)](https://asoworld.com/blog/april-2026-google-play-policy-updates-key-changes-for-contacts-permissions-location-privacy-account-transfers/)
