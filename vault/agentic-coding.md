---
title: Agentic Coding
tags: [llm, agentic-coding, concept]
---

LLM がコードの読み書き・実行・テストを自律的に行う開発パラダイム。

## 構成要素

1. **LLM Agent** — コード生成・修正の判断主体
2. **Tool Use** — ファイル操作、Bash 実行、Git 操作
3. **Permission System** — エージェントの行動を制御
4. **Context Window** — エージェントが参照できる情報量の上限

## Context Window の経済学

Agentic coding では context window がボトルネック。コマンド出力が大きいほどトークンを消費し、コストが上がり、古いコンテキストが圧縮される。

[[rtk|RTK]] はこの問題を直接解決する:
- コマンド出力を 60-90% 圧縮
- context window の有効利用率を上げる
- 結果としてエージェントの判断精度が向上

## 言語設計との関係

[[almide|Almide]] は agentic coding を前提に設計された言語:
- **曖昧性除去** → LLM の分岐トークンを削減
- **Effect system** → 生成空間を制限して正確な補完を促進
- **MSR (Modification Survival Rate)** → AI による連続修正の成功率を計測

## 主要ツール

- [[claude-code|Claude Code]] — Anthropic の CLI エージェント
- Cursor — VS Code ベースの AI エディタ
- GitHub Copilot — コード補完 + チャット
- Codex — OpenAI のエージェント
- Gemini CLI — Google のエージェント

## 最適化の方向性

| レイヤー | 最適化 | ツール |
|---|---|---|
| 言語 | LLM が書きやすい構文 | [[almide|Almide]] |
| 出力 | トークン圧縮 | [[rtk|RTK]] |
| 可視化 | 知識のグラフ化 | [[graph-garden]] |
| ダイアグラム | 美しい図の自動生成 | [[premaid]] |
