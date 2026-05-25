---
title: yaml (Almide)
tags: [almide, stdlib]
created_at: 2026-05-01
updated_at: 2026-05-19
---

YAML パーサー・シリアライザ。[[almide|Almide]] で純粋実装。

## YAML とは

YAML Ain't Markup Language。設定ファイルやデータ交換に使われるフォーマット。Docker Compose、Kubernetes、GitHub Actions などで広く採用。インデントで階層を表現し、JSON より人間が読みやすいが、仕様が複雑（インデント依存、暗黙の型変換など）。

## 機能

- Codec 統合で型安全な encode/decode（Almide の型から直接変換）
- フロースタイル `{key: value}` / ブロックスタイル（インデント）
- シーケンス（配列）、マッピング（オブジェクト）
- plain / single-quoted / double-quoted スカラー
- コメント対応

## 関連

- [[almide|Almide]] — 言語本体
- [[almide-toml|toml]] — 同じく Codec 統合のシリアライザ
