---
title: App Store Review
tags: [business, apple, law]
created_at: 2026-05-30
updated_at: 2026-05-30T00:50:00+09:00
---

[[app-store|App Store]] 配信前に全アプリが通る、Apple の必須審査ゲート。自動チェック + 人間レビュアーの組み合わせで、ルールは **App Review Guidelines** に集約される。2026年は **AI 関連の締め付け**、**年齢確認の義務化**、**米国判決への対応** が主軸。

## 審査時間（2026年）

- 大半のアプリは **24〜48時間** で審査完了
- 複雑なアプリ・フラグが立ったものは **1週間以上** かかることも
- **ヘルス / 金融 / キッズ** カテゴリは上級レビュアーの関与が必須で長期化
- Mac App Store の審査時間が増加傾向（2026年3月時点で報告）

## 2026年の主要ガイドライン改定

### AI 関連（最重点）

- AI 生成コンテンツは **明示的な開示が必須**。AI の能力を偽る／自動処理を隠すアプリは却下されやすい
- 個人データを **第三者 AI を含む第三者と共有** する場合、共有先を明確に開示し、事前に明示的な許可を得る必要がある
- **AI 生成アプリ** に対しては、minimum functionality（最低限の機能）・スパム・コピーキャットのルールをより積極的に適用

### 年齢確認・年齢レーティング

- 新ガイドライン **1.2.1(a)**: クリエイター系アプリは、アプリの年齢レーティングを超えるコンテンツをユーザーが識別できる手段を提供し、**検証済みまたは申告済みの年齢** に基づくアクセス制限機構を持つこと
- **2026年1月31日まで** に年齢レーティング更新が必須
- ブラジル・オーストラリア・シンガポール・ユタ州・ルイジアナ州で地域固有の年齢要件が追加

### 米国判決対応（外部リンク）

- **2026年2月6日改定**: 米国判決への準拠でガイドライン **3.1.1 / 3.1.1(a) / 3.1.3 / 3.1.3(a)** を更新。米国ストアフロントのボタン・外部リンク・CTA に関する規定（[[app-store|Epic 訴訟]] の帰結）
- **米国以外の全ストアフロント** では依然、IAP 以外の購入手段へ誘導するボタン・外部リンク・CTA は禁止。音楽ストリーミングは特定地域で entitlement により例外的にリンク許可

### UGC・ミニアプリ

- **ランダム／匿名チャット** を持つアプリは UGC ガイドライン **1.2** の対象であることを明確化
- **HTML5 / JavaScript のミニアプリ・ミニゲーム** がガイドライン（4.7）のスコープ内であることを明確化。バイナリに埋め込まれていないソフトウェアを提供するアプリは、Apple の事前許可なくネイティブ API を拡張・公開してはならない

## 関連

- [[app-release-flow|App Release Flow]] — ゼロから公開までの全体フロー地図
- [[app-delivery|App Delivery]] — 審査に出すまでのビルド・署名・アップロード工程
- [[app-store|App Store]] — 審査が通った先の配信プラットフォーム。手数料・配信経路の地域分岐
- [[xcode|Xcode]] — App Store Connect 経由での提出元。ノータリゼーションもここが起点
- [[google-play-review|Google Play Review]] — Android 側の対応審査

## Links

- [App Review Guidelines (Apple Developer)](https://developer.apple.com/app-store/review/guidelines/)
- [Updated App Review Guidelines now available (Apple Developer News)](https://developer.apple.com/news/?id=ey6d8onl)
- [Age requirements for apps distributed in Brazil, Australia, Singapore, Utah, and Louisiana (Apple Developer News)](https://developer.apple.com/news/?id=f5zj08ey)
- [App Store Review Queue Delays in 2026](https://appstorereview.app/guides/app-store-review-queue-delays-2026)
