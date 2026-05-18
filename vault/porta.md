---
title: porta
tags: [almide, security, mcp, agent]
---

AI エージェント・ネイティブコマンド向けのセキュア MCP bridge。[[almide|Almide]] で実装。

## 2つの実行モード

### WASM サンドボックス
Almide/Rust/C エージェントを WASM にコンパイルし、wasmtime 上で数学的に隔離して実行。Capability ベースのセキュリティ（io, fs, fs.write, process, env, clock, random, net, exec）。

### ネイティブ制限
任意のコマンド（Claude Code, Python, Node.js 等）を macOS sandbox-exec でファイルシステム・ネットワーク制限付きで実行。

## 使い方

```bash
# Claude Code をネットワーク制限付きで実行
porta run claude --allow-net '*:443' -v . -e "HOME=$HOME" -- --print "Fix the bug"

# WASM エージェントを MCP サーバーとして起動
porta serve agent.wasm --profile full --allow-net "*:443"
```

## 機能

- ポートベースのネットワーク制御
- ファイルシステム制限 + 読み取り専用マウント
- Capability プロファイル: `ai-agent`, `worker`, `full`
- MCP サーバーモード（JSON-RPC 2.0 over stdio）
- デーモン管理: ps, stop, kill, logs, rm
