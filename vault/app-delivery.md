---
title: App Delivery
tags: [tools, apple, business]
created_at: 2026-05-30
updated_at: 2026-05-30T01:05:00+09:00
---

iOS/macOS アプリを実際に世に出すまでの工程 — **ビルド（archive）→ コード署名 → アップロード → 配布 → 審査 → リリース**。[[xcode|Xcode]] で作り、[[app-store-review|App Store Review]] を通り、[[app-store|App Store]]（または EU の代替経路）に出すまでの「運ぶ」部分。2026年は **API 駆動の自動化** が大きく前進した。

## コード署名

Apple 配布の根幹。**証明書（Certificate）+ プロビジョニングプロファイル（Provisioning Profile）** の組み合わせで「誰が・どのアプリを・どの端末/経路で」配れるかを縛る。

- **Xcode 自動署名（automatic signing）** — 個人〜小規模に十分
- **fastlane match** — 暗号化した共有リポジトリに証明書を集約し、チーム/CI 間で同期。使う場合は Xcode の自動署名を **無効化** する
- Xcode 26 以降、複数プロバイダに紐づくアカウントで username/app-password 認証を使う場合は **provider public ID** が必須

## 配布チャネル

| チャネル | 用途 | 規模 |
|---|---|---|
| App Store | 一般公開 | 無制限 |
| TestFlight（内部） | チーム内ベータ | 〜100名 |
| TestFlight（外部） | 公開ベータ | 〜10,000名（$99/年の Developer Program に込み） |
| Ad Hoc / Development | 端末限定の手動配布 | 登録端末のみ |
| Enterprise | 社内専用配布 | Apple Developer Enterprise Program |
| EU 代替経路 | 代替マーケット / Web 配信 | [[app-store\|DMA 体制]]参照 |

## CI/CD と自動化

- **Xcode Cloud** — Apple 純正 CI/CD。Xcode・App Store Connect と密結合。2026年は Developer Program に **月25コンピュート時間が込み**、不足分は追加サブスク。TestFlight へ自動配信
- **fastlane** — OSS の定番。`match`（署名）/ `gym`（ビルド）/ `pilot`（TestFlight）/ `deliver`（メタデータ+提出）。任意の CI（GitHub Actions / CircleCI 等）に載る
- **アップロード手段**: Xcode Organizer、Transporter、App Store Connect API

## 2026年の新要素

- **Build Upload API** — App Store Connect API から **ビルドを直接アップロード**可能に。Xcode/Transporter の手動操作が不要になり、CI/CD・独自 DevOps への統合が容易に
- **Webhooks** — ビルドアップロード／ベータビルド／Apple ホスト型アセットパックの **状態変化を自前サーバへ通知**。下流処理の自動トリガが組める
- **TestFlight API** — 新しいスクリーンショット／クラッシュフィードバックの有無をクエリ可能
- **iOS のノータリゼーション** が App Store Connect から提出可能に（App Store 外の iOS 配布＝EU 等向けに拡張）
- **2026年4月以降**: アップロードに全 Apple プラットフォームの **最低 SDK 要件** を満たすことが必須
- **Privacy Manifest** の不備（required reason API の用途未申告：ファイルタイムスタンプ、UserDefaults、ディスク容量、アクティブキーボード、起動時刻など）は2026年でも頻出の却下要因

## 関連

- [[app-release-flow|App Release Flow]] — ゼロから公開までの全体フロー地図（この工程の位置づけ）
- [[xcode|Xcode]] — ビルド・署名・archive の起点
- [[app-store-review|App Store Review]] — アップロード後に通る審査ゲート
- [[app-store|App Store]] — 配信先と地域別の手数料/経路
- [[android-delivery|Android Delivery]] — Android 側の対応工程（archive↔AAB、証明書↔Play App Signing）

## Links

- [iOS Distribution Guide 2026: TestFlight, App Store & Enterprise](https://foresightmobile.com/blog/ios-app-distribution-guide-2026)
- [Xcode Cloud Overview (Apple Developer)](https://developer.apple.com/xcode-cloud/)
- [Automate your workflow with the App Store Connect API (Apple Developer)](https://developer.apple.com/app-store-connect/api/)
- [fastlane docs](https://docs.fastlane.tools/)
