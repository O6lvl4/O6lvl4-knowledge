---
title: almide-grammar
tags: [almide, language-tooling]
---

[[almide|Almide]] の構文定義の単一真実ソース（Single Source of Truth）。Almide で実装。

## 役割

キーワード、演算子、優先順位の定義を1箇所で管理し、コンパイラ・エディタツールに提供する。

## API

```almd
import almide_grammar

almide_grammar.keyword_groups()     // 6グループ、41キーワード
almide_grammar.precedence_table()   // 8レベル
almide_grammar.all_keywords()       // ソート済みリスト
```

## 消費者

- **Almide コンパイラ** — `tokens.toml` / `precedence.toml` → `token_table.rs` を生成
- **[[tree-sitter-almide]]** — grammar.js を生成
- **[[vscode-almide]]** — TextMate 文法を生成
