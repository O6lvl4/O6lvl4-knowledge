---
title: CSS Paged Media
tags: [css, pdf, document-generation, standard]
created_at: 2026-05-20
updated_at: 2026-05-20
---

HTML + CSS で印刷用のページレイアウトを定義するための CSS 仕様群。W3C が策定。

## 何を解決するか

Web の CSS は「スクロールする画面」を前提にしている。しかし PDF や紙は「固定サイズのページの連続」。CSS Paged Media は、ページサイズ、余白、ヘッダ/フッタ、改ページ、脚注など、印刷特有のレイアウトを CSS で表現できるようにする。

## 主な仕様

3つの仕様で構成されている。

| 仕様 | 状態 | 内容 |
|---|---|---|
| [CSS Paged Media Module Level 3](https://www.w3.org/TR/css-page-3/) | Working Draft | ページサイズ、余白、改ページ、マージン領域 |
| [CSS Generated Content for Paged Media (GCPM)](https://www.w3.org/TR/css-gcpm-3/) | Working Draft | 柱、脚注、目次、ページ参照 |
| [CSS Page Floats](https://www.w3.org/TR/css-page-floats-3/) | Working Draft | ページ上部/下部へのフロート |

3つとも **Working Draft（草案）のまま** で、正式な勧告(Recommendation)にはなっていない。

## 機能一覧

### @page ルール — ページの基本設定

```css
@page {
  size: A4 portrait;       /* ページサイズ */
  margin: 25mm 20mm;       /* 余白 */
}

@page :first {             /* 最初のページだけ別設定 */
  margin-top: 50mm;
}

@page :left {              /* 左ページ（見開き） */
  margin-left: 30mm;
}
```

### マージン領域 — ヘッダ/フッタ

```css
@page {
  @top-center {
    content: "業務委託契約書";  /* 全ページのヘッダ */
  }
  @bottom-right {
    content: counter(page) " / " counter(pages);  /* ページ番号 */
  }
}
```

ページの余白に16箇所の「マージンボックス」を配置できる（top-left, top-center, top-right, bottom-left, ...）。

### 改ページ制御

```css
h1 { break-before: page; }      /* h1 の前で改ページ */
table { break-inside: avoid; }   /* 表の途中で改ページしない */
.signature { break-before: page; } /* 署名欄は必ず新ページから */
```

### 柱（ランニングヘッダ）

```css
h2 { string-set: chapter-title content(); }  /* h2 の内容を変数に保存 */

@page {
  @top-left {
    content: string(chapter-title);  /* 現在の章タイトルを表示 */
  }
}
```

ページが変わるたびに、最後に出現した h2 の内容が自動でヘッダに入る。

### 脚注

```css
.footnote {
  float: footnote;                /* ページ下部に移動 */
}

::footnote-call {
  content: counter(footnote);     /* 本文中の脚注番号 */
}

::footnote-marker {
  content: counter(footnote) ". "; /* 脚注エリアの番号 */
}
```

### 目次（ターゲットカウンタ）

```css
a.toc-link::after {
  content: target-counter(attr(href), page);  /* リンク先のページ番号を表示 */
}
```

目次の「第3章 ......... 42」の「42」を自動で取得する。

## ブラウザは対応していない

**最大の問題: 主要ブラウザが CSS Paged Media をほぼ実装していない。** `@page { size: A4 }` と `break-before` 程度は動くが、マージン領域、柱、脚注、ターゲットカウンタは全滅。

だから変換エンジンが必要になる。

| エンジン | CSS Paged Media 対応 | 費用 |
|---|---|---|
| [[prince\|Prince]] | ほぼフル対応 | $495〜（プロプライエタリ） |
| Paged.js | 部分的（JS polyfill） | 無料（MIT） |
| Vivliostyle | 部分的 | 無料（AGPL） |
| WeasyPrint | 部分的 | 無料（BSD） |

## 関連

- [[document-generation|書面の自動生成]] — CSS Paged Media が使われる文脈
- [[prince|Prince]] — CSS Paged Media の実装が最も完全なツール
