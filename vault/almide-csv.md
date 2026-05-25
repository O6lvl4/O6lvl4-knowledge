---
title: csv (Almide)
tags: [almide, stdlib]
created_at: 2026-05-01
updated_at: 2026-05-19
---

RFC 4180 準拠の CSV パーサー・シリアライザ。[[almide|Almide]] で純粋実装。

## CSV とは

Comma-Separated Values。表形式のデータをテキストで表現する最もシンプルなフォーマット。Excel やデータベースのインポート/エクスポート、データ分析の入力形式として広く使われる。

## 機能

- `parse` — 2次元配列として解析
- `parse_records` — ヘッダ行をキーにしたオブジェクト配列として解析
- quoted fields（フィールド内のカンマや改行をダブルクォートで囲む）に対応
- CRLF / LF 両対応
- `stringify` — roundtrip-safe（parse → stringify → parse で同じ結果）

## 関連

- [[almide|Almide]] — 言語本体
