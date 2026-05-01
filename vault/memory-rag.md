---
title: memory-rag
tags: [llm, rag, vector-store, library, typescript]
---

軽量・provider-agnostic な in-memory RAG ライブラリ。Vercel AI SDK ネイティブで、外部ベクタ DB 不要、エッジで動く。

## Core Idea

RAG をやるのに Pinecone も Weaviate も要らないケースに最適化。ドキュメント数が中規模 (<10K) で、セッションごとに独立した知識を持ちたい場合、外部依存ゼロで完結。

## Features

- In-Memory Vector Store — 設定不要の similarity search
- Multi-Provider — OpenAI, Anthropic, Google, Cohere (Vercel AI SDK 経由)
- Session 分離 — user/session 単位で独立した知識ベース
- Smart Chunking — size + overlap 自動分割
- Streaming + Tool 対応 — Vercel AI SDK ネイティブ
- Edge Ready — serverless / edge runtime で動作

## 使用例

### Quick Start

```ts
import { createSimpleRAG } from '@aid-on/memory-rag';

const rag = createSimpleRAG();

await rag.addDocument('RAG combines retrieval and generation.');
await rag.addDocument('Vector embeddings capture semantic meaning.');

const response = await rag.search('What is RAG?', 3);
console.log(response.answer);
```

### プロバイダの混在

```ts
import { InMemoryVectorStore, RAGService } from '@aid-on/memory-rag';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

const store = new InMemoryVectorStore(openai.embedding('text-embedding-3-large'));
const service = new RAGService(anthropic('claude-3-haiku-20240307'));

await store.addDocument('Advanced RAG techniques include hybrid search.', {
  source: 'docs', topic: 'rag-advanced'
});

const results = await service.search(store, 'advanced RAG', 5, true);
```

### Session 分離

```ts
import { getStore, RAGService } from '@aid-on/memory-rag';

const userStore = getStore('user-123');
const adminStore = getStore('admin-456');

await userStore.addDocument('User dashboard shows personal metrics.');
await adminStore.addDocument('Admin panel includes system monitoring.');

const service = new RAGService();
const userResults = await service.search(userStore, 'dashboard');
// user-store の結果のみ
```

### Streaming RAG

```ts
import { streamRAGResponse } from '@aid-on/memory-rag';

const stream = await streamRAGResponse({
  messages: [{ role: 'user', content: 'Explain vector embeddings' }],
  sessionId: 'user-123',
  enableRAG: true,
  topK: 3,
  model: 'gpt-4o-mini',
  temperature: 0.7
});

return new Response(stream);
```

### RAG as AI Tool

```ts
import { createRAGTool } from '@aid-on/memory-rag';
import { generateText } from 'ai';

const ragTool = createRAGTool('session-123');

await generateText({
  model: openai('gpt-4'),
  tools: {
    searchKnowledge: ragTool.search,
    addKnowledge: ragTool.add
  },
  prompt: 'Help me understand our documentation'
});
```

## Configuration

```ts
createInMemoryRAG({
  llmProvider: 'openai',
  embeddingProvider: 'openai',
  llmModel: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  config: {
    vectorStore: {
      maxDocuments: 1000,
      chunkSize: 500,
      chunkOverlap: 50
    },
    search: {
      defaultTopK: 5,
      minScore: 0.5
    }
  }
});
```

## Architecture

```
@aid-on/memory-rag
├── types/          TypeScript 型
├── providers/      provider 抽象 + Vercel AI SDK adapter
├── stores/         in-memory.ts
├── services/       rag-service + store-manager (session)
└── integrations/   vercel-ai.ts (tool integration)
```

## 性能

- Embedding: ~50ms/doc
- Search: <10ms (1000 documents)
- Memory: ~1MB/100 docs
- Cold start: ゼロ

## 対比

- **[[whenm]]** — 時系列特化、Prolog ベース、状態変化追跡
- **memory-rag** — 静的な知識ベース、エッジ稼働、Vercel AI SDK 統合

## 関連

- [[whenm]] — temporal memory との対比
- [[fractop]] — チャンク + 並列の対比 (memory-rag は retrieval、fractop は process)

## Links

- [GitHub](https://github.com/Aid-On/memory-rag)
- [npm](https://www.npmjs.com/package/@aid-on/memory-rag)
