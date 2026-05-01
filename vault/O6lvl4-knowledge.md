---
title: O6lvl4-knowledge
tags: [knowledge-base, meta, obsidian]
---

このリポジトリそのもの。Obsidian vault と [[graph-garden|graph-garden]] viewer を組み合わせた、O6lvl4 と Aid-On の全 public リポジトリ（および Aid-On private 例外: [[famulus]], [[famulus2]]）の知識ベース。

## 構成

```
O6lvl4-knowledge/
├── vault/              # Obsidian vault（全 markdown ノート）
│   ├── *.md            # 各リポジトリ・概念のノート
│   ├── attachments/    # 画像・PDF（Git LFS）
│   └── .obsidian/      # Obsidian 設定
└── viewer/             # graph-garden ベースの閲覧用 Astro サイト
```

## ノートの形式

すべてのノートは frontmatter（`title`, `tags`）を持ち、本文中で `[[wikilink]]` により相互参照される。`graph-garden` がビルド時にバックリンクとグラフを計算する。

## カテゴリ

- **language**: [[almide]], [[almide-examples]], [[lean4-rust-backend]], [[lean2ts]], [[lean4-learning]], [[zfp]], [[php-build-standalone]]
- **toolchain**: [[anyv-core]], [[gv]], [[rv]], [[qusp]], [[homebrew-tap]]
- **agent / cli**: [[claude-code]], [[famulus]], [[famulus2]], [[ccgrid]], [[rtk]]
- **code analysis**: [[codopsy]], [[codopsy-ts]], [[codopsy-ts-skill]], [[treesrc]]
- **knowledge / docs**: [[graph-garden]], [[premaid]], [[outline-api-client-ts]]
- **llm infra**: [[unillm]], [[fuzztok]], [[llm-throttle]], [[llm-queue-dispatcher]], [[memory-rag]], [[whenm]], [[fractop]], [[iteratop]], [[templex]], [[nagare]]
- **macOS app**: [[ClipStash]], [[macleap]], [[memre]]
- **wellness**: [[gulp-coach]], [[environment-health-viewer]]
- **devops cli**: [[syncenv]], [[igloc]], [[azprofile]], [[dns-checker]], [[resepy]], [[pdf-burger]], [[image-catalog-composer]], [[capto]]
- **business**: [[aid-on-contract-generator]], [[aid-on-invoice-generator]], [[aid-on-tax-calculator]], [[reporting-page-by-calendar-days]], [[reporting-page-by-working-days]]
- **ui**: [[aid-on-draft-ui]], [[aid-on-ui-system]]
- **auth**: [[next-auth-providers]], [[auth-providers-ts]]
- **observability**: [[sashiko]]
- **almide vtuber**: [[animula]]
- **collective**: [[sandboxes-o6lvl4]], [[training-repos]]
- **concept**: [[agentic-coding]]
- **dotfiles**: [[dotfiles]]

## 編集方針

- README から派生する事実と設計判断のみ記述
- 関連リポジトリ間は必ず `[[wikilink]]` で接続（バックリンクを成立させる）
- 学習用・実験用リポジトリは集合ノート（[[sandboxes-o6lvl4]], [[training-repos]]）に集約
- private リポジトリは原則対象外。例外は [[famulus]], [[famulus2]] のみ

## Links

- [GitHub](https://github.com/O6lvl4/O6lvl4-knowledge)
- [graph-garden](https://github.com/O6lvl4/graph-garden)
