---
title: homebrew-tap
tags: [homebrew, packaging, infrastructure]
---

@O6lvl4 が管理する Homebrew formula 集。現状は [[gv]]（Go toolchain manager）を提供。

## Install

```bash
brew tap O6lvl4/tap
brew install gv
```

または 1 ステップで:

```bash
brew install O6lvl4/tap/gv
```

## Formulae

| Formula | 説明 | Source |
|---|---|---|
| [[gv]] | Go version & toolchain manager | [O6lvl4/gv](https://github.com/O6lvl4/gv) |

## 自動更新

upstream `O6lvl4/gv` で新リリースが切られると、向こうの `release-tap` ワークフローがこのリポジトリへ formula version + SHA を bump する commit を自動で開く。手動編集は不要。

## License

各 formula は upstream のライセンスに従う。tap リポジトリ自体は MIT。

## 関連

- [[gv]] — 提供している formula

## Links

- [GitHub](https://github.com/O6lvl4/homebrew-tap)
