---
title: syncenv
tags: [cli, go, devops, secrets-management]
---

git tag / branch を起点に環境設定ファイル群を AWS S3 / Azure Blob / GCS と同期する Go 製 CLI。AES-256-GCM 暗号化対応。

## Core Idea

「v1.5 では動くのに、新しいメンバーは env が違って動かない」を解消する。`git checkout v1.5 && syncenv pull` で対応バージョンの env 群が降ってくる。

## CLI

```bash
go install github.com/O6lvl4/syncenv/cmd/syncenv@latest

syncenv init                  # .syncenv.yml 生成
syncenv push                  # 現在の git tag を自動使用
syncenv push --tag v1.6
syncenv pull                  # 現在の git tag を自動取得
syncenv pull --tag v1.6
syncenv list                  # 全バージョン一覧
syncenv diff v1.5 v1.6        # バージョン間差分
```

## Features

- **Git Integration** — 現在の tag / branch を自動検出
- **Multi-Cloud** — AWS S3 / Azure Blob / Google Cloud Storage
- **Multiple Files** — `.env`, `.env.local`, `config/*.json` を tar.gz でまとめて管理
- **Path Support** — サブディレクトリも自動作成
- **Encryption** — AES-256-GCM、鍵は `.syncenv.yml` 内に自動生成

## 設定例

```yaml
storage:
  type: gcs
  project_id: my-project
  bucket_name: my-syncenv-bucket

encryption:
  enabled: true

env_files:
  - .env
  - .env.local
  - config/database/settings.json
  - secrets/api.conf
```

## Architecture

```
syncenv/
├── cmd/syncenv/         エントリ
└── internal/
    ├── archive/         複数ファイルの tar.gz アーカイブ
    ├── config/          設定管理
    ├── git/             Git 連携
    ├── crypto/          AES-256-GCM
    ├── storage/         s3 / azure / gcs / mock
    └── cli/             コマンド実装
```

## 鍵管理の方針

鍵は `.syncenv.yml` に格納し、ファイルそのものをチームで共有する（クラウド側の平文化を避ける + 別管理を不要にする）。`.syncenv.yml` を `.gitignore` に入れて公開リポジトリに混入させないこと。

## Links

- [GitHub](https://github.com/O6lvl4/syncenv)
