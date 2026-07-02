---
title: SPA (Single Page Application)
tags: [frontend, web, architecture]
created_at: 2026-07-03
updated_at: 2026-07-03T08:05:00+09:00
---

**最初に 1 つの HTML ドキュメントをロードし、以降のページ遷移をフルリロードなしで JS が処理する**アプリケーション構造。対義語は MPA (Multi-Page Application)。[[csr|CSR]]/[[ssr|SSR]]/[[ssg|SSG]] が「初回 HTML をいつ・どこで作るか」の軸なのに対し、**SPA は「2 ページ目以降をどう扱うか」の軸** — この 2 軸を分けて説明できるかがこのテーマの試金石（→ [[rendering-strategies]]）。

## 仕組み

遷移時にブラウザのナビゲーションを乗っ取る:

1. リンククリックを JS がインターセプト（デフォルトのページロードを `preventDefault`）
2. **History API**（`pushState`）で URL だけ書き換える
3. 必要なデータ（JSON）やコード（動的 import）だけ fetch
4. DOM を差し替える

HTML ドキュメントの再取得・再パース・JS 再実行が起きないので遷移が速く、**アプリの状態（メモリ上のオブジェクト、再生中の動画、WebSocket 接続）が遷移をまたいで生き続ける**。これが SPA の本質的な価値で、速さだけなら MPA でも追い付ける。

## CSR との関係 — 同じ思想の遷移編、でも切り離せる

CSR が「初回の画面をブラウザで描く」、SPA が「遷移後もブラウザで描き続ける」— 「**画面づくりをブラウザに任せる**」という同じ思想の前半と後半なので、古典的にセットで使われた。ただし独立した軸なので組み替えられる:

| 初回 HTML \ 遷移 | SPA（クライアント遷移） | MPA（フルリロード） |
|---|---|---|
| [[csr\|CSR]] | 古典 SPA（Create React App, Vite + React Router） | （ほぼ存在しない） |
| [[ssr\|SSR]] | Next.js / Nuxt / SvelteKit | [[rails\|Rails]], Django |
| [[ssg\|SSG]] | Gatsby | Astro（デフォルト）, Hugo |

「SPA と言えば CSR」だったのは 2010 年代前半の話。現代の主流は**初回だけ SSR/SSG で HTML を返し、hydration 後は SPA 遷移**というハイブリッド。

## 歴史

| 年 | 出来事 |
|---|---|
| 2004-05 | Gmail / Google Maps。XMLHttpRequest による「リロードしない Web アプリ」の衝撃（→ [[web2.0]]） |
| 2005 | Jesse James Garrett が **Ajax** と命名 |
| 2010-13 | Backbone, AngularJS, Ember — SPA フレームワーク第一世代 |
| 2013-15 | React / Vue。仮想 DOM で SPA 開発が主流化 |
| 2016〜 | Next.js 等、SSR ハイブリッドへの揺り戻し |
| 2023〜 | View Transitions API / Hotwire / htmx — 「MPA でもアプリ的 UX」の巻き返し |

## 代償 — ブラウザが無料でくれていたもの

MPA ならブラウザが自動でやることを、SPA は JS で再実装する必要がある:

| ブラウザの標準機能 | SPA での再実装 |
|---|---|
| URL とページの対応 | クライアントルーター |
| スクロール位置の復元 | 自前で保存・復元 |
| フォーカス管理・スクリーンリーダーへの遷移通知 | 自前（怠るとアクセシビリティが壊れる） |
| ページ破棄によるメモリ解放 | ページが長寿命化するのでリークが蓄積し得る |
| 読み込み中の表示 | 自前のローディング UI |

加えて初回バンドルが肥大しやすい。「遷移は速いが初回が重い」は SPA の宿命で、コード分割・プリフェッチで緩和する。

## 向くケース

**滞在時間が長く、操作が多く、状態を持ち続けたいアプリ**。エディタ（Figma, Google Docs）、チャット、ダッシュボード、地図。逆に、記事を 1 ページ読んで離脱するメディアで SPA を選ぶ理由はほぼ無い。

## 押さえどころ（カード化候補）

- SPA の定義 → 最初に 1 つの HTML をロードし、以降の遷移をフルリロードなしで JS が処理する構造。対義語は MPA
- SPA と CSR の関係 → 「ブラウザで描く」思想の遷移編（SPA）と初回編（CSR）。セットが古典形だが軸は独立で、現代主流は SSR/SSG + SPA のハイブリッド
- SPA 遷移の仕組み → クリックをインターセプト → History API (pushState) で URL 書き換え → データだけ fetch → DOM 差し替え
- SPA の本質的価値 → 遷移をまたいでアプリの状態（メモリ・接続・再生）が生き続けること。速さだけなら MPA でも追い付ける
- SPA が再実装を強いられるもの → ルーティング、スクロール復元、フォーカス管理、メモリ解放 — MPA ならブラウザが無料でやること
- SPA の起源 → 2004-05 の Gmail / Google Maps（Ajax）。フレームワークとしては Backbone / AngularJS（2010〜）

## Links

- [History API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Rendering on the Web — web.dev](https://web.dev/articles/rendering-on-the-web)

## 関連

- [[rendering-strategies]] — SPA と直交する「初回 HTML」の軸を整理する親ノート
- [[rendering-phases]] — 初学者向けのフェーズ全体図（SPA 遷移の図もある）
- [[csr]] — 同じ「ブラウザで描く」思想の初回編。古典 SPA の相棒
- [[ssr]] — 現代 SPA の初回表示を担うハイブリッドの相方
- [[web2.0]] — SPA の起源となった Ajax の時代背景
