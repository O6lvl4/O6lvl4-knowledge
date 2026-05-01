---
title: almide/toml
tags: [almide, stdlib, parser, toml]
---

[[almide|Almide]] 用の TOML v1.0 パーサ / シリアライザ。Codec プロトコル統合あり、Pure Almide 実装。

## Install

```bash
almide add almide/toml
```

## Usage

```almide
import toml

let config = toml.parse("""
[server]
host = "localhost"
port = 8080
debug = false
""")!

let text = toml.stringify(config)
```

### Codec 連携

```almide
type ServerConfig: Codec = { host: String, port: Int, debug: Bool }

let text   = toml.encode(ServerConfig { host: "0.0.0.0", port: 3000, debug: true })
let config = ServerConfig.decode(toml.parse(text)!)!
```

`encode` / `decode` は `Codec` を派生する任意の型で自動的に動作。追加実装不要。

## API

| Function | Signature |
|---|---|
| `toml.parse` | `(String) -> Result[Value, String]` |
| `toml.stringify` | `(Value) -> String` |
| `toml.encode` | `(T: Codec) -> String` |
| `toml.decode[T]` | `(String) -> Result[T, String]` |

## 対応機能

- 文字列: basic / literal / multiline
- 数値: int / float / hex / oct / bin / underscore / `nan` / `inf`
- Boolean、datetime（文字列保持）
- Table、ネスト、dotted keys
- 配列、array of tables (`[[...]]`)
- Inline table、コメント

## 関連

Almide stdlib のフォーマットライブラリ群: [[almide-base64|base64]] / [[almide-csv|csv]] / [[almide-yaml|yaml]] / [[almide-svg|svg]]。

## Links

- [GitHub](https://github.com/almide/toml)
