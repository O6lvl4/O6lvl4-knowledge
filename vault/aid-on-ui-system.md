---
title: aid-on-ui-system
tags: [react, ui, library, design-system]
---

Aid-On の React UI コンポーネントライブラリ。Tailwind + Rollup + TypeScript ベース。

## 構成

- `src/Button.tsx` — Tailwind ユーティリティで構築した Button
- `src/index.ts` — `"use client"` ディレクティブ付きエクスポート
- `dist/` — ビルド済み `.cjs.js` / `.js` / `.d.ts` を配布

ビルドフロー: TypeScript コンパイル → Tailwind CLI で CSS minify → Rollup でバンドル → `scripts/injectStyles.js` でスタイルを JS にインジェクション。`nextjs.clientOnly: true` を `package.json` に宣言し Next.js の RSC 環境で扱える。

## [[aid-on-draft-ui]] との関係

draft-ui は同等のスキャフォルド（package 名・バージョン・実装も一致）。本リポジトリが Aid-On UI ライブラリの本系統で、draft-ui は試作リポジトリの位置づけ。

## Links

- [GitHub](https://github.com/Aid-On/aid-on-ui-system)
