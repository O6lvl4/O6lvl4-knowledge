---
title: unillm
tags: [llm, edge, typescript, streaming, library]
---

エッジコンピューティング向けの統一 LLM インターフェース。型安全な fluent API で複数プロバイダを単一の呼び出しで扱う。[[famulus]] / [[famulus2]] が利用するプロバイダ抽象層。

## Core Idea

「LLM プロバイダ毎に SDK を持つ」のではなく、`provider:model` 文字列でプロバイダを切り替える。レスポンスは [[nagare|nagare]] の `Stream<T>` を返し、ストリーミングと reactive 操作を標準化。

- バンドル: ~50KB
- コールドスタート: ~10ms
- 依存: Zod のみ (~11KB)
- メモリ: 自動チャンキング・バックプレッシャー

## 対応プロバイダ (48 モデル)

| プロバイダ | モデル数 | 代表モデル |
|---|---|---|
| Anthropic | 8 | claude-opus-4-5, claude-haiku-4-5, claude-sonnet-4-5 |
| OpenAI | 9 | gpt-4o, gpt-4o-mini |
| Groq | 7 | llama-3.3-70b-versatile, llama-3.1-8b-instant |
| Gemini | 8 | gemini-3-pro-preview, gemini-2.5-flash |
| Cloudflare | 13 | llama-4-scout, qwen2.5-coder-32b |
| DeepSeek / Kimi | — | famulus 経由で利用 |

## 使用例

### Fluent API

```ts
import { unillm } from "@aid-on/unillm";

const response = await unillm()
  .model("openai:gpt-4o-mini")
  .credentials({ openaiApiKey: process.env.OPENAI_API_KEY })
  .temperature(0.7)
  .generate("Explain quantum computing");
```

### Streaming with [[nagare]]

```ts
import type { Stream } from "@aid-on/nagare";

const stream: Stream<string> = await unillm()
  .model("groq:llama-3.3-70b-versatile")
  .credentials({ groqApiKey: "..." })
  .stream("Write a story");

await stream
  .map(chunk => chunk.trim())
  .filter(chunk => chunk.length > 0)
  .throttle(16)
  .tap(console.log)
  .toSSE();
```

### 構造化出力 (Zod schema)

```ts
const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
  skills: z.array(z.string())
});

const result = await unillm()
  .model("groq:llama-3.1-8b-instant")
  .credentials({ groqApiKey: "..." })
  .schema(PersonSchema)
  .generate("Generate a software engineer profile");

result.object.name; // type-safe
```

### Provider Shortcuts

```ts
import { anthropic, openai, groq, gemini, cloudflare } from "@aid-on/unillm";

await anthropic.sonnet("sk-ant-...").generate("Hello");
await openai.mini("sk-...").generate("Hello");
await groq.instant("gsk_...").generate("Hello");
```

## エラーハンドリング

```ts
import { UnillmError, RateLimitError } from "@aid-on/unillm";

try {
  await unillm().model(...).generate(...);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Retry after ${error.retryAfter}ms`);
  }
}
```

## Edge Runtime

Cloudflare Workers での直接利用:

```ts
export default {
  async fetch(request, env) {
    const stream = await unillm()
      .model("cloudflare:@cf/meta/llama-3.1-8b-instruct")
      .credentials({ accountId: env.CF_ACCOUNT_ID, apiToken: env.CF_API_TOKEN })
      .stream("Hello");

    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/event-stream" }
    });
  }
};
```

## 関連

- [[nagare]] — ストリーミング基盤
- [[famulus]] / [[famulus2]] — unillm を介して 7 プロバイダ対応
- [[fractop]] / [[whenm]] / [[templex]] — unillm をバックエンドとして利用
- [[fuzztok]] — トークン推定で組み合わせ可能

## Links

- [GitHub](https://github.com/Aid-On/unillm)
- [npm](https://www.npmjs.com/package/@aid-on/unillm)
