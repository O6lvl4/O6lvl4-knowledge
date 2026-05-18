---
title: homullus
tags: [almide, ai, agent, cli]
---

[[almide|Almide]] で実装した自律 AI エージェント CLI。[[almai]] 経由でマルチプロバイダー対応。~1337 行。

## ビルトインツール (6)

Bash, Read, Write, Edit, Glob, Grep — tool calling で LLM が実行。

## 権限モード

| モード | 動作 |
|---|---|
| `default` | 読み込み自動、他は確認 |
| `accept-edits` | 読み書き自動 |
| `bypass` | すべて自動 |

## 安全機能

`rm -rf`, `curl | sh`, `mkfs`, fork bomb を検知。bypass モードでも検出。

## REPL コマンド

`/model`, `/tools`, `/trust`, `/clear`, `/resume`, `/remember`

## 構成

```
src/
  main.almd          // REPL、スラッシュコマンド
  agent.almd         // ターン + ツールループ
  tools.almd         // ツールディスパッチ
  permission.almd    // 権限 + 危険パターン検出
  context.almd       // コンテキスト構築
```

## 関連

- [[almai]] — LLM プロバイダー抽象化層
