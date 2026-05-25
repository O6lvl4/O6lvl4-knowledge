---
title: Prince
tags: [pdf, css, document-generation, proprietary]
created_at: 2026-05-20
updated_at: 2026-05-20
---

HTML + CSS → PDF 変換の業界最高品質ツール。プロプライエタリ。YesLogic 社（オーストラリア）が 2003 年から開発。

## 何がすごいか

**CSS Paged Media 仕様の実装が最も正確で完全。** 他のツール（WeasyPrint, Paged.js 等）が CSS Paged Media の一部しかサポートしない中、Prince はほぼフル実装。印刷品質の PDF を HTML + CSS だけで生成できる。

## 機能

| 機能 | 対応状況 |
|---|---|
| CSS Paged Media（@page, 改ページ, マージン領域） | フル対応 |
| 柱（ランニングヘッダ/フッタ） | 対応 |
| 脚注 | 対応 |
| 目次の自動生成 | 対応（`target-counter()`） |
| SVG 埋め込み | 対応 |
| MathML | 基本対応（品質は中程度、MathJax 併用推奨） |
| PDF/A（長期保存） | 対応 |
| PDF/UA（アクセシビリティ） | 一部対応（ロードマップに PDF-UA/2） |
| JavaScript 実行 | 対応（レイアウト前に実行） |
| OpenType フォント | フル対応 |
| CMYK カラー | 対応 |

## 価格

| ライセンス | 価格 |
|---|---|
| デスクトップ | $495 |
| サーバー | $3,800 |
| クラウド / SaaS | 年 $2,000〜 |
| 無料版 | あり（1ページ目に Prince ロゴのウォーターマーク） |

OSS ではない。ソースコード非公開。リバースエンジニアリング禁止。

## 競合との比較

| | Prince | [[paged-js\|Paged.js]] | Vivliostyle | WeasyPrint |
|---|---|---|---|---|
| CSS Paged Media | ほぼフル | 部分的 | 部分的 | 部分的 |
| 脚注 | 対応 | 対応 | 対応 | 非対応 |
| MathML | 対応 | 非対応 | 非対応 | 非対応 |
| PDF/A | 対応 | 非対応 | 非対応 | 対応 |
| 日本語組版 | 基本対応 | 基本対応 | 強い | 基本対応 |
| 費用 | $495〜 | 無料 | 無料 | 無料 |
| OSS | いいえ | MIT | AGPL | BSD |

Prince の優位性は **CSS Paged Media のカバレッジと出力品質**。OSS ツールは個別の機能では近づいているが、総合力でまだ追いついていない。

## 関連

- [[document-generation|書面の自動生成]] — Prince が使われる文脈
- [[programming-language|プログラミング言語]]
