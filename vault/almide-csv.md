---
title: almide/csv
tags: [almide, stdlib, parser, csv]
---

[[almide|Almide]] 用の CSV パーサ / シリアライザ。RFC 4180 サポート、Pure Almide 実装。

## Install

```bash
almide add almide/csv
```

## Usage

```almide
import csv

// 配列の配列としてパース
let data = csv.parse("name,age\nAlice,30\nBob,25")!

// ヘッダ行を使ってオブジェクト配列としてパース
let records = csv.parse_records("name,age\nAlice,30\nBob,25")!

// シリアライズ
let text = csv.stringify(data)
let text = csv.stringify_records(records)   // ヘッダ自動生成
```

## API

| Function | Signature |
|---|---|
| `csv.parse` | `(String) -> Result[Value, String]` |
| `csv.parse_records` | `(String) -> Result[Value, String]` |
| `csv.stringify` | `(Value) -> String` |
| `csv.stringify_records` | `(Value) -> String` |

## 対応機能

- クォートフィールド (`"hello, world"`)
- エスケープクォート (`""` → `"`)
- クォート内改行
- CRLF / LF
- 空フィールド
- Roundtrip-safe

## 関連

Almide stdlib のフォーマットライブラリ群: [[almide-base64|base64]] / [[almide-toml|toml]] / [[almide-yaml|yaml]] / [[almide-svg|svg]]。

## Links

- [GitHub](https://github.com/almide/csv)
