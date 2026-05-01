---
title: next-auth-providers
tags: [auth, nextauth, oauth, line, library]
---

NextAuth.js 向けの追加プロバイダ集（`@aid-on/nextauth-providers`）。現状は LINE Login OAuth 2.0 をフルサポート。

## 使い方

```typescript
import NextAuth from "next-auth"
import { LineProvider } from "@aid-on/nextauth-providers"

export default NextAuth({
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
  ],
})
```

コールバック URL: `https://your-domain.com/api/auth/callback/line`

## 機能

- LINE Login OAuth 2.0 対応
- ユーザープロフィール取得（ID、表示名、プロフィール画像）
- NextAuth.js v4+ 互換
- TypeScript 型定義同梱

## [[auth-providers-ts]] との関係

next-auth-providers は **NextAuth.js のプロバイダ規約** に合わせたアダプタ。一方 [[auth-providers-ts]] は NextAuth に依存しない **フレームワーク非依存** な OAuth クライアント実装で、Cloud Functions / Edge / Express など任意の環境で使える。同じ LINE 連携でもターゲット層が異なる。

## Links

- [GitHub](https://github.com/Aid-On/next-auth-providers)
