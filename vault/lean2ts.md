---
title: lean2ts
tags: [lean4, typescript, property-testing, formal-verification, codegen]
---

> Prove it in Lean. Test it in TypeScript.

Lean 4 の formal spec を TypeScript に変換する。型・関数スタブ・[fast-check](https://github.com/dubzzz/fast-check) property test を生成する。

## Core Idea

Lean で証明したビジネスルールを TypeScript に橋渡しする。Lean の `Nat` は負にならないので「200% 割引で -$1.50 が顧客に課金された」のようなバグは型レベルで不可能。lean2ts は theorem を property test に変換することで、その保証を TS テストに持ち込む。

```
pricing.lean ──► Lean compiler (proves theorems) ──► lean2ts ──► types.ts / stubs.ts / properties.test.ts
```

## What gets generated

| Lean construct | TypeScript output | File |
|---|---|---|
| `structure` | `interface` | types.ts |
| `inductive` | discriminated union + type guards | types.ts |
| `theorem` | fast-check property test | properties.test.ts |
| `def` | function stub | stubs.ts |
| Type parameters | generic arbitraries（factory functions） | arbitraries.ts |
| `sorry` | LLM + Pantograph で自動証明 | — |

### Type mapping

| Lean | TypeScript | fast-check arbitrary |
|---|---|---|
| `Nat` | `number` | `fc.nat()` |
| `Int` | `number` | `fc.integer()` |
| `String` | `string` | `fc.string()` |
| `Bool` | `boolean` | `fc.boolean()` |
| `List α` | `ReadonlyArray<α>` | `fc.array(...)` |
| `Option α` | `α \| undefined` | `fc.option(...)` |
| `α × β` | `readonly [α, β]` | `fc.tuple(...)` |

## Quick Start

```bash
npx lean2ts pricing.lean -o ./generated
```

[Pantograph](https://github.com/lenianiva/Pantograph)（Lean の programmatic interface）と通信して declaration を抽出し、TypeScript ファイルを書き出す。

### Prerequisites

- Node.js 22+
- Lean 4（`elan` 経由）
- Pantograph（プロジェクトの Lean version と同期させる必要あり）

## sorry の自動証明

```bash
npx lean2ts prove input.lean --verbose
```

LLM が candidate tactic を提案 → Pantograph が Lean kernel で検証 → 通れば proof は健全。LLM への信頼は不要（kernel が真の判定者）。

OpenAI / Cloudflare Workers AI / Groq / Together / Fireworks / Ollama など OpenAI 互換 API を環境変数で自動検出。

## Architecture

```
.lean ──► Pantograph REPL ──► S-expression AST ──► LeanExpr tree
   ──► IR (extractor) ──► TypeScript (generator)
```

### Source Layout

- `src/s-expression/` — S 式パーサ（tokenizer + 再帰下降）
- `src/extractor/` — `classifier`、`structure-parser`、`inductive-parser`、`theorem-parser`、`def-parser`、`type-resolver`
- `src/generator/` — `type-generator`、`arbitrary-generator`、`property-generator`、`stub-generator`
- `src/pantograph/` — JSON-RPC over stdin/stdout クライアント
- `src/prover/` — `sorry-finder`、`proof-loop`、`tactic-llm`

## CLI

```
lean2ts <input.lean> [-o ./generated] [--pantograph <path>] [--no-tests] [--no-stubs] [--dry-run]
lean2ts prove <input.lean> [--model <name>] [--max-attempts 3]
```

## Examples

`pricing/`、`weather/`、`scoring/`、`inventory/` など。`pricing` は割引ロジックの 4 theorem で実バグを捕まえる例。

## 関連

- [[lean4-rust-backend]] — Lean 4 を Rust で動かすバックエンド
- [[lean4-learning]] — Lean 4 学習リポジトリ群

## Links

- [GitHub](https://github.com/O6lvl4/lean2ts)
