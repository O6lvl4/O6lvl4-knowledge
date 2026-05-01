---
title: ccgrid
tags: [agentic-coding, claude-code, multi-agent, react]
---

Claude Agent SDK ベースの「Lead + Teammate」チーム開発環境。Lead エージェントが複数 Teammate を動的起動し、並列タスク実行と監視を行う Web アプリ。

## Core Idea

シングル Agent ではなく **Lead が動的に Teammate を起動・監視する** チーム構造。Agent SDK の Hook を使って Teammate の発見・タスク同期・コスト計測・DM リレーをリアルタイムに UI へ反映する。

## 主要機能

### Session Management

- Lead + Teammate 構造、`POST /api/sessions` で生成
- セッション再開（`POST /api/sessions/:id/continue`）
- token 使用量とコストをリアルタイム表示、プラン上限を fuel gauge で可視化

### Teammate Coordination

- Agent SDK Hook で Teammate を auto-discovery
- `~/.claude/tasks/{sessionId}/` の task JSON を監視・同期
- Lead ↔ Teammate 間の DM リレー（WebSocket + REST）
- ライフサイクル: `starting` → `working` → `idle` → `stopped`

### Skill & Plugin System

3 種の Skill: `official` / `external` (GitHub) / `internal` (user-defined)。GitHub repo の `ccgrid-plugin.json` を読んで一括インストール。Lead プロンプトに自動注入され Teammate からも使える。

### Permission Management

- ルールベース自動判定（toolName + pathPattern で `allow` / `deny`）
- マッチしなければ UI で対話承認、入力 rewrite も可能
- 全決定を `PermissionLogEntry` として記録

### Real-Time Communication

WebSocket で snapshot + 増分配信。Server → Client で session 状態 / Teammate 出力 / task 更新 / コスト変化を即時反映。Client → Server は permission 応答と Teammate へのメッセージ。

### File Sharing

添付ファイルを base64 で JSON 化。大きい画像は 2048px に自動リサイズ、サムネイル表示。

### Performance Optimization

`requestAnimationFrame` で大量出力を batch、Overview / Output / Teammates / Tasks の各タブ結果を cache、ローディング中は skeleton UI。

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Hono 4.7, ws 8.18, Claude Agent SDK 0.2.37 |
| Frontend | React 19.1, Zustand 5.0, Vite 6.3, Tailwind CSS 4.1 |
| Monorepo | npm workspaces |

## Architecture

```
ccgrid/
├── packages/
│   ├── shared/    型定義
│   ├── server/    Hono + WebSocket
│   │   └── src/
│   │       ├── session-manager.ts
│   │       ├── agent-builder.ts
│   │       ├── permission-evaluator.ts
│   │       ├── hook-handlers.ts
│   │       ├── task-watcher.ts
│   │       └── usage-tracker.ts
│   └── web/       React UI
```

## Session 起動フロー

```
1. NewSessionDialog → POST /api/sessions
2. SessionManager.createSession()
3. AgentBuilder が Lead プロンプト生成（custom instructions / skill list / Teammate Specs / 添付ファイル）
4. Agent SDK で Lead 起動
5. Hook が Teammate discovery / task sync / cost update を検知
6. WebSocket で UI へ配信
```

## 関連

- [[claude-code|Claude Code]] — Lead/Teammate のベース
- [[agentic-coding|Agentic Coding]] — multi-agent パラダイムの実装

## Links

- [GitHub](https://github.com/O6lvl4/ccgrid)
