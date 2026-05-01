---
title: Sandboxes & Experiments
tags: [sandbox, experiment, learning]
---

学習・検証目的で作られた小規模リポジトリ群。新しいフレームワーク、言語、ライブラリを試す場として運用している。

## TypeScript / Next.js / React

### sandbox-next-firebase-app-hosting-line-auth
Next.js 14 App Router で LINE OAuth (NextAuth.js) を実装し、Firebase Hosting にデプロイする学習用リファレンス。インフラは CDKTF (TypeScript) で管理。
https://github.com/O6lvl4/sandbox-next-firebase-app-hosting-line-auth

### sandbox-next-ts-gh-page
`create-next-app` で生成した Next.js を GitHub Pages へデプロイする検証用 sandbox。
https://github.com/O6lvl4/sandbox-next-ts-gh-page

### sandbox-next-ghpage
Next.js (TypeScript) を `output: 'standalone'` + `basePath` 設定で GitHub Pages にデプロイする手順検証ノート。
https://github.com/O6lvl4/sandbox-next-ghpage

### ts-tsnode-sandbox
TypeScript + ts-node で Node.js アプリを直接実行する手法を試した学習用 sandbox。CLI 例、環境変数、デバッグ設定など。
https://github.com/O6lvl4/ts-tsnode-sandbox

### ts-react-tailwindcss-sandbox
React + Tailwind CSS のレスポンシブブレイクポイント検証用 demo。グリッドレイアウトとユーティリティクラスの挙動確認。
https://github.com/O6lvl4/ts-react-tailwindcss-sandbox

### tz-clocks
Create React App ベースの世界時計デモ。タイムゾーン処理の練習用。
https://github.com/O6lvl4/tz-clocks

### zod-to-markdown
Zod スキーマを Markdown ドキュメントに変換するユーティリティ関数。npm パッケージ化されている小規模ライブラリ。
https://github.com/O6lvl4/zod-to-markdown

### langchain-translate-chain
`@langchain/core` を使った翻訳 chain の最小実装 sandbox。TypeScript。
https://github.com/O6lvl4/langchain-translate-chain

### mastra-sandbox
Mastra (`@mastra/core`) と `@ai-sdk/google` を使ったエージェント/ワークフロー構築の試作。Zod でスキーマ定義。
https://github.com/O6lvl4/mastra-sandbox

### tyrano-sandbox
TyranoScript Studio (Electron) ベースのノベルゲーム制作環境を触った sandbox。
https://github.com/O6lvl4/tyrano-sandbox

## Go

### sandbox-golang-cli
Cobra (`spf13/cobra`) で CLI アプリを組み立てる学習用 sandbox。`cobra-cli init` から始まる雛形。
https://github.com/O6lvl4/sandbox-golang-cli

### sandbox-langchaingo
`langchaingo` を使った LLM チェーン実装の試作リポジトリ。
https://github.com/O6lvl4/sandbox-langchaingo

### golang-cp-solve-sandbox
競技プログラミング (CP) の解答を Go で書くための雛形。`bufio` ベースの IO リーダーを用意。
https://github.com/O6lvl4/golang-cp-solve-sandbox

### golang-lib-vecty-sandbox
Go の WebAssembly UI ライブラリ `hexops/vecty` を試した sandbox。Tailwind CSS と組み合わせた flex レイアウトを検証。
https://github.com/O6lvl4/golang-lib-vecty-sandbox

### golang-lib-lo-sandbox
Lodash 風の Go ユーティリティライブラリ `samber/lo` の関数 (FlatMap など) を試した sandbox。
https://github.com/O6lvl4/golang-lib-lo-sandbox

## Game / Minecraft / CC:Tweaked

### ebitengine-sandbox
Ebitengine v2 で Hello World ウィンドウを表示する Go ゲームエンジン sandbox。モバイル向け構成も含む。
https://github.com/O6lvl4/ebitengine-sandbox

### mineflayer-builder
PrismarineJS の `prismarine-builder` をベースにした Minecraft schematic 自動建築ライブラリの実験。Mineflayer bot で実行。
https://github.com/O6lvl4/mineflayer-builder

### cct-fennel-sandbox
CC:Tweaked (Minecraft mod) 向け Fennel プロジェクトテンプレート。Fennel コードを単一の Lua ファイルにコンパイルして実行。
https://github.com/O6lvl4/cct-fennel-sandbox

### cctweaked-fennel-landfill
CC:Tweaked のエンダータートル用自動埋め立て・整地システム。Fennel と純 Lua の 2 系統で実装。
https://github.com/O6lvl4/cctweaked-fennel-landfill

### craftsman
Minecraft サーバー管理 CLI。TypeScript + Ink で対話的 UI、Docker 版 itzg/minecraft-server を Pak 単位で冪等的に起動・停止・バックアップ。
https://github.com/O6lvl4/craftsman

## Mobile

### react-native-ts-boilerplate
React Native 0.67 + TypeScript の最小ボイラープレート。
https://github.com/O6lvl4/react-native-ts-boilerplate

### stock-counter-app
Flutter の在庫カウンタアプリ雛形。Flutter 入門用。
https://github.com/O6lvl4/stock-counter-app

## Cloud / AWS / GCP

### sandbox-gcp
Terraform + GCP のサービスアカウント設定からインフラ構築までの手順をまとめた学習用リポジトリ。
https://github.com/O6lvl4/sandbox-gcp

### aws-py-s3-sandbox
AWS SAM + Python Lambda + S3 の serverless サンプル。`template.yaml` でリソース定義。
https://github.com/O6lvl4/aws-py-s3-sandbox

### sam-swagger-api-sandbox
AWS SAM と OpenAPI (Swagger) を組み合わせた API 構築 sandbox。
https://github.com/O6lvl4/sam-swagger-api-sandbox

### line-bot-sandbox
AWS SAM + Go Lambda で LINE Bot を構築する雛形。
https://github.com/O6lvl4/line-bot-sandbox

### line-bot-private
`line-bot-sandbox` のプライベート派生。SAM + Go Lambda 構成。
https://github.com/O6lvl4/line-bot-private

## CLI / Tools

### sandbox-discord-bot
Discord Bot 実装の学習用 sandbox（スタブ）。
https://github.com/O6lvl4/sandbox-discord-bot

### sandbox-chatgpt-talk
ChatGPT との対話を試すための sandbox（スタブ）。
https://github.com/O6lvl4/sandbox-chatgpt-talk

### rust-cli-sandbox
Rust + `clap` (derive) で CLI を作る学習用 sandbox。
https://github.com/O6lvl4/rust-cli-sandbox

### cdev
Claude Code の bypass permissions を活用した自律的プロジェクト構築 CLI。プロジェクトを自然言語で記述すると雛形を生成。
https://github.com/O6lvl4/cdev

## Links

- [[index|Index]]
- [[training-repos|Training Repositories]]
- [[agentic-coding|Agentic Coding]]
