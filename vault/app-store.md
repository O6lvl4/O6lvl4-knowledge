---
title: App Store
tags: [business, apple, law]
created_at: 2026-05-30
updated_at: 2026-05-30T00:40:00+09:00
---

Apple のアプリ配信プラットフォーム。2026年現在の最大の論点は、長年の **一律30%モデルの崩壊**。規制（EU DMA）と訴訟（Epic v. Apple）の圧力で、手数料体系が **地域ごと（US / EU / 日本 / UK）に分岐** し、グローバル一律の収益設計が成り立たなくなった。

## 標準モデル（グローバル既定）

- 標準コミッション **30%**
- **Small Business Program**（年間売上 100万ドル未満）と、サブスク2年目以降は **15%**

## 米国 — Epic v. Apple の帰結

- **2025年4月以降**: 米国のアプリは外部決済リンクを自由に設置でき、外部購入に対する Apple のコミッションは **0%**。Apple は当初27%の外部手数料スキームで「malicious compliance（悪意ある形式的遵守）」とされ法廷侮辱認定 → 差止命令で外部決済ゼロコミッションを強制された
- **反ステアリング条項の撤廃**: アプリ内ボタン・メール・プッシュ通知で外部の安い価格を自由に告知でき、静的URL制限なしに外部決済へ誘導できる
- **2026年4月**: 第9巡回区控訴裁が stay（執行停止）を覆す → Gonzalez Rogers 判事の下に差し戻し、Apple が審査コスト回収のために課せる手数料の範囲を審理。Apple は最高裁に上告中。決着まで **米国の外部決済はコミッションフリーが継続**

## EU — DMA 体制（2026年1月1日から単一ビジネスモデル）

- **代替アプリマーケットプレイス**（Epic / Microsoft / Amazon 等が独自の審査・決済・キュレーションを持つ本格的ストアを運営可能）、**Web配信**、認可開発者サイトからの **サイドローディング** が可能
- ただし EU 配信の全アプリは引き続き Apple の **ノータリゼーション（公証）** 必須
- 旧 **Core Technology Fee（CTF, 100万インストール超で €0.50/install）を廃止** し、レイヤード型に再編:

| 手数料 | 料率 | 適用 |
|---|---|---|
| Core Technology Commission (CTC) | 5% | デジタル商品/サービス、全EU配信経路（App Store / Web配信 / 代替マーケット）共通 |
| Initial Acquisition Fee | 2% | 新規ユーザーの最初の6ヶ月 |
| Store Services Fee Tier 1 | 5% | 基本配信のみ |
| Store Services Fee Tier 2 | 13%（Small Business は 10%） | フルスイート（ディスカバリ・分析・自動更新等） |

- これらは **スタック** し、外部決済での Apple の総取り分は約 **20%**（標準30%との対比）

## 含意

手数料・配信経路が地域で根本的に異なるため、グローバル一律ではなく **地域別の収益化戦略** が必須になった。日本でもスマホソフトウェア競争促進法が同種の圧力をかけており、分岐はさらに進む。

## 関連

- [[app-release-flow|App Release Flow]] — ゼロから公開までの全体フロー地図
- [[app-delivery|App Delivery]] — App Store に出すまでのビルド・署名・配布工程
- [[app-store-review|App Store Review]] — 配信前の必須審査ゲート。2026年は AI 開示・年齢確認・米国判決対応が主軸
- [[xcode|Xcode]] — アプリのビルド・署名・提出元。App Store Connect と連携し、ノータリゼーションもここを起点に行う
- [[google-play|Google Play]] — Android 側の対応プラットフォーム（Epic 訴訟・手数料引き下げの並行事例）

## Links

- [Update on apps distributed in the European Union (Apple Developer)](https://developer.apple.com/support/dma-and-apps-in-the-eu/)
- [Getting started as an alternative app marketplace in the EU (Apple Developer)](https://developer.apple.com/support/alternative-app-marketplace-in-the-eu/)
- [Epic Games Wins Reversal of Stay in App Store Fee Legal Battle (MacRumors, 2026-04)](https://www.macrumors.com/2026/04/29/epic-games-wins-reversal-app-store-fee-battle/)
- [App Store Fees and Commission Rates in 2026: Apple EU Changes (FunnelFox)](https://blog.funnelfox.com/apple-app-store-fees-2026-eu-dma/)
