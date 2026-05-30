---
title: Xcode
tags: [tools, apple, ai]
created_at: 2026-05-30
updated_at: 2026-05-30T00:25:00+09:00
---

Apple 純正の IDE。macOS / iOS / iPadOS / watchOS / visionOS 向けアプリ開発の中心。2025年の WWDC で OS 群と歩調を合わせ **Xcode 16 → Xcode 26** へ一気にバージョンを飛ばし、年号ベースの命名に移行した（iOS 26 / macOS 26 と同列）。

## 2026年現在の状況（Xcode 26 系）

最大の変化は **Coding Intelligence**（AI コーディングアシスタント）の標準搭載。Apple は開発体験をハイブリッド AI モデル中心に再設計した。

### ローカル（オンデバイス）

- Swift と Apple SDK に特化して訓練された専用モデルが Mac 上で完結して動作
- NPU を使い、単一行・複数行の予測補完を提供
- ネットワーク不要・プライバシー保持

### クラウド／外部モデル

- **ChatGPT がビルトイン**（プラグイン不要）。無料枠あり、ChatGPT Plus アカウント連携で日次リクエスト上限を回避
- 対応モデル: GPT-5 / GPT-4.1、そして **Claude Sonnet 4**（2025年8月の Beta 7 で追加）
- BYOK（自前 API キー）で任意プロバイダを追加可能。プロバイダは複数登録でき、コーディングアシスタント内でトグル切替
- **Ollama / LM Studio** 経由で Mac 上のローカルモデルも利用可能

## Xcode 26.3 — Agentic Coding（2026年2月）

単なるチャット補完から **自律エージェント** へ踏み込んだリリース。2026年2月、Developer Program 向けに RC 提供後に正式公開。

- 対応エージェント: **Anthropic Claude Agent** と **OpenAI Codex**
- エージェントが開発ライフサイクル全体に関与: タスク分解、プロジェクトアーキテクチャに基づく意思決定、組み込みツールの使用
- 具体的な振る舞い:
  - ドキュメント検索
  - ファイル構造の探索
  - プロジェクト設定の更新
  - **Xcode Previews をキャプチャして視覚的に成果を検証**
  - ビルド→修正の反復ループ
- **Model Context Protocol (MCP)** という開放標準に対応 → 他の互換エージェント／ツールも Xcode に接続可能

## 実用上の勘所

AI アシスタントは **小さく局所的なタスク**（単一ファイル内の補完・説明・リファクタ）で最も機能する。複数ファイル・複数の型・アプリの複数レイヤにまたがる変更では精度が落ちる。プロンプトを絞り、スコープを閉じるほど結果が安定する。

## 関連

- [[app-release-flow|App Release Flow]] — ゼロから公開までの全体フロー地図
- [[app-delivery|App Delivery]] — ビルド→署名→アップロード→配布の工程（Xcode Cloud / fastlane / TestFlight）
- [[app-store|App Store]] — Xcode でビルド・提出したアプリの配信先。2026年は手数料体系が地域別に分岐
- [[app-store-review|App Store Review]] — 提出後に通る審査ゲート
- [[metal]] — 同じ Apple 開発スタックの低レベルグラフィックス API
- [[android-studio|Android Studio]] — Android 側の対応 IDE
- MCP は Anthropic 発の開放標準。Claude Code など他のエージェント環境とも共通基盤

## Links

- [Xcode 26.3 unlocks the power of agentic coding (Apple Newsroom)](https://www.apple.com/newsroom/2026/02/xcode-26-point-3-unlocks-the-power-of-agentic-coding/)
- [Xcode 26 Release Notes (Apple Developer)](https://developer.apple.com/documentation/xcode-release-notes/xcode-26-release-notes)
- [What's new in Xcode 26 — WWDC25](https://developer.apple.com/videos/play/wwdc2025/247/)
- [Xcode 26 will support multiple AI models, like Claude (9to5Mac)](https://9to5mac.com/2025/06/10/beyond-chatgpt-xcode-26-will-support-multiple-ai-models-like-claude/)
