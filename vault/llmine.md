---
title: llmine
tags: [cli, llm, typescript, ink]
---

OpenAI / Azure OpenAI / Anthropic / AWS Bedrock / Ollama を 1 つのコマンドで叩く CLI。Ink + React 製のインタラクティブ UI。

## Core Idea

ターミナルから複数 LLM プロバイダを統一インタフェースで使う。プロファイル機構で provider × model × temperature を組として管理し、`llmine model use <name>` で切替。pipe 入力対応で `git diff | llmine "Suggest a commit message"` のような使い方ができる。

## CLI

```bash
npm install -g llmine

# Provider 設定（対話）
llmine provider add openai
llmine provider add azure
llmine provider add anthropic
llmine provider add bedrock
llmine provider add ollama

# Model profile 管理
llmine model add               # provider 選択 → モデル取得 → temperature → 有効化
llmine model list
llmine model use openai-dev
llmine model show
llmine model rm openai-dev

# プロンプト送信
llmine "What is the meaning of life?"
llmine "List all US presidents" --model gpt-3.5-turbo --temperature 0.5 --provider openai

# 予約語回避
llmine -- models                       # "models" を プロンプトとして送る

# Pipe 入力
cat sample_prompt.txt | llmine
git diff | llmine "Suggest a commit message"
cat app.js | llmine "Review this code"
tail -n 100 error.log | llmine "Analyze error causes"

# ストリーミング
llmine "Write a detailed essay" --stream

# システムプロンプト
llmine "Explain quantum computing" --system "You are a physics professor"

# 言語切替
llmine lang set ja
llmine lang set en
```

## 対応プロバイダ

| Provider | 認証 | 備考 |
|---|---|---|
| OpenAI | API Key | |
| Azure OpenAI | Resource + Key + Deployment + Version | |
| Anthropic (Claude) | API Key | |
| AWS Bedrock | Region + (Access/Secret or IAM) | |
| Ollama | host (default `http://localhost:11434`) | ローカル LLM |

設定は `~/.llmine/config.json` に永続化。

## Architecture

```
src/
├── core/
│   ├── aiClient.ts         統一 AI クライアント
│   ├── config.ts           設定管理
│   ├── modelRegistry.ts    プロファイルレジストリ
│   └── providers.ts        プロバイダ実装
├── cli/                    Ink + React の UI
│   ├── app.tsx
│   ├── main.tsx
│   ├── parseArgs.ts
│   └── screens/
└── utils/
    └── banner.ts
```

## Links

- [GitHub](https://github.com/O6lvl4/llmine)
