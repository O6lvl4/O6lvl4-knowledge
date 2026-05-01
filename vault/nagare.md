---
title: nagare
tags: [streaming, edge, typescript, reactive, library]
---

「流れ」をエッジで一級市民にする stream プリミティブ。`Stream<T>` は ReadableStream<T> そのものであり、reactive オペレータを直接持つ。

## Core Idea

Observable でも Promise でもなく、Web Streams API の `ReadableStream` を基本単位として扱う。ラッパーオブジェクトを介さずネイティブ性能を保ったまま、`map` / `filter` / `throttle` などの reactive 操作を提供。

```ts
const nagareStream = stream.from(readableStream); // ゼロオーバーヘッド
nagareStream instanceof ReadableStream; // true
```

## 設計方針

1. **Stream is the primitive** — Observable や Promise を新たに導入しない
2. **Edge-first** — Cloudflare Workers, Deno, Bun を最初から想定
3. **Zero magic** — 見た通りに動く
4. **Type safety** — TypeScript strict 完全対応
5. **Web standards** — `ReadableStream` を基盤とする

## Unique Features

### 順序保持並列処理

並列実行しながら、結果の順序を入力順に保つ。

```ts
const results = await stream
  .array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .mapAsync(async (n) => {
    await delay(Math.random() * 1000);
    return n * 2;
  }, 10) // concurrency: 10
  .collect();

// ALWAYS [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

### 自動バックプレッシャー

consumer が遅いと stream が自動で pause。メモリオーバーフローもデータロスもない。

### Cross-Platform SSE

`\r\n`, `\n`, `\r` を自動処理。Windows / Unix / Mac サーバすべてで動作。

### Dual Interface

```ts
// Reactive (pull-based)
stream.from(source).map(x => x * 2).filter(x => x > 10);

// Imperative (push-based)
stream.create((controller) => {
  controller.next(1);
  controller.next(2);
  controller.complete();
});
```

## 使用例: AI Streaming Response

```ts
export default {
  async fetch(request) {
    const aiStream = stream.create<string>((controller) => {
      const response = await ai.complete(prompt, {
        stream: true,
        onToken: (token) => controller.next(token)
      });
    });

    return aiStream
      .tap(token => metrics.record(token))
      .throttle(50)
      .toSSE()
      .toResponse({
        headers: { 'Content-Type': 'text/event-stream' }
      });
  }
};
```

## 使用例: Real-time Pipeline

```ts
const pipeline = stream
  .fromSSE('/api/market-data')
  .mapAsync(async data => {
    const [analysis, prediction] = await Promise.all([
      analyzeMarket(data),
      predictTrend(data)
    ]);
    return { ...data, analysis, prediction };
  }, 5)
  .buffer(10)
  .tap(batch => database.insert(batch))
  .debounce(100);
```

## 関連

- [[unillm]] — `unillm().stream()` は `Stream<T>` を返す
- [[fractop]] — ストリーミングチャンク処理に利用
- [[iteratop]] — `createStreamingIterator` で nagare 統合
- [[whenm]] / [[memory-rag]] — エッジ稼働の前提として活用

## Links

- [GitHub](https://github.com/Aid-On/nagare)
- [npm](https://www.npmjs.com/package/@aid-on/nagare)
