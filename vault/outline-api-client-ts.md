---
title: outline-api-client-ts
tags: [typescript, library, api-client, knowledge-base]
---

[Outline](https://www.getoutline.com/) ナレッジベース API の TypeScript クライアント。Document / Collection / Auth を型安全に操作、自動リトライ + async iterator 付き。

## Quick Start

```typescript
import { createOutlineClient } from 'outline-api-client';

const client = createOutlineClient('your-api-key');

const documents = await client.documents.list({ limit: 10 });
const results = await client.documents.search('API design');

const newDoc = await client.documents.create({
  title: 'New Document',
  text: '# Content\n\nDocument content here',
  collectionId: 'collection-id',
  publish: true
});
```

## Client 設定

```typescript
import { OutlineClient } from 'outline-api-client';

const client = new OutlineClient({
  apiKey: 'your-api-key',
  apiUrl: 'https://app.getoutline.com/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
});
```

## Documents API

```typescript
client.documents.list({ collectionId, limit, offset, sort, direction });
client.documents.info('document-id');
client.documents.search('query', { collectionId, includeArchived, includeDrafts, limit });
client.documents.create({ title, text, collectionId, parentDocumentId, publish });
client.documents.update('document-id', { title, text, publish });
client.documents.delete('document-id', permanent);
client.documents.export('document-id', 'markdown'); // markdown | html | pdf
```

## Collections API

```typescript
client.collections.list();
client.collections.info('collection-id');
client.collections.create({ name, description, color, permission });
client.collections.documents('collection-id', { limit, offset });
```

## Auth API

```typescript
const authInfo = await client.auth.info();
authInfo.data?.user;
authInfo.data?.team;
```

## Async Iterator

```typescript
for await (const doc of client.documents.iterate()) {
  console.log(doc.title);
}

for await (const doc of client.documents.iterate({ collectionId: 'id' })) {
  console.log(doc.title);
}
```

## Error Handling

```typescript
import { OutlineAPIError } from 'outline-api-client';

try {
  const doc = await client.documents.info('invalid-id');
} catch (error) {
  if (error instanceof OutlineAPIError) {
    if (error.isNotFoundError())  { /* ... */ }
    if (error.isAuthError())      { /* ... */ }
    if (error.isRateLimitError()) { /* ... */ }
  }
}
```

## Browser 利用について

主に Node.js 向け。Outline SaaS（app.getoutline.com）は CORS 制限により直接ブラウザから叩けないため、Backend proxy / SSR (Next.js) / 自前 backend のいずれかが必要。

## Links

- [GitHub](https://github.com/Aid-On/outline-api-client-ts)
