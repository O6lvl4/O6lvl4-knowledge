---
title: Paged.js
tags: [pdf, css]
created_at: 2026-05-31
updated_at: 2026-05-31T21:45:51+09:00
---

W3C の **CSS Paged Media** / Generated Content for Paged Media 仕様をブラウザ上で**ポリフィル**する OSS の JavaScript ライブラリ。HTML+CSS を**ページに分割**して印刷・PDF にできる。Coko Foundation(pagedmedia.org)が開発、MIT ライセンス。商用エンジン [[prince|Prince]] のオープンな対抗。

## 何をするか

ブラウザは本来「無限に縦スクロールする1枚」しか描けず、`@page` や running header などの **Paged Media CSS をネイティブには解釈しない**。Paged.js は JS で:

1. **chunker / fragmenter** — コンテンツを走査し、ページの高さで**改ページ位置を計算**して `.pagedjs_page` の連なりに分割
2. **page box の生成** — `@page` のマージン領域(上下左右の16スロット)を実 DOM として作る
3. **running headers/footers・ページ番号・相互参照** — `string-set` / `counter(page)` / `target-counter()` などを JS で解決

結果の DOM を Chromium(多くは Puppeteer/ヘッドレス)で印刷すれば PDF になる。

## 立ち位置(HTML→PDF エンジン比較)

| | 実行環境 | CSS Paged Media | ライセンス |
|---|---|---|---|
| **Paged.js** | ブラウザ(Chromium)上の JS ポリフィル | 部分的(ポリフィルできる範囲) | OSS (MIT) |
| [[prince\|Prince]] | 独自エンジン | ほぼフル | 商用 |
| Vivliostyle | ブラウザ上の JS(同系) | 部分的 | OSS |
| WeasyPrint | 独自エンジン(Python) | 部分的 | OSS |

ポリフィル方式の利点は「**ブラウザの CSS/フォント/レイアウトをそのまま使える**」こと。欠点は Chromium 依存と、複雑な改ページ制御で独自エンジンに劣る点。

## なぜ重要か

「**Web 標準(HTML/CSS)だけで組版する**」思想の代表格。専用 DSL や商用エンジンを使わず、デザイナーが知っている CSS で本・帳票を作れる。[[css-paged-media|CSS Paged Media]] を「未来の標準」として先取りするのが狙い。

## 関連

- [[css-paged-media]] — Paged.js がポリフィルする W3C 仕様そのもの
- [[prince]] — 同じ CSS 組版の商用フルエンジン。Paged.js はその OSS 代替
- [[pagina]] — Rust 製の CSS Paged Media → PDF エンジン(独自エンジン側の仲間)
- [[document-generation]] — 書面自動生成。Paged.js は HTML→PDF 経路の一手段
