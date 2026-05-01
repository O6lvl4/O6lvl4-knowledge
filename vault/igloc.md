---
title: igloc
tags: [cli, go, security, secrets-management]
---

`.gitignore` で除外されたファイル（`.env` 等の secret）をローカルマシンから探し出す Go 製 CLI。新マシンセットアップや監査用。

## Core Idea

`git status --ignored` を使って ignored ファイルを列挙し、env / key / config / build / cache / ide にカテゴリ分け。デフォルトでは依存ディレクトリ（`node_modules`, `target`, `.venv` 等）を除いた「人が書いた secret 類」だけ表示。

## CLI

```bash
go install github.com/O6lvl4/igloc/cmd/igloc@latest

igloc scan                          # カレント
igloc scan ~/projects/my-app
igloc scan --category env           # .env 系のみ
igloc scan --all                    # 全 ignored
igloc scan --include-deps           # 依存も含む
igloc scan -r ~/projects            # 全 git repo を再帰スキャン

igloc sync                          # github/gitignore の最新パターンを取得
igloc sync --list                   # 対応言語

igloc export backup.zip             # secret を zip で書き出し
igloc export -r ~/projects backup.zip
igloc import backup.zip             # 別マシンで復元
igloc import --dry-run backup.zip
```

## 出力例

```
📂 /Users/you/projects/my-app

   🔑 ENV (3)
      .env 🔐
      .env.local 🔐
      config/.env.production 🔐

   Total: 3 files (🔐 3 secrets)
```

## Archive 構造

```
backup.zip
├── manifest.yaml      メタ情報とパスマッピング
├── patterns.yaml      sync したパターン設定
└── files/
    └── my-app/
        ├── .env
        └── config/.env.local
```

## デフォルト除外

依存ディレクトリは `~/.config/igloc/patterns.yaml` で定義。`igloc sync` で [github/gitignore](https://github.com/github/gitignore) から最新を取得。Node.js / Python / Ruby / Go / Rust / Java / .NET / iOS など。

## ユースケース

- **secret 監査** — プロジェクトに散らばった `.env` を全列挙
- **新マシンセットアップ** — clone した repo に必要な secret 群を一括復元
- **セキュリティレビュー** — 誤コミットしそうな認証情報を発掘

## Links

- [GitHub](https://github.com/O6lvl4/igloc)
