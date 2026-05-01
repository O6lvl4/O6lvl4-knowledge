---
title: codopsy-ts-skill
tags: [claude-code, plugin, code-quality, skill]
---

[[codopsy-ts]] を [[claude-code|Claude Code]] から呼び出す plugin。`/codopsy` skill で品質解析・baseline 比較・hotspot 検出・auto-fix を実行。

## Install

```
/plugin marketplace add O6lvl4/codopsy-ts-skill
/plugin install codopsy-ts
```

要 codopsy-ts v1.2.0+ (`npm install -g codopsy-ts`)。

## Usage

```bash
/codopsy                 # ./src を解析（デフォルト）
/codopsy ./lib           # 指定ディレクトリ
/codopsy --fix           # 解析 + 自動修正
/codopsy --baseline      # baseline 比較
/codopsy --hotspots      # 複雑度 × git churn
```

## Modes

### Report (default)

`codopsy-ts analyze --verbose` を実行 → Quality Score (A-F) と grade 分布、ファイル/行/ルール/メッセージを表示。

### Baseline

現在のメトリクスを snapshot 保存し、以降の実行で比較。score 変化、issue delta、改善/悪化ファイルを報告。

### Hotspots

複雑度と git churn（commit 数 / author 数）を組み合わせて HIGH / MEDIUM / LOW のリスク評価。

### Fix

優先度順に Claude が修正:

1. `no-var` → `let`/`const`
2. `eqeqeq` → `===`
3. `prefer-const` → `const`
4. `no-empty-function` → 実装か説明コメント
5. `no-param-reassign` → ローカル変数導入
6. `max-params` → options object 抽出
7. `max-depth` → ヘルパー抽出 / early return
8. `max-complexity` / `max-cognitive-complexity` → 関数分割
9. `max-lines` → モジュール分割
10. `no-nested-ternary` → if/else（JSX 境界除外）
11. `no-any` → 型注釈

修正後に再解析、before/after を比較表示。

## 関連

- [[codopsy-ts]] — 本体 CLI
- [[codopsy]] — Rust 版、25 言語対応
- [[claude-code|Claude Code]] — host

## Links

- [GitHub](https://github.com/O6lvl4/codopsy-ts-skill)
