---
title: codopsy
tags: [cli, rust, code-quality, ast, tree-sitter]
---

25 言語対応の AST レベル品質アナライザ。tree-sitter で複雑度・lint・構造を計測。コード実行不要。

## Core Idea

ソースを実行せず tree-sitter でパースし、cyclomatic / cognitive complexity と lint 違反を検出。rayon で並列化。[[famulus2]] の Code Graph バックエンドとして利用される（Rust 製の高速 CLI）。

## 対応言語

TypeScript / TSX / JavaScript / Rust / Go / Python / C / C++ / Java / Ruby / C# / PHP / Scala / Haskell / Bash / HTML / CSS / JSON / OCaml / Swift / Lua / Zig / Elixir / YAML / [[almide|Almide]] — 計 25 言語。

JS/TS は 11 ルール、Rust は 6 ルール、それ以外は閾値ルール（max-lines, max-depth, max-params, max-complexity, max-cognitive-complexity）。

## Quality Score

| Component | Weight | 計測対象 |
|---|---|---|
| Complexity | 35% | 関数の cyclomatic / cognitive 複雑度 |
| Issues | 40% | lint 違反のファイル平均 |
| Structure | 25% | ファイル数 / 関数分布 |

A (90-100) / B (80-89) / C (70-79) / D (60-69) / F (0-59)。

## CLI

```bash
cargo install --git https://github.com/O6lvl4/codopsy.git

codopsy analyze ./src              # 解析
codopsy analyze ./src --diff main  # 変更ファイルのみ
codopsy analyze ./src --hotspots   # 複雑度 × git churn
codopsy analyze ./src --save-baseline
codopsy analyze ./src --no-degradation --fail-on-warning
```

`.codopsyrc.json` で各ルールの severity / threshold を上書き。設定はターゲットから home へ向かって探索。

## How It Works

1. **Parse** — tree-sitter で言語非依存 AST へ変換
2. **Analyze** — AST を walk して複雑度を算出、lint ルールを評価
3. **Score** — 複雑度・問題・構造の重み付け合計
4. **Report** — JSON 出力（per-file / per-function）

全静的解析、コード実行ゼロ。rayon で並列化。

## 関連

- [[codopsy-ts]] — TypeScript 移植（JS/TS 専用）
- [[codopsy-ts-skill]] — Claude Code plugin
- [[famulus2]] — Code Graph バックエンドとして codopsy を利用

## Links

- [GitHub](https://github.com/O6lvl4/codopsy)
