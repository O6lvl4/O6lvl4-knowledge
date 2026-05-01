---
title: almide/base64
tags: [almide, stdlib, encoding]
---

[[almide|Almide]] 用の Base64 エンコード / デコードライブラリ。RFC 4648 standard と URL-safe variant に対応。Pure Almide 実装。

## Install

```bash
almide add almide/base64
```

## Usage

```almide
import base64

// Standard
let encoded = base64.encode("Hello World")    // "SGVsbG8gV29ybGQ="
let decoded = base64.decode(encoded)!         // "Hello World"

// URL-safe (no padding, - / _ instead of + / )
let url_encoded = base64.encode_url("Hello World")
let url_decoded = base64.decode_url(url_encoded)!

// Bytes API
let encoded = base64.encode_bytes([72, 101, 108, 108, 111])
let bytes   = base64.decode_bytes("SGVsbG8=")!
```

## API

| Function | Signature |
|---|---|
| `encode` / `decode` | `(String) -> String` / `Result[String, String]` |
| `encode_url` / `decode_url` | URL-safe (no padding) |
| `encode_bytes` / `decode_bytes` | `List[Int]` バイト列 |
| `encode_bytes_url` / `decode_bytes_url` | URL-safe バイト列 |

## 関連

Almide stdlib のフォーマットライブラリ群: [[almide-csv|csv]] / [[almide-toml|toml]] / [[almide-yaml|yaml]] / [[almide-svg|svg]]。

## Links

- [GitHub](https://github.com/almide/base64)
