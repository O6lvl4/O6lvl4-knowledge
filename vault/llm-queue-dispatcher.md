---
title: llm-queue-dispatcher
tags: [llm, queue, scheduler, library, typescript]
---

LLM リクエスト用のインテリジェントキュー。優先度・トークン効率・待機時間・リトライ回数・トークンフィット・処理時間の多次元スコアリングで、レート制限下でも最適な順序を選ぶ。[[llm-throttle]] と密結合。

## Core Idea

「キューに溜まった LLM リクエストをどの順で処理するか」を多変量で最適化。FIFO や単純な priority queue ではなく、現在のレート残量も考慮して「今、最も処理すべきリクエスト」を選ぶ。

## スコアリング軸

| 軸 | 意味 |
|---|---|
| priority | URGENT / HIGH / NORMAL / LOW |
| efficiency | トークン使用効率 |
| waitTime | 待機時間 (古いリクエスト優先) |
| retry | リトライ回数 |
| tokenFit | 残レート枠との適合度 |
| processingTime | 期待処理時間 |

カスタム scorer も追加可能。

## 使用例

### Basic

```ts
import { createInMemoryLLMQueueDispatcher, Priority } from '@aid-on/llm-queue-dispatcher';
import { createLLMThrottle } from '@aid-on/llm-throttle';

const queue = createInMemoryLLMQueueDispatcher();
const rateLimiter = createLLMThrottle({ rpm: 60, tpm: 10000 });

await queue.enqueue({
  id: 'req-1',
  payload: { prompt: 'Hello, world!' },
  priority: Priority.HIGH,
  tokenInfo: { estimated: 150 },
  createdAt: new Date()
});

const processable = await queue.dequeue(rateLimiter);
if (processable) {
  try {
    const result = await processLLMRequest(processable.message.payload);
    await processable.markAsProcessed();
  } catch (error) {
    await processable.markAsFailed(error);
  }
}
```

### Custom Scoring

```ts
const queue = createLLMQueueDispatcher(storage, {
  scoring: {
    weights: {
      priority: 0.3,
      efficiency: 0.25,
      waitTime: 0.25,
      retry: 0.1,
      tokenFit: 0.1,
      processingTime: 0.0
    },
    customScorers: [{
      name: 'deadline',
      weight: 0.2,
      calculate: (message, context) => {
        const deadline = message.payload.metadata?.deadline as number;
        if (!deadline) return 0.5;
        const timeLeft = deadline - context.currentTime;
        return Math.max(0, Math.min(1, timeLeft / 3600000));
      }
    }]
  }
});
```

## Storage Adapter

ストレージは pluggable。in-memory がデフォルトで、SQS / Redis / DB 等を実装可能。

```ts
class RedisStorage implements QueueStorageAdapter<LLMRequest> {
  async enqueue(message) { /* Redis LPUSH */ }
  async dequeue(limit, visibilityTimeout) { /* visibility timeout */ }
  // ...
}

const queue = createLLMQueueDispatcher(new RedisStorage(redis), {
  enablePrefetch: true,
  bufferSize: 100
});
```

## Factory プリセット

| Factory | 用途 |
|---|---|
| `createInMemoryQueue` | テスト・開発 |
| `createPrefetchingQueue` | 高スループット |
| `createSimplePriorityQueue` | 純粋な priority |
| `createThroughputOptimizedQueue` | TPM 効率最大化 |
| `createFairQueue` | FIFO 寄りの公平性 |

## Configuration

```ts
{
  bufferSize: 50,
  enablePrefetch: false,
  prefetchInterval: 5000,
  maxCandidatesToEvaluate: 20,
  minScoreThreshold: 0.1,
  scoring: { ... },
  metricsRetentionMs: number,
  logger: Logger
}
```

## エラーハンドリング

```ts
const processable = await queue.dequeue(rateLimiter);
if (processable) {
  try {
    await processLLMRequest(processable.message.payload);
    await processable.markAsProcessed();
  } catch (error) {
    if (error.code === 'RATE_LIMITED') {
      await processable.updateVisibility(300);  // 5 分後に再試行
    } else {
      await processable.markAsFailed(error);
    }
  }
}
```

## Metrics

```ts
const metrics = await queue.getQueueMetrics();
metrics.queue.totalMessages;
metrics.processing.activeRequests;
metrics.queue.throughput.messagesPerMinute;
metrics.performance.bufferUtilization;
```

## 関連

- [[llm-throttle]] — `dequeue(rateLimiter)` で必須の連携
- [[unillm]] — payload で渡される LLM 呼び出し本体
- [[fuzztok]] — トークン推定で `tokenInfo.estimated` を埋める

## Links

- [GitHub](https://github.com/Aid-On/llm-queue-dispatcher)
- [Demo](https://aid-on.github.io/llm-queue-dispatcher/)
- [npm](https://www.npmjs.com/package/@aid-on/llm-queue-dispatcher)
