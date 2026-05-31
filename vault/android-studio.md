---
title: Android Studio
tags: [tools, android, ai]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:14+09:00
---

Google 純正の Android アプリ開発 IDE。**IntelliJ IDEA ベース**で、Kotlin / Jetpack Compose が第一級。コードネーム制（Narwhal = 2025.1 等）で年次リリース。2026年は [[xcode|Xcode]] 同様、**Gemini によるエージェント化** が最大の変化。

## 2026年現在 — Gemini in Android Studio

- **Agent Mode**: エージェントが編集を提案し、バグを反復的に修正。変更を review / accept / reject でき、フィードバックで再反復させられる
- **BYOK で 1M トークン**: 自前の Gemini API キーを入れると Gemini 2.5 Pro でコンテキストウィンドウが100万トークンに拡大
- **Agent Skills**: モジュール型の指示セットで特定ワークフローにエージェントを接地。XML→Compose 移行、edge-to-edge 対応、Navigation 3 などを標準カバー。タスクに応じて自動起動
- **AGENTS.md** ファイルで Gemini の挙動をプロジェクト単位にカスタマイズ
- **モデル選択の自由**: Gemini / GPT / Claude、ローカルの Gemma まで任意のモデルを IDE に持ち込める

Google は I/O 2026 で別途、エージェント型 IDE **Antigravity** も発表しており、AI 主導開発のラインが Android Studio 内外で広がっている。

## なぜ IntelliJ ベースか（設計判断）

[[xcode|Xcode]] が独自エディタ + 独自ビルドシステム（xcodebuild）を持つのと対照的に、Android Studio は **JetBrains の IntelliJ IDEA Community Edition をフォーク**して構築されている。これは設計上の意思決定であって妥協ではない:

- **言語インフラの借用** — Kotlin は JetBrains 製。IntelliJ の PSI（Program Structure Interface）/ インスペクション基盤の上に Kotlin サポートが第一級で乗る。補完・リファクタ・型推論の質を Google が一から作らずに済む
- **プラグイン生態系** — IntelliJ プラットフォームのプラグイン API をそのまま継承。Android 固有機能（Layout Inspector, Logcat, APK Analyzer, Profiler）は Android 向けプラグイン群として実装される
- **役割分担** — IDE（IntelliJ）と**ビルドシステム（Gradle）を分離**。Xcode が project.pbxproj に両者を抱え込むのと異なり、IDE を入れ替えてもビルドは CLI で再現可能（`./gradlew` が単一の真実）

トレードオフは JVM 上で動く重さと、Gradle 同期の遅さ。それでも「言語ベンダの IDE をそのまま使う」設計は、Kotlin の進化に IDE が即追従できる利点に直結する。

## ビルドシステムの実体 — Gradle + AGP

Android Studio は薄い IDE レイヤで、ビルドの本体は **Gradle + Android Gradle Plugin (AGP)**。IDE 内のボタンは `./gradlew` の呼び出しに過ぎず、CI でも全く同じコマンドが走る（IDE 非依存の再現性）。

```kotlin
// app/build.gradle.kts — Kotlin DSL（Groovy DSL から移行が進む）
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.compose.compiler)   // Kotlin 2.0+ で Compose コンパイラが Kotlin 本体に統合
}

android {
    namespace = "com.example.app"
    compileSdk = 35                          // Android 15。2026年は target 35 以上が必須
    defaultConfig { minSdk = 24 }
    buildFeatures { compose = true }
}
```

- **AGP が DSL を解釈**し、リソースのマージ・D8/R8 によるコンパイル&圧縮（縮小+難読化）・AAB のパッケージングまでを担う
- **Kotlin DSL（`.gradle.kts`）** が標準化方向。型補完が効き、設定ミスを IDE が静的に拾える
- **Version Catalog（`libs.versions.toml`）** で依存バージョンを一元管理 → モジュール間のバージョン不整合を防ぐ

## Kotlin / Jetpack Compose の第一級扱い

Compose は宣言的 UI（SwiftUI に相当）で、`@Composable` 関数として UI を記述する。Kotlin 2.0 以降、**Compose コンパイラが Kotlin コンパイラ本体に同梱**され、バージョンが Kotlin と常に一致するようになった（旧来の `kotlinCompilerExtensionVersion` 手動指定が不要に）。

```kotlin
@Composable
fun Greeting(name: String) {
    var count by remember { mutableStateOf(0) }   // 状態がUIを駆動
    Column {
        Text("Hello, $name — tapped $count")
        Button(onClick = { count++ }) { Text("Tap") }
    }
}
```

IDE 側は Compose を一級市民として扱う: **Compose Preview**（`@Preview` をコード横でライブ描画。SwiftUI の Canvas に相当）、ライブ編集、Compose 専用インスペクション。Gemini Agent Skills が「XML→Compose 移行」を標準カバーするのも、Compose が現在の正統 UI スタックである前提による。

## Apple との対比

| | Android Studio | [[xcode\|Xcode]] |
|---|---|---|
| ベース | IntelliJ IDEA（JetBrains フォーク） | 独自エディタ |
| ビルド | Gradle + AGP（IDE と分離・CLI 再現可） | xcodebuild（project.pbxproj に密結合） |
| 主言語 | Kotlin / Compose | Swift / SwiftUI |
| 宣言的 UI プレビュー | Compose Preview（`@Preview`） | SwiftUI Canvas |
| AI | Gemini Agent Mode（BYOK可・マルチモデル） | Coding Intelligence（ChatGPT/Claude/ローカル） |
| エージェント標準 | Agent Skills / AGENTS.md | Claude Agent / Codex + MCP |

## 押さえどころ

- **IDE ≠ ビルド** — Android Studio は IntelliJ フォーク、ビルド本体は Gradle + AGP。IDE のボタンは `./gradlew` の呼び出しに過ぎず、CI も同じコマンドで再現
- **なぜ IntelliJ か** — Kotlin/PSI/プラグイン生態系を JetBrains から借りる設計判断。Kotlin の進化に IDE が即追従できる
- **Compose は宣言的 UI の正統** — Kotlin 2.0 で Compose コンパイラが Kotlin 本体に統合（バージョン一致・手動指定不要）
- **Kotlin DSL + Version Catalog** — `.gradle.kts` で型補完、`libs.versions.toml` で依存を一元管理
- **2026 の主軸は Gemini エージェント化** — Agent Mode / Agent Skills / AGENTS.md。BYOK で 1M トークン

## 関連

- [[android-release-flow|Android Release Flow]] — ゼロから公開までの全体フロー地図
- [[android-delivery|Android Delivery]] — ビルド（AAB）・署名・配布の工程
- [[google-play|Google Play]] — 配信先のストア
- [[xcode|Xcode]] — Apple 側の対応 IDE

## Links

- [Agentic AI takes Gemini in Android Studio to the next level (Android Developers Blog)](https://android-developers.googleblog.com/2025/06/agentic-ai-takes-gemini-in-android-studio-to-next-level.html)
- [What's new in Android Developer tools — I/O 2026 (Android Developers Blog)](https://android-developers.googleblog.com/2026/05/whats-new-android-developer-tools.html)
- [Customize Gemini using AGENTS.md files (Android Developers)](https://developer.android.com/studio/gemini/agent-files)
