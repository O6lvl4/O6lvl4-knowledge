---
title: azprofile
tags: [cli, azure, developer-tools, shell]
---

複数 Azure アカウントを切り替えるプロファイルマネージャ。`AZURE_CONFIG_DIR` を per-profile に分離し、`az` / `azd` 両対応。

## Core Idea

Azure CLI には組み込みの multi-account 機能がない。`AZURE_CONFIG_DIR` を切り替えるだけで完全に独立した認証コンテキストが手に入る。azprofile はこれをラップしてプロファイル単位で管理する。

純シェルスクリプト実装、Node.js は **インストール時のみ** 必要。

## Setup

```bash
npm install -g azprofile-cli

# 一度だけシェル統合をセットアップ
azprofile setup ~/.zshrc
source ~/.zshrc
```

セットアップにより `azprofile` がシェル関数として展開され、`source` 不要で profile 切替が効くようになる。

## CLI

```bash
azprofile add work                  # 対話的にログイン
azprofile add personal

azprofile use work                  # 切替（永続）
az account show                     # work account

azprofile use personal
azd up                              # personal で deploy

azprofile list                      # 一覧
azprofile current                   # 現在の profile
azprofile exec work -- az account show   # 一時的に work で実行
azprofile remove work
```

## How it works

profile は `~/.azure-profiles/<name>/` に独立した Azure CLI 設定を持ち、設定全体は `~/.azure-profiles/config` に保存。`azprofile setup` がシェル設定にラッパー関数を追加し、`use <profile>` を検知して `AZURE_CONFIG_DIR` を export する。

## Requirements

- Bash >= 3.0 / Zsh
- Azure CLI (`az`)
- Azure Developer CLI (`azd`) — optional

## Links

- [GitHub](https://github.com/O6lvl4/azprofile)
