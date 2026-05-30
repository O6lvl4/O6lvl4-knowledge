---
title: Android Studio
tags: [tools, android, ai]
created_at: 2026-05-30
updated_at: 2026-05-30T01:40:00+09:00
---

Google 純正の Android アプリ開発 IDE。**IntelliJ IDEA ベース**で、Kotlin / Jetpack Compose が第一級。コードネーム制（Narwhal = 2025.1 等）で年次リリース。2026年は [[xcode|Xcode]] 同様、**Gemini によるエージェント化** が最大の変化。

## 2026年現在 — Gemini in Android Studio

- **Agent Mode**: エージェントが編集を提案し、バグを反復的に修正。変更を review / accept / reject でき、フィードバックで再反復させられる
- **BYOK で 1M トークン**: 自前の Gemini API キーを入れると Gemini 2.5 Pro でコンテキストウィンドウが100万トークンに拡大
- **Agent Skills**: モジュール型の指示セットで特定ワークフローにエージェントを接地。XML→Compose 移行、edge-to-edge 対応、Navigation 3 などを標準カバー。タスクに応じて自動起動
- **AGENTS.md** ファイルで Gemini の挙動をプロジェクト単位にカスタマイズ
- **モデル選択の自由**: Gemini / GPT / Claude、ローカルの Gemma まで任意のモデルを IDE に持ち込める

Google は I/O 2026 で別途、エージェント型 IDE **Antigravity** も発表しており、AI 主導開発のラインが Android Studio 内外で広がっている。

## Apple との対比

| | Android Studio | [[xcode\|Xcode]] |
|---|---|---|
| ベース | IntelliJ IDEA | 独自 |
| 主言語 | Kotlin / Compose | Swift / SwiftUI |
| AI | Gemini Agent Mode（BYOK可・マルチモデル） | Coding Intelligence（ChatGPT/Claude/ローカル） |
| エージェント標準 | Agent Skills / AGENTS.md | Claude Agent / Codex + MCP |

## 関連

- [[android-release-flow|Android Release Flow]] — ゼロから公開までの全体フロー地図
- [[android-delivery|Android Delivery]] — ビルド（AAB）・署名・配布の工程
- [[google-play|Google Play]] — 配信先のストア
- [[xcode|Xcode]] — Apple 側の対応 IDE

## Links

- [Agentic AI takes Gemini in Android Studio to the next level (Android Developers Blog)](https://android-developers.googleblog.com/2025/06/agentic-ai-takes-gemini-in-android-studio-to-next-level.html)
- [What's new in Android Developer tools — I/O 2026 (Android Developers Blog)](https://android-developers.googleblog.com/2026/05/whats-new-android-developer-tools.html)
- [Customize Gemini using AGENTS.md files (Android Developers)](https://developer.android.com/studio/gemini/agent-files)
