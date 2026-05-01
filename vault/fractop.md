---
title: fractop
tags: [llm, streaming, chunking, library, typescript]
---

FractoP (Fractal Processor) — LLM のコンテキスト上限を超えるテキストを fractal に分割・並列処理・統合する。500 ページの PDF や 10,000 ファイルのコードベースを単一の fluent pipeline で処理。

## Core Idea

GPT-4 は 128K、Claude は 200K、Gemini ですら 2M で頭打ち。500 ページの PDF や百万件のレビューを直接 LLM に渡すと失敗する。FractoP は context-preserving overlap 付きでチャンク化し、並列処理し、結果をマージする。

```ts
// 失敗
await llm.process(entire500PagePDF); // Error: Context length exceeded

// 成功
await fractop()
  .withLLM(llm)
  .chunking({ size: 3000, overlap: 300 })
  .parallel(5)
  .run(entire500PagePDF);
```

## 設計方針

- **Fluent API** — チェーン可能な pipeline 構築
- **Smart Chunking** — overlap でコンテキスト保持
- **Parallel Processing** — 並列度を `.parallel(n)` で制御
- **Reliability** — timeout, retry, circuit breaker
- **[[unillm|UnillM]] 統合** — 任意のプロバイダで動作
- **Streaming** — [[nagare]] の `Stream<T>` ベース

## API

```ts
fractop<T>()
  .withLLM(fn | unillmConfig)
  .chunking({ size: 3000, overlap: 300 })
  .parallel(5)
  .retry(3, 1000)
  .timeout(30000)
  .context(asyncFn)         // 全文からグローバル文脈を生成
  .process(asyncFn)          // チャンク + 文脈で処理
  .merge(strategy | fn)      // 結果統合
  .minResults(50)
  .run(text);
```

## 使用例

### UnillM 統合

```ts
const entities = await fractop<Entity[]>()
  .withLLM({
    model: 'anthropic:claude-3-5-haiku',
    credentials: { anthropicApiKey: process.env.ANTHROPIC_API_KEY },
    messages: (chunk) => [
      { role: 'system', content: 'Extract entities as JSON.' },
      { role: 'user', content: chunk }
    ],
    transform: (response) => JSON.parse(response.text)
  })
  .run(document);
```

### Streaming with [[nagare]]

```ts
import { fractopStream } from '@aid-on/fractop';

const stream = fractopStream(largeDocument)
  .withLLM(processChunk)
  .chunking({ size: 2000, overlap: 200 })
  .parallel(3)
  .stream();

await stream
  .map(result => result.toUpperCase())
  .filter(result => result.length > 100)
  .take(10)
  .collect();
```

### Batch Processing

```ts
const results = await fractopBatch(documents)
  .withLLM(summarize)
  .chunking({ size: 2000 })
  .collectAll();
// Map<string, T[]>
```

## デフォルト設定

```ts
{
  chunkSize: 3000,
  overlapSize: 300,
  concurrency: 3,
  maxRetries: 2,
  retryDelay: 1000,
  chunkTimeout: 30000
}
```

## 性能チューニング

- **chunk size**: 2000-4000 (LLM token limit とのバランス)
- **overlap**: chunk size の 10-20%
- **concurrency**: プロバイダの rate limit に合わせて 3-5
- **streaming**: 100KB 超は `fractopStream`
- **batching**: 複数文書は `fractopBatch`

## 関連

- [[unillm]] — LLM プロバイダ抽象
- [[nagare]] — Streaming pipeline
- [[templex]] / [[iteratop]] — 同じ Aid-On *oP 系列
- [[memory-rag]] — チャンク + retrieval 軸の対比

## Links

- [GitHub](https://github.com/Aid-On/fractop)
- [npm](https://www.npmjs.com/package/@aid-on/fractop)
