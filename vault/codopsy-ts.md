---
title: codopsy-ts
tags: [cli, typescript, code-quality, ast, npm]
---

[[codopsy]] の TypeScript / JavaScript 専用版。zero config、A-F 品質スコア、47 lint ルール、baseline 比較、hotspot 検出、plugin システム、SARIF 出力。

## Core Idea

ESLint + sonarjs / Biome / oxlint と異なり、cyclomatic + cognitive 複雑度・品質スコア・baseline・hotspot を組み込みで持つ。設定不要、`npm install -g codopsy-ts` で動く。Codopsy 自身が grade A (99/100) で self-dogfooding。

## CLI

```bash
npm install -g codopsy-ts
codopsy-ts analyze ./src
codopsy-ts analyze ./src -f sarif -o results.sarif  # GitHub Code Scanning
codopsy-ts analyze ./src --diff origin/main         # PR 変更分のみ
codopsy-ts analyze ./src --hotspots                 # 複雑度 × git churn
codopsy-ts analyze ./src --save-baseline
codopsy-ts analyze ./src --no-degradation
```

## Quality Score

3 つのサブスコアの合算（0-100）:

- **Complexity** (0-35) — cyclomatic > 10 (×2, cap 15/fn), cognitive > 15 (×1.5, cap 12/fn)
- **Issues** (0-40) — error: -8×count、warning: -4×√count、info: -1×√count（rule 単位、平方根で逓減）
- **Structure** (0-25) — max-lines (-10, cap 12), max-depth (-4, cap 12), max-params (-3, cap 10)

A (90-100) / B (75-89) / C (60-74) / D (40-59) / F (0-39)。

## Lint Rules

| Rule | Default | 説明 |
|---|---|---|
| max-complexity / max-cognitive-complexity | warning | 閾値超過 |
| max-lines / max-depth / max-params | warning | 構造的閾値 |
| no-any / no-var / eqeqeq | warning | TypeScript 安全性 |
| no-empty-function / no-nested-ternary / no-param-reassign | warning | 可読性 |
| no-console / prefer-const | info | スタイル |

## Plugin System

JS/TS モジュールで custom rule を追加可能:

```js
export default {
  rules: [{
    id: 'no-todo-comments',
    description: 'Disallow TODO comments',
    defaultSeverity: 'info',
    check(sourceFile, filePath, issues) { /* ... */ }
  }]
};
```

`.codopsyrc.json` の `plugins` 配列で登録、ルール設定で severity 変更可能。

## Programmatic API

```ts
import { analyze } from 'codopsy-ts';

const result = await analyze({ targetDir: './src' });
console.log(result.score);  // { overall: 99, grade: 'A', distribution: {...} }
```

`analyzeFile`, `analyzeComplexity`, `lintFile`, `loadConfig`, `formatReport`, `calculateProjectScore`, `findSourceFiles`, `loadPlugins` も export。

## GitHub Action

```yaml
- uses: O6lvl4/codopsy-ts@v1
  with:
    directory: ./src
```

SARIF を Security タブへ自動アップロード。

## 関連

- [[codopsy]] — Rust 製、25 言語対応の上位版
- [[codopsy-ts-skill]] — Claude Code plugin

## Links

- [GitHub](https://github.com/O6lvl4/codopsy-ts)
