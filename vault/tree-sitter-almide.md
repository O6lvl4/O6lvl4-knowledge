---
title: tree-sitter-almide
tags: [almide, language-tooling]
---

[[almide|Almide]] 用の Tree-sitter パーサー文法。

## Tree-sitter とは

GitHub が開発したインクリメンタルパーサーフレームワーク。ソースコードをリアルタイムで構文木に変換し、エディタのシンタックスハイライト、コード折りたたみ、テキストオブジェクト選択などに使う。Neovim, Helix, Zed 等が採用。

## 特徴

文法定義自体が Almide で書かれている。Almide のジェネレータが `grammar.js` を出力し、tree-sitter がそこから `parser.c` を生成する。

```
generator/*.almd → grammar.js → tree-sitter generate → parser.c
```

文法をコードとして生成することで、[[almide-grammar]] と自動的に同期が保たれる。

## 対応エディタ

Neovim, Helix, Zed（tree-sitter 互換のエディタすべて）

## 関連

- [[almide-grammar]] — 構文定義の真実ソース
- [[vscode-almide]] — VS Code 向けは TextMate 文法を使用
- [[almide|Almide]] — 言語本体
