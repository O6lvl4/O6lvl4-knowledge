---
title: App Delivery
tags: [tools, apple, business]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:14+09:00
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

### fastlane lane の最小例

`Fastfile` に lane（一連のアクションの並び）を定義する。Android 側が Gradle DSL + Secrets で署名→`bundleRelease`→`supply` を組むのと対になる、iOS の最小ベータ配信フロー:

```ruby
# fastlane/Fastfile
default_platform(:ios)

platform :ios do
  lane :beta do
    match(type: "appstore")              # 共有リポジトリから証明書/プロファイルを同期
    build_app(scheme: "MyApp")           # = gym。archive → .ipa を生成
    upload_to_testflight                 # = pilot。TestFlight へ配信
  end
end
```

CI から `fastlane beta` で起動。認証は App Store Connect API Key を `app_store_connect_api_key` で渡し、`match` の復号パスフレーズや API Key の `.p8` は **環境変数 / GitHub Secrets 経由**（Android の Gradle キーストアと同じく、鍵をリポジトリに置かない）。

```ruby
# API Key を Secrets から組み立てる例（CI 冒頭）
app_store_connect_api_key(
  key_id:      ENV["ASC_KEY_ID"],
  issuer_id:   ENV["ASC_ISSUER_ID"],
  key_content: ENV["ASC_KEY_P8"],        # .p8 の中身を Secret に格納
)
```

## 2026年の新要素

- **Build Upload API** — App Store Connect API から **ビルドを直接アップロード**可能に。Xcode/Transporter の手動操作が不要になり、CI/CD・独自 DevOps への統合が容易に
- **Webhooks** — ビルドアップロード／ベータビルド／Apple ホスト型アセットパックの **状態変化を自前サーバへ通知**。下流処理の自動トリガが組める
- **TestFlight API** — 新しいスクリーンショット／クラッシュフィードバックの有無をクエリ可能
- **iOS のノータリゼーション** が App Store Connect から提出可能に（App Store 外の iOS 配布＝EU 等向けに拡張）
- **2026年4月以降**: アップロードに全 Apple プラットフォームの **最低 SDK 要件** を満たすことが必須
- **Privacy Manifest** の不備（required reason API の用途未申告：ファイルタイムスタンプ、UserDefaults、ディスク容量、アクティブキーボード、起動時刻など）は2026年でも頻出の却下要因

## 押さえどころ

- **署名 = 証明書 + プロファイル** — 「誰が・どのアプリを・どの経路で」を縛る。Android の Play App Signing 二鍵方式に対応
- **自動化の二択** — 純正 Xcode Cloud（密結合・月25h込み）か OSS fastlane（任意 CI・移植性）。fastlane は `match`/`gym`/`pilot`/`deliver` の組み合わせ
- **鍵はリポジトリに置かない** — ASC API Key の `.p8` も match の復号鍵も Secrets/環境変数経由。Android の Gradle キーストアと同じ原則
- **2026 の前進は API 駆動** — Build Upload API でビルド直接アップロード、Webhooks で状態通知、TestFlight API。手動 Transporter 操作が不要に
- **頻出却下** — Privacy Manifest の required reason API 未申告（UserDefaults/ファイルタイムスタンプ等）

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
