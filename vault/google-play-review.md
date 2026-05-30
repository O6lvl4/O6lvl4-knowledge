---
title: Google Play Review
tags: [business, android, law]
created_at: 2026-05-30
updated_at: 2026-05-30T01:40:00+09:00
---

Google Play 配信前のポリシー審査ゲート。自動スキャン主体で、[[app-store-review|App Store Review]] より歴史的に緩い／速いとされてきたが、2026年は **低品質・欺瞞アプリと AI への締め付け**、**プライバシー権限の厳格化** が進む。Developer Program Policy に集約。

## 審査時間（2026年）

- アップデートは比較的速い（数時間〜）が、**新規アプリ・新規アカウントは長期化**（数日かかることも）
- 新規個人アカウントには別途 **クローズドテストの14日ゲート** が課される（[[android-release-flow|Release Flow]]参照）

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

## 関連

- [[android-release-flow|Android Release Flow]] — 審査の前後を含む全体フロー
- [[android-delivery|Android Delivery]] — 審査に出すまでの工程
- [[google-play|Google Play]] — 審査後の配信先と手数料
- [[app-store-review|App Store Review]] — Apple 側の対応審査

## Links

- [Policy announcement: April 15, 2026 (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/16926792)
- [Developer Program Policy (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/16933379)
- [April 2026 Google Play Policy Updates (ASO World)](https://asoworld.com/blog/april-2026-google-play-policy-updates-key-changes-for-contacts-permissions-location-privacy-account-transfers/)
