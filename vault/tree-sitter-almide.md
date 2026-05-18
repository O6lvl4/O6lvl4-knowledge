---
title: tree-sitter-almide
tags: [almide, language-tooling]
---

[[almide|Almide]] 用の Tree-sitter パーサー文法。

## 特徴

文法定義自体が Almide で書かれている。Almide のジェネレータが `grammar.js` を出力し、tree-sitter がそこから `parser.c` を生成する。

```
generator/*.almd → grammar.js → tree-sitter generate → parser.c
```

## 対応エディタ

Neovim, Helix, Zed（tree-sitter 互換のエディタすべて）

## 関連

- [[almide-grammar]] — 構文定義の真実ソース
- [[vscode-almide]] — VS Code 向けは TextMate 文法を使用
