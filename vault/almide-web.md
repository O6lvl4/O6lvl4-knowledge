---
title: almide-web
tags: [almide, wasm, browser]
---

[[almide|Almide]] WASM アプリ向けのブラウザ API バインディング。

## モジュール

| モジュール | 内容 |
|---|---|
| `dom` | 要素作成、属性、スタイル、テキスト、string interning |
| `fetch` | HTTP GET/POST（async callback） |
| `timer` | setTimeout, setInterval, requestAnimationFrame |
| `console` | log, warn, error |
| `storage` | localStorage, sessionStorage |

## アーキテクチャ

WASM → `@extern` で JS を呼び出し → JS が非同期処理を開始 → 完了時に `@export` でWASM に結果を返す。
