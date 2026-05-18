---
title: vscode-almide
tags: [almide, language-tooling, editor]
---

[[almide|Almide]] の VS Code 拡張。

## 機能

- シンタックスハイライト（TextMate 文法）
- ブラケットマッチング
- コメント切り替え
- コードフォールディング

## 文法生成

TextMate 文法は手書きではなく、[[almide-grammar]] から自動生成される。

```bash
almide run generator/main.almd  # → syntaxes/almide.tmLanguage.json
```

## 関連

- [[almide-grammar]] — 構文定義の真実ソース
- [[tree-sitter-almide]] — Neovim/Helix 向けは Tree-sitter を使用
