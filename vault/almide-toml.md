---
title: toml (Almide)
tags: [almide, stdlib]
---

TOML v1.0 パーサー・シリアライザ。[[almide|Almide]] で純粋実装。

## TOML とは

Tom's Obvious, Minimal Language。設定ファイル向けのフォーマット。`Cargo.toml`（Rust）や `pyproject.toml`（Python）で使われている。JSON より人間が読み書きしやすく、YAML より仕様が厳密。

## 機能

- Codec 統合で encode/decode を自動化（Almide の型から直接変換）
- 多行文字列、数値フォーマット（hex `0xFF`, oct `0o77`, bin `0b1010`）
- テーブル、ネストテーブル、テーブル配列に対応

## 関連

- [[almide|Almide]] — 言語本体
- [[almide-yaml|yaml]] — 同じく Codec 統合のシリアライザ
