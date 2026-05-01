---
title: Almide Docs
tags: [almide, docs, astro, starlight]
---

[[almide|Almide]] の公式ドキュメントサイト。Astro + Starlight + astro-mermaid で構築され、`https://almide.github.io/docs` で公開される。

## Stack

| Component | 役割 |
|---|---|
| Astro 6 | 静的サイトジェネレータ |
| `@astrojs/starlight` | ドキュメント用テーマ |
| `astro-mermaid` | Mermaid ダイアグラム |
| `sharp` | OG 画像処理 |
| Shiki + `almide.tmLanguage.json` | `.almd` のコードハイライト |

`src/almide.tmLanguage.json` を Shiki に登録することで、ドキュメント中の Almide コードブロックがハイライトされる（[[vscode-almide]] と同じ grammar を流用）。

## Information Architecture

```
src/content/docs/
  getting-started/
    introduction.md
    installation.md
    hello-world.md
  guide/
    types.md / variables.md / functions.md
    control-flow.md / pattern-matching.md
    error-handling.md / generics.md
    protocols.md / modules.md / concurrency.md
  reference/
    cheatsheet.md / cli.md / grammar.md / operators.md
  stdlib/
    overview.md
    int / float / string / bytes / list / map / set
    option / result / error
    fs / io / http / json / process / env / regex
    datetime / math / matrix / random / testing / value
  design/
    philosophy.md
    architecture.mdx
```

## Edit Link

```js
editLink: {
  baseUrl: 'https://github.com/almide/almide/edit/develop/docs-site/',
}
```

実体は `almide/almide` リポジトリの `docs-site/` を参照しており、本リポジトリは静的サイトのデプロイ用。

## Commands

| Command | Action |
|---|---|
| `npm run dev` | localhost:4321 で起動 |
| `npm run build` | `./dist/` にプロダクションビルド |
| `npm run preview` | ビルドのプレビュー |

## Theming

- ExpressiveCode テーマ: `tokyo-night` / `github-light`
- カスタム CSS: `src/styles/custom.css`
- カスタムコンポーネント: `SiteTitle.astro`, `Head.astro`
- OG 画像: `/docs/og.png`

## 関連

- [[almide]] — ドキュメント対象の言語本体
- [[vscode-almide]] — 同じ TextMate grammar を共有
- [[almide-grammar]] — Shiki ハイライトのスコープ定義の上流

## Links

- [GitHub](https://github.com/almide/docs)
- [Site](https://almide.github.io/docs)
