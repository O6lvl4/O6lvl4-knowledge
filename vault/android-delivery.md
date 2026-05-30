---
title: Android Delivery
tags: [tools, android, business]
created_at: 2026-05-30
updated_at: 2026-05-30T01:40:00+09:00
---

Android アプリを世に出すまでの工程 — **ビルド（AAB）→ 署名 → アップロード → 配布**。[[app-delivery|Apple 側]]と対になる「運ぶ」部分。2026年の前提は **AAB 必須・Play App Signing 必須・最新 API ターゲット**。

## ビルド形式 — AAB

- **Android App Bundle（AAB）** が Google Play の標準公開形式（APK は直接配布しない）
- Play Console に単一の AAB をアップロードすると、Google が **Dynamic Delivery** で端末ごとに最適化した APK を生成・配信

## 署名 — Play App Signing（新規アプリは必須）

二鍵方式で「誰のアプリか」を担保する。

- **Upload Key**（アップロード鍵）— 自分で作成・保管。AAB に署名してアップロードし、本人であることを Google に証明
- **App Signing Key**（署名鍵）— Google が保護インフラ内で生成・管理。実際に端末へ届くアプリに署名

Upload Key を紛失しても Google 側でリセット可能なのが、自前管理だった旧来との違い。

## CI/CD

- **Gradle 署名設定**: `app/build.gradle` にキーストア情報を **環境変数経由**で渡す（ハードコード厳禁。Secrets Manager / Vault 推奨）。`./gradlew bundleRelease` で `app-release.aab` を生成
- **fastlane** (`supply`) や **Google Play Developer API（Publisher API）** で Play Console へ自動アップロード。GitHub Actions 等に載せられる
- **最新 API ターゲット必須**: 2026年は Android 15 以上を target すること

## 配布チャネル

| チャネル | 用途 |
|---|---|
| Google Play | 一般公開（テストトラック含む） |
| 代替ストア | Epic Games Store for Android 等。[[google-play\|Registered App Stores]]で導入容易化 |
| サイドローディング | APK 直接配布（Android は標準で可能、iOS との根本的違い） |
| Managed Google Play | 企業内配布（EMM 連携） |

## 関連

- [[android-release-flow|Android Release Flow]] — 全体フロー地図
- [[android-studio|Android Studio]] — ビルドの起点
- [[google-play-review|Google Play Review]] — アップロード後の審査・テストゲート
- [[app-delivery|App Delivery]] — Apple 側の対応工程（AAB↔archive、Play App Signing↔証明書）

## Links

- [Complete Guide to Android App Publishing in 2026 (Foresight Mobile)](https://foresightmobile.com/blog/complete-guide-to-android-app-publishing-in-2026)
- [Use Play App Signing (Play Console Help)](https://support.google.com/googleplay/android-developer/answer/9842756)
- [APKs and Tracks — Google Play Developer API](https://developers.google.com/android-publisher/tracks)
