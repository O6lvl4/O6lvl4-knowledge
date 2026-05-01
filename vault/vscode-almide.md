---
title: vscode-almide
tags: [almide, vscode, editor, textmate]
---

[[almide|Almide]] の VS Code 拡張（および Chrome 拡張）。シンタックスハイライト、ブラケットマッチ、コメントトグル、コードフォールディングを `.almd` に提供する。

## Single Source of Truth

TextMate grammar (`syntaxes/almide.tmLanguage.json`) は Almide ソースから生成する。キーワードやスコープは [[almide-grammar]] が一元管理し、生成器が `import almide_grammar` で取り込む。ハードコードされたキーワードリストはどこにもない。

```bash
almide run generator/main.almd
```

[[almide-grammar]] のキーワード定義が変われば、再生成だけで TextMate も追従する。

## 構造

```
almide-editors/
  almide.toml                   declares almide-grammar dependency
  syntaxes/
    almide.tmLanguage.json      generated TextMate grammar（両拡張で共有）
  generator/
    main.almd                   TextMate 生成器エントリ
    almide_textmate.almd        パターン定義 — almide_grammar を import
    tmrule.almd                 TextMate rule types
  vscode/                       VS Code 拡張パッケージング
  chrome/                       Chrome 拡張（Highlight）
  language-configuration.json   bracket / comment 設定
```

`grammar/` は両拡張で共有：VS Code は packaging 時に `vscode/syntaxes/` へコピー、Chrome は `../../grammar/` を直接 import して esbuild で bundle。

## Build / Install

### VS Code

```bash
cd vscode
npx vsce package
code --install-extension almide-lang-*.vsix
```

### Chrome

```bash
cd chrome
npm install
node build.mjs    # → dist/
```

`chrome://extensions` で `chrome/dist/` を unpacked extension としてロード。

## Dependencies

```toml
[dependencies]
almide-grammar = { git = "https://github.com/almide/almide-grammar" }
```

## CI / Release

`main` への push で `.github/workflows/release.yml` が起動：

1. `.vsix`（VS Code 拡張）をビルド
2. `chrome-extension.zip` をビルド
3. `vscode/package.json` の version で GitHub Release を作成

バージョンは `vscode/package.json` と `chrome/manifest.json` を揃えてバンプする。

## Branch Strategy

- `main` — protected。`develop` からの PR のみ
- `develop` — 作業ブランチ
- `main` push → CI release

## 関連

- [[almide]] — 拡張の対象言語
- [[almide-grammar]] — キーワード/スコープの単一参照点
- [[tree-sitter-almide]] — 別の構文消費者（こちらは parser）

## Links

- [GitHub](https://github.com/almide/vscode-almide)
