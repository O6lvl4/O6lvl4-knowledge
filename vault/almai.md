---
title: almai
tags: [almide, ai, llm]
created_at: 2026-05-01
updated_at: 2026-05-18
---

[[almide|Almide]] 用のマルチプロバイダー LLM クライアント。Almide で純粋実装（外部 SDK 依存なし）。

## 対応プロバイダー (8)

Anthropic, OpenAI, OpenRouter, Groq, Cloudflare Workers AI, Azure OpenAI, Google Gemini, AWS Bedrock

各プロバイダーは `http.request` で REST API を直接呼び出す。

## 機能

- Tool Calling / JSON Mode
- 会話ビルダー
- Options ビルダー（max_tokens, temperature, top_p, system prompt, stop sequences）
- 指数バックオフによるリトライ（429/5xx）

## 構成

```
src/
  mod.almd              // 公開 API、型定義
  tools.almd            // Tool calling、JSON Schema ヘルパー
  conv.almd             // 会話ビルダー
  providers/
    anthropic.almd      // Anthropic Messages API
    openai.almd         // OpenAI / OpenRouter（互換）
    google.almd         // Google Gemini
    azure.almd          // Azure OpenAI
    cloudflare.almd     // Cloudflare Workers AI
    bedrock.almd        // AWS Bedrock
    cli.almd            // Claude Code / Codex CLI
```

## 関連

- [[homullus]] — almai を利用する AI エージェント
