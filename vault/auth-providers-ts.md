---
title: auth-providers-ts
tags: [auth, oauth, line, library, framework-agnostic]
---

フレームワーク非依存な OAuth 2.0 プロバイダライブラリ（`@aid-on/auth-providers`）。Cloud Functions、Edge、Next.js API Routes、Express など任意の TS/JS 環境で使える。

## 想定環境

- GCP Cloud Functions / AWS Lambda
- Vercel Edge Functions / Cloudflare Workers
- Next.js API Routes
- Express / Fastify
- クライアントサイド（適切なセキュリティ対策込み）

## 使い方

ハンドラ生成型:

```typescript
import { createLineAuthHandler } from '@aid-on/auth-providers/line'

const lineAuth = createLineAuthHandler({
  clientId, clientSecret, redirectUri
})

const { authUrl, state } = lineAuth.startAuth()
const { user, tokens } = await lineAuth.handleCallback({ code, state, expectedState })
```

低レベルクライアント:

```typescript
const client = new LineAuthClient({ clientId, clientSecret, redirectUri })
const authUrl = client.getAuthorizationUrl({ state: client.generateState() })
const tokens  = await client.getAccessToken(code)
const user    = await client.getUserProfile(tokens.access_token)
const newTok  = await client.refreshAccessToken(tokens.refresh_token)
await client.revokeAccessToken(tokens.access_token)
```

## 機能

LINE Login OAuth 2.0 を完全実装:

- 認可 URL 生成 / state パラメータ生成（CSRF 対策）
- code → token 交換
- ユーザープロフィール取得
- トークンリフレッシュ
- トークン失効

## [[next-auth-providers]] との関係

next-auth-providers は NextAuth.js プロバイダ規約に従うラッパー。本リポジトリは NextAuth に縛られない **下位レイヤ** の OAuth 実装で、同じ LINE 連携を Cloud Functions や Edge ランタイムで使うときの選択肢になる。

## Links

- [GitHub](https://github.com/Aid-On/auth-providers-ts)
