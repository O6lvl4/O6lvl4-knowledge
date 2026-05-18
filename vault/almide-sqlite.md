---
title: almide-sqlite
tags: [almide, database]
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
