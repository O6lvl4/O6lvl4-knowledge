---
title: capto
tags: [cli, typescript, pdf, llm-context]
---

ディレクトリのスナップショットを PDF として書き出す CLI。テキストはコード表示、画像は埋め込み、`.gitignore` 尊重、バイナリ自動検出。マルチモーダル LLM への入力を意識した出力。

## Core Idea

[[treesrc]] が ASCII アート + テキストなのに対し、capto は **PDF 出力** + **画像埋め込み**。マルチモーダル LLM (GPT-4V, Claude with vision) に「プロジェクト全体を 1 ファイルで」渡したいときに使う。

## CLI

```bash
npm install -g capto

# 上層のみ
capto ./my-project -o snapshot.pdf

# 再帰
capto ./my-project -r -o snapshot.pdf

# 追加 ignore + フォントサイズ + タイトル
capto ./my-project -i '*.log' '*.tmp' -f 12 -t "Project Snapshot" -o snapshot.pdf
```

| Option | 説明 |
|---|---|
| `-o, --output <file>` | 出力 PDF（default: `snapshot.pdf`） |
| `-i, --ignore <patterns...>` | 追加 ignore |
| `-f, --fontsize <size>` | フォントサイズ（default: 10） |
| `-t, --title <title>` | PDF タイトル |
| `-r, --recursive` | 再帰探索 |

## Features

- ディレクトリツリーを整形表示
- テキストファイルは行番号付きで表示
- **画像ファイルは PDF 内に直接表示**
- 再帰 / 非再帰モード
- `.gitignore` 自動適用
- バイナリ自動検出
- 様々なテキストエンコーディング対応
- マルチモーダル LLM 解析向けに最適化

## 関連

- [[treesrc]] — テキスト出力版

## Links

- [GitHub](https://github.com/O6lvl4/capto)
