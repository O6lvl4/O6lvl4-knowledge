---
title: dotfiles
tags: [macos, developer-tools, shell, infrastructure]
---

macOS 開発環境の設定ファイルとセットアップスクリプト。Homebrew + 言語別 version manager + Karabiner（JIS）の方針。

## Setup

```bash
# 1. Homebrew（未インストール時）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. clone
git clone <repo-url> ~/dotfiles
cd ~/dotfiles

# 3. install
chmod +x install.sh
./install.sh
```

## 設計方針

| 優先 | 内容 |
|---|---|
| Speed | Rust 製ツール優先（mise / uv / eza） |
| Flexibility | プロジェクト単位のバージョン管理（衝突なし） |
| Simplicity | mise を多言語の統一フロントに |
| Modernity | 2024+ のベストプラクティス |

## Language version manager

| Language | Manager |
|---|---|
| Go | [[gv]] (toolchain manager) |
| Node.js / Python / Ruby / Terraform / pnpm | mise |
| Python packages | uv |
| Java | SDKMAN |

Brewfile はアプリ用に保ち、言語は除外する方針。

## 主要ファイル

| File | 役割 |
|---|---|
| `.zshrc` | パス・エイリアス・関数 |
| `Brewfile` | Homebrew packages（言語以外） |
| `setup-languages.sh` | version manager 一括導入 |
| `karabiner/karabiner.json` | JIS キーボードのリマップ |
| `SETUP_GUIDE.md` | 詳細ガイド |

## 主要コマンド

```bash
update_dev                    # 全部更新
versions                      # 全言語のバージョン表示
setup_project [node|python|ruby|go]
backup_dotfiles
```

## Brewfile 文法

```ruby
brew "package-name"           # Homebrew package
cask "app-name"               # GUI app
mas "App Name", id: 123456789 # Mac App Store
tap "user/repo"
```

`brew bundle list / check / cleanup` で確認・差分・整理。

## 関連

- [[gv]] — Go 用に採用している toolchain manager

## Links

- [GitHub](https://github.com/O6lvl4/dotfiles)
