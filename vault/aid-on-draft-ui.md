---
title: aid-on-draft-ui
tags: [react, ui, library, scaffold]
---

Aid-On の React UI ライブラリのドラフト版。Tailwind + Rollup + TypeScript の薄いスキャフォルド。

## 構成

- `src/Button.tsx` — Tailwind クラスを当てた最小 Button
- `src/index.ts` — `"use client"` 付きの再エクスポート
- `src/styles.css` — Tailwind 入力 CSS

ビルドは Rollup + `@rollup/plugin-typescript` + Tailwind CLI。`scripts/injectStyles.js` で生成済み CSS を JS にインライン注入する形式。`peerDependencies` は React 17/18、`nextjs.clientOnly: true` を宣言。

## [[aid-on-ui-system]] との関係

両リポジトリは `package.json` 名・バージョン・依存・ビルド構成・現状の `Button` 実装まで同一。本リポジトリは「draft（試作）」、ui-system 側が後継・本流の位置づけと思われる。

## Links

- [GitHub](https://github.com/Aid-On/aid-on-draft-ui)
