---
title: almide-playground
tags: [almide, wasm, browser]
created_at: 2026-05-18
updated_at: 2026-05-19
---

ブラウザ上で [[almide|Almide]] コードを実行できるオンライン IDE。

## 仕組み

Almide コンパイラ自体を WASM にコンパイルし、ブラウザ上で `.almd` → TypeScript → JavaScript に変換して eval する。サーバーラウンドトリップなし。

## 機能

- コードエディタ
- AST 表示
- コンパイル済み JS 表示
- GitHub Pages でホスティング

## 関連

- [[almide|Almide]] — 言語本体
- [[almide-docs|docs]] — ドキュメンテーションサイト
