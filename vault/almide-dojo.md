---
title: Almide Dojo
tags: [almide, msr, benchmark, llm, harness]
---

[[almide|Almide]] の MSR (Modification Survival Rate) を毎日測定するハーネス。LLM にタスクを書かせ、ピン留めしたコンパイラで評価し、結果を git にコミットする。

## Core Idea

[[almide|Almide]] の存在意義は唯一「LLM が書いたコードがどれだけ修正に耐えるか」という指標にある。Dojo はその数値を継続的に観測する装置。

```
tasks/<difficulty>/<name>/prompt.md
    → LLM がコード生成（claude CLI 経由）
    → almide build (pinned compiler)
    → 失敗なら diagnostic を返して再試行（最大 N 回）
    → 成功なら tests.almd で検証
    → runs/YYYY-MM-DD/summary.md に記録
```

## 計測指標

- **1-shot success rate** — 再試行なしでコンパイル成功した割合
- **N-shot success rate** (N = 2, 3, 5)
- **Average retry count per task**
- **Diagnostics that helped** — ヒントを読んで LLM が修正できた件数
- **Malicious hints** — 逆に LLM をミスリードした diagnostic（`malicious-hints.md` に蓄積）

## Self-Hosting

ハーネス本体 (`src/main.almd`) も [[almide|Almide]] で書かれている。HTTP / fs / process / json を多用する I/O 重め非自明プログラムで、Almide 自身の MSR データ点としても機能する。stdlib の不足は upstream `almide/almide` で修正する方針。

## Task Bank（30 タスク × 3 段）

| Tier | LOC | タスク数 | 例 |
|---|---|---|---|
| `basic/` | <20 | 15 | fizzbuzz, factorial, gcd, is-prime, list-sum |
| `intermediate/` | 20–80 | 10 | caesar-cipher, balanced-parens, binary-search, zip-with |
| `advanced/` | >80 | 5 | expression-eval, custom-linked-list, mini-json-query, matrix-ops |

各タスクは `prompt.md` / `tests.almd` / `meta.toml` で構成。LLM には `prompt.md` のみ渡し、`tests.almd` は隠す。

## 不変条件

- 既存タスクの後付け改変禁止（MSR トレンドラインを破壊する）。修正したいときは新タスクを並置して旧を deprecate
- 生 LLM 出力は `runs/YYYY-MM-DD/raw/` に置き、コミットしない
- 集計済みメトリクス (`summary.md`) のみコミット → git history からトレンドを読める

## Pinned Compiler

`almide-pin.toml` で評価対象の Almide コンパイラのコミットを固定。コンパイラ更新と MSR 計測を分離する。

## 関連

- [[almide]] — 評価対象の言語、MSR を最大化するように設計されている
- [[claude-code|Claude Code]] — `process.exec` で呼び出すデフォルトのモデルランナー
- [[famulus2]] — 同様に LLM 駆動だが、こちらは生成側の評価基盤

## Links

- [GitHub](https://github.com/almide/almide-dojo)
