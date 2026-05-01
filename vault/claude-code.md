---
title: Claude Code
tags: [cli, llm, developer-tools, agentic-coding]
---

Anthropic 公式の CLI エージェント。ターミナル上で Claude がコードを読み書き・実行する。

## 特徴

- ファイル読み書き、Bash 実行、Git 操作を自律的に行う
- Permission system: allow / ask / deny でツール実行を制御
- Hooks: PreToolUse / PostToolUse でコマンドを傍受・変換可能
- CLAUDE.md でプロジェクト固有の指示を与えられる
- サブエージェント (Agent tool) で並列タスク実行
- Context window 圧縮で長時間セッション対応

## Hooks

Claude Code の Hook は [[RTK (Rust Token Killer)]] の Auto-Rewrite の基盤。

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": ["command": "/path/to/hook.sh"]
    }]
  }
}
```

Hook から返す `permissionDecision`:
- `allow` — 自動許可
- `deny` — ブロック
- `ask` — ユーザー確認（RTK のデフォルト）

## エコシステム

- [[RTK (Rust Token Killer)]] — トークン消費を 60-90% 削減する CLI プロキシ
- [[Almide]] — LLM コード生成に最適化された言語（Claude Sonnet 4.6 で Pass Rate 100%）
- [[graph-garden]] — このナレッジベースも Claude Code で構築

## Links

- [Documentation](https://docs.anthropic.com/en/docs/claude-code)
