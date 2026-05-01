---
title: llm-throttle
tags: [llm, rate-limit, library, typescript]
---

LLM API 専用の高精度デュアルレートリミッタ。RPM (Requests Per Minute) と TPM (Tokens Per Minute) を同時に制御する。Token Bucket アルゴリズム + 推定 → 実消費の事後調整。

## Core Idea

LLM API は「リクエスト数」と「トークン数」の二軸で制限される。汎用レートリミッタは前者しか見ないため、TPM 上限で 429 を食らう。`@aid-on/llm-throttle` は両方を同時に管理し、実トークン消費に基づいて事後調整する。

## Features

- **Dual Rate Limiting** — RPM + TPM を同時管理
- **Token Bucket** — burst を許容したスムーズなレート制御
- **Real-time Adjustment** — 推定 → 実消費の事後調整
- **Detailed Metrics** — 使用率と推定精度の可視化
- **Zero Dependencies** — 軽量

## 使用例

### Basic

```ts
import { LLMThrottle } from '@aid-on/llm-throttle';

const limiter = new LLMThrottle({
  rpm: 60,
  tpm: 10000
});

const requestId = 'unique-request-id';
const estimatedTokens = 1500;

if (limiter.consume(requestId, estimatedTokens)) {
  const response = await callLLMAPI();

  // 実トークン数で事後調整
  const actualTokens = response.usage.total_tokens;
  limiter.adjustConsumption(requestId, actualTokens);
}
```

### Burst Limit

```ts
const limiter = new LLMThrottle({
  rpm: 60,
  tpm: 10000,
  burstRPM: 120,    // 短時間バーストで 120 RPM まで
  burstTPM: 20000
});
```

### Pre-check

```ts
const check = limiter.canProcess(estimatedTokens);

if (check.allowed) {
  limiter.consume(requestId, estimatedTokens);
} else {
  console.log(`reason: ${check.reason}`);     // 'rpm_limit' | 'tpm_limit'
  console.log(`available in: ${check.availableIn}ms`);
}
```

### Metrics

```ts
const metrics = limiter.getMetrics();
metrics.rpm.percentage;
metrics.tpm.percentage;
metrics.consumptionHistory.averageTokensPerRequest;
metrics.efficiency;  // 推定精度
```

## API

```ts
class LLMThrottle {
  canProcess(estimatedTokens: number): RateLimitCheckResult;
  consume(requestId: string, estimatedTokens: number, metadata?: object): boolean;
  consumeOrThrow(requestId: string, estimatedTokens: number): void;
  adjustConsumption(requestId: string, actualTokens: number): void;
  getMetrics(): RateLimitMetrics;
  getConsumptionHistory(): ConsumptionRecord[];
  reset(): void;
  setHistoryRetention(ms: number): void;
}
```

## Multi-service 統合

```ts
class APIManager {
  private limiters = new Map<string, LLMThrottle>();

  constructor() {
    this.limiters.set('openai', new LLMThrottle({ rpm: 500, tpm: 10000 }));
    this.limiters.set('anthropic', new LLMThrottle({ rpm: 1000, tpm: 20000 }));
  }

  async callAPI(service: string, requestId: string, estimatedTokens: number) {
    const limiter = this.limiters.get(service);
    if (!limiter.canProcess(estimatedTokens).allowed) {
      throw new RateLimitError(...);
    }
    limiter.consume(requestId, estimatedTokens);
  }
}
```

## 関連

- [[llm-queue-dispatcher]] — このライブラリと密結合。レート制限を考慮したキューイング
- [[fuzztok]] — `estimatedTokens` の算出に利用可能
- [[unillm]] — LLM 呼び出し本体

## Links

- [GitHub](https://github.com/Aid-On/llm-throttle)
- [npm](https://www.npmjs.com/package/@aid-on/llm-throttle)
