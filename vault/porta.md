---
title: Porta
tags: [almide, sandbox, mcp, wasm, security]
---

AI エージェントとネイティブコマンド向けのセキュア MCP ブリッジ。WASM 隔離 + OS レベル制限を capability で統合する。Docker 不要。

## Two Execution Modes

| モード | 隔離手段 | 用途 |
|---|---|---|
| **WASM sandbox** | wasmtime (内蔵 interpreter) | [[almide|Almide]] / Rust / C を WASM 化したエージェント |
| **Native restrictions** | macOS `sandbox-exec` | [[claude-code|Claude Code]] / Python / Node などの素のコマンド |

`porta run` が拡張子で自動判別する（`.wasm` → WASM、それ以外 → native）。

## Quick Start

```bash
# Claude Code を HTTPS のみ許可で実行
porta run claude --allow-net '*:443' -v . -e "HOME=$HOME" -- --print "Fix the bug"

# 宣言的に
porta init native claude
porta up -- --print "Fix the bug in main.rs"

# WASM エージェントを MCP サーバとして公開
porta serve agent.wasm --profile full
```

## porta.toml

```toml
[runtime]
type = "native"           # "native" or "wasm"
command = "claude"

[sandbox]
mounts = ["."]            # ":ro" で read-only
network = ["*:443"]       # 空 = 全許可

[secrets]
API_KEY = { from-env = true }
```

## Security Model

### Two-Layer Enforcement

1. **OS layer** — `sandbox-exec` でプロセスのファイル書き込み・ポートを制御。子プロセスから回避不能
2. **MCP layer** — `porta.exec` / `porta.http` ビルトインツールのホスト+ポート URL フィルタ

### macOS Native Restrictions

| Control | 振る舞い |
|---|---|
| FS write | `-v` マウント先と `/tmp` 以外は拒否 |
| FS read | `~/.ssh` `~/.gnupg` は常に拒否 |
| Network | デフォルト全開、`--allow-net "*:443"` で制限 |

macOS sandbox-exec はポートベースのみ。ホスト名フィルタは MCP 層で処理。

### WASM Capability Set

deny-by-default。`io`, `fs`, `fs.write`, `process`, `env`, `clock`, `random`, `net`, `exec` を組み合わせ、`ai-agent` / `worker` / `full` のプリセット profile を提供。

## Architecture

```
porta/
├── cli.almd        引数 / help
├── mod.almd        コマンド dispatch（entry）
├── engine.almd     serve / run / validate / inspect
├── dispatch.almd   WASM instance lifecycle, tool dispatch
├── mcp.almd        MCP プロトコル状態機械
├── jsonrpc.almd    Content-Length framed JSON-RPC 2.0
├── sandbox.almd    capability 強制
├── ops.almd        daemon 管理 (ps/stop/kill/logs/rm)
├── wasm_rt.almd    wasmtime ブリッジ
└── wasm/
    ├── binary.almd binary parser
    └── wasi.almd   WASI Preview 1 host fns
```

ハーネス全体が [[almide|Almide]] で書かれている。WASM interpreter / WASI 実装も内製。

## MCP Built-in Tools

| Tool | 必須 capability | 用途 |
|---|---|---|
| `porta.exec` | `CapExec` + `--allow-exec` | コマンド実行（FS/net 制限付き） |
| `porta.http` | `CapNet` + `--allow-net` | 許可ホストへの HTTP |
| Agent tools | — | WASM エージェントへ委譲 |

## Claude Code 統合

```json
{
  "mcpServers": {
    "agent": {
      "type": "stdio",
      "command": "porta",
      "args": ["serve", "agent.wasm", "--profile", "full", "--allow-net", "*:443"]
    }
  }
}
```

## 関連

- [[almide]] — Porta 自身の実装言語、WASM ターゲットの主要ユースケース
- [[claude-code|Claude Code]] — native モードの代表的な制限対象
- [[famulus2]] — 同様に LLM 駆動だが、Porta はその実行基盤になり得る
- [[obsid]] — 別系統の WASM ホスト（こちらはグラフィクス用）

## Links

- [GitHub](https://github.com/almide/porta)
