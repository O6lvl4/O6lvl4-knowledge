---
title: almide-grammar
tags: [almide, grammar, syntax, single-source-of-truth]
---

[[almide|Almide]] の構文定義の Single Source of Truth。キーワード、演算子、優先順位、TextMate スコープを一箇所で管理し、すべての consumer が参照する。

## Why

コンパイラ・[[tree-sitter-almide|tree-sitter]]・[[vscode-almide|VS Code 拡張]] がそれぞれ別々のキーワードリストを持つと不整合が必ず起きる。`almide-grammar` はこれらすべての共通参照点になる。

## API

| Function | Return | 説明 |
|---|---|---|
| `keyword_groups()` | `List[KeywordGroup]` | 5 グループ: control / declaration / modifier / value / flow |
| `keyword_aliases()` | `List[(String, String)]` | `Ok→ok`, `Err→err`, `Some→some`, `None→none` |
| `precedence_table()` | `List[PrecLevel]` | 8 レベル: pipe (1) → unary (8) |
| `all_keywords()` | `List[String]` | 35 キーワード（sorted） |

## Distribution

### Almide パッケージとして

```toml
[dependencies]
almide-grammar = { git = "https://github.com/almide/almide-grammar", tag = "v0.1.0" }
```

```almide
import almide_grammar

for group in almide_grammar.keyword_groups() {
  println(group.category ++ ": " ++ string.join(group.words, " "))
}
```

### CLI として

```bash
almide run almide-grammar <target>
```

| Target | 出力 |
|---|---|
| `tree-sitter` | grammar.js 用のキーワードルール + 優先順位 |
| `textmate` | tmLanguage 用 JSON パターン |
| `rust` | コンパイラレキサ用キーワードマップ + `ALL_KEYWORDS` |
| `info` | 人間向けサマリ |

## TOML Files

`tokens.toml` と `precedence.toml` はコンパイラ build.rs から直接読まれる（Almide ランタイムなしでも参照できるようにするため）。

## 構造

```
almide-grammar/
  almide.toml         package: almide_grammar v0.1.0
  tokens.toml         キーワード/演算子定義（compiler build.rs 用）
  precedence.toml     演算子優先順位（compiler build.rs 用）
  src/
    mod.almd          ライブラリエントリ — 全データ定義
    main.almd         CLI — `import self as grammar`
```

## Consumers

| Project | 利用方法 |
|---|---|
| [[almide]] (compiler) | `build.rs` が `tokens.toml` / `precedence.toml` を読み `src/generated/token_table.rs` を生成 |
| [[tree-sitter-almide]] | grammar.js 生成時にキーワードリストを参照 |
| [[vscode-almide]] | TextMate 生成器が `import almide_grammar` してスコープを取得 |

## 関連

- [[almide]] — コンパイラの build.rs から TOML を消費
- [[tree-sitter-almide]] — grammar.js 生成時の依存
- [[vscode-almide]] — TextMate 生成器が依存

## Links

- [GitHub](https://github.com/almide/almide-grammar)
