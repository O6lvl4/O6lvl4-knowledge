---
title: almide-sqlite
tags: [almide, database]
created_at: 2026-05-18
updated_at: 2026-05-19
---

[[almide|Almide]] 用の SQLite3 バインディング。

## API

- `open` / `close` — DB 接続管理
- `exec` — 文の実行
- `query` — パラメータ付きクエリ（`?` プレースホルダー）
- トランザクション（自動 commit/rollback）
- テーブルメタデータ取得

## デフォルト設定

WAL モードと外部キーが自動で有効化される。

## 関連

- [[almide|Almide]] — 言語本体
