---
title: graph-garden
tags: [developer-tools, astro, knowledge-base]
---

Markdown vault を静的なナレッジベースサイトに変換する Astro integration。双方向リンクとグラフ可視化付き。

## 機能

- `[[wikilink]]` パース・レンダリング (remark plugin)
- 双方向バックリンク（ビルド時計算）
- d3-force グラフビュー（タグ色分け、ノードサイズ、ホバープレビュー、検索）
- ローカルグラフ（各ノートページ、depth 1/2/3 hop）
- Cmd+K 検索（fuzzy match）
- タグインデックスページ
- Mermaid 図レンダリング（[[premaid]] dark テーマ）
- [[Almide]] シンタックスハイライト（カスタム TextMate grammar）
- `index.md` 自動生成
- GitHub Pages デプロイ対応
- Catppuccin Mocha ダークテーマ

## 使い方

```ts
// astro.config.ts
import graphGarden from '@o6lvl4/graph-garden';

export default defineConfig({
  integrations: [
    graphGarden({
      vault: './vault',
      title: 'My Knowledge',
    }),
  ],
});
```

これだけで全ルート・コンポーネント・スタイルが注入される。

## Architecture

Astro integration パターン（Starlight と同じ方式）:

- `injectRoute()` で全ページを注入
- Virtual module (`virtual:graph-garden/config`) でユーザー設定を配信
- ビルド時に vault をスキャンして `index.md` を自動生成
- Content collection は利用者側で定義（schema は薄い）

## 技術スタック

- **Astro 5** — SSG、content collections
- **d3-force** — グラフ物理シミュレーション
- **mermaid.js** — 図レンダリング（[[premaid]] dark テーマ）
- **Shiki** — シンタックスハイライト

## Links

- [GitHub](https://github.com/O6lvl4/graph-garden)
