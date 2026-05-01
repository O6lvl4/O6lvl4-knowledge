---
title: treesrc
tags: [cli, typescript, developer-tools, llm-context]
---

ディレクトリ構造とファイル内容を `.gitignore` を尊重しながらツリー出力する CLI。LLM へのコンテキスト投入用。

## Core Idea

`tree` + `cat` の合体版。`.gitignore` を自動で読み、バイナリは検出して除外。LLM に「このプロジェクト全体を見せたい」場面で使う。

## CLI

```bash
npm install -g treesrc
treesrc ./my-project

# 追加 ignore パターン
treesrc ./my-project -i '*.log' '*.tmp'

# 一時利用
npx treesrc ./my-project
```

| Option | 説明 |
|---|---|
| `-i, --ignore <patterns...>` | 追加 ignore パターン |
| `-V, --version` | バージョン |
| `-h, --help` | ヘルプ |

## Features

- ディレクトリ構造をツリー表示
- 各ファイルの内容を続けて表示
- `.gitignore` ルールを自動適用（`.git` も除外）
- `isbinaryfile` で正確なバイナリ判定 + 制御文字頻度のフォールバック検査
- UTF-8 として読めないファイルはスキップ

## 関連

- [[capto]] — 同種の用途で PDF 出力版

## Links

- [GitHub](https://github.com/O6lvl4/treesrc)
