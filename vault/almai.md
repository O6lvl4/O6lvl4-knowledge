---
title: almai
tags: [almide, llm, client, library]
---

[[almide|Almide]] 用のマルチプロバイダ LLM クライアント。一つのインターフェースで全プロバイダ（Anthropic / OpenAI / OpenRouter / Cloudflare Workers AI / Azure / Google / Claude Code CLI / Codex CLI）を扱う。

## TS 版 [[unillm]] との関係

[[unillm|@aid-on/unillm]] が TypeScript で実現している統一プロバイダ・インタフェースの Almide 版。設計思想は同じ:「`provider/model` プレフィックスでルーティング、各プロバイダは REST API を直接叩く Pure 実装、外部 SDK 依存ゼロ」。

## Quick start

```almide
import almai

effect fn main() -> Unit = {
  let r = almai.call("anthropic/claude-sonnet-4-6", [
    almai.system("You are helpful."),
    almai.user("What is 2+2?"),
  ])!
  println(r.content)
}
```

## プロバイダ

| Prefix | Provider | Env vars |
|---|---|---|
| `anthropic/` | Anthropic Messages API | `ANTHROPIC_API_KEY` |
| `openai/` | OpenAI Chat Completions | `OPENAI_API_KEY` |
| `openrouter/` | OpenRouter (100+ models) | `OPENROUTER_API_KEY` |
| `cf/` | Cloudflare Workers AI | `CF_ACCOUNT_ID`, `CLOUDFLARE_API_KEY` |
| `azure/` | Azure OpenAI | `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` |
| `google/` | Google Gemini | `GOOGLE_API_KEY` |
| `cli/claude` | Claude Code CLI | (authenticated CLI) |
| `cli/codex` | Codex CLI | (authenticated CLI) |

## Options / JSON mode / Tools

```almide
let opts = almai.defaults()
  |> almai.with_max_tokens(8192)
  |> almai.with_temperature(0.7)
  |> almai.with_system("You are a code reviewer.")
  |> almai.with_json_mode
  |> almai.with_tools([weather_tool])

let r = almai.call_with("openai/gpt-4o", msgs, opts)!
```

`almai.has_tool_calls(r)` / `almai.first_tool_call(r)` で tool call を取り出す。

## Conversation builder

```almide
import almai.conv

let c = conv.empty()
  |> conv.add_system("You are a math tutor.")
  |> conv.add_user("What is a derivative?")
  |> conv.add_assistant("...")
  |> conv.add_user("Example?")

let r = almai.call("anthropic/claude-sonnet-4-6", conv.messages(c))!
```

## Retry

`almai.call_retry(model, msgs, opts, max_attempts)` で 429 / 5xx / connection error を指数バックオフで再試行。auth / malformed-request はそのまま伝播。

## Architecture

```
src/
  mod.almd              Public API, types, dispatch
  tools.almd            Tool calling types + JSON Schema helpers
  conv.almd             Conversation builder
  providers/
    openai.almd         OpenAI / OpenRouter (OpenAI-compatible)
    anthropic.almd      Anthropic Messages API
    cloudflare.almd     Cloudflare Workers AI
    azure.almd          Azure OpenAI
    google.almd         Google Gemini
    cli.almd            Claude Code / Codex CLI
```

すべて Pure Almide。SDK 依存なし、各プロバイダは `http.request` で直接 REST を叩く。

## 関連

- [[almide]] — 言語本体
- [[unillm]] — TS 版（同じ思想、別言語実装）
- [[bonsai-almide]] — 同じ Almide エコシステム上の LLM 案件 (こちらは推論側)

## Links

- [GitHub](https://github.com/almide/almai)
