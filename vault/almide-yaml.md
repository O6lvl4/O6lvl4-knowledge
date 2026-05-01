---
title: almide/yaml
tags: [almide, stdlib, parser, yaml]
---

[[almide|Almide]] 用の YAML パーサ / シリアライザ。Codec プロトコル統合あり、Pure Almide 実装。

## Install

```bash
almide add almide/yaml
```

## Usage

```almide
import yaml

let config = yaml.parse("""
  server:
    host: localhost
    port: 8080
  debug: true
  """)!

let text = yaml.stringify(config)
```

### Codec 連携

```almide
type ServerConfig: Codec = { host: String, port: Int, debug: Bool }

let text   = yaml.encode(ServerConfig { host: "0.0.0.0", port: 3000, debug: true })
let config = ServerConfig.decode(yaml.parse(text)!)!
```

## API

| Function | Signature |
|---|---|
| `yaml.parse` | `(String) -> Result[Value, String]` |
| `yaml.stringify` | `(Value) -> String` |
| `yaml.encode` | `(T: Codec) -> String` |
| `yaml.decode[T]` | `(String) -> Result[T, String]` |

## 対応機能

- Mapping（インデントベースのネスト）
- Sequence (`- item`)
- スカラー: plain / single-quoted / double-quoted
- 数値、boolean、null (`null`, `~`)
- コメント (`#`)
- Flow sequence / mapping (`[a, b, c]`, `{x: 1, y: 2}`)
- 任意深さのネスト、sequence of mapping

## 関連

Almide stdlib のフォーマットライブラリ群: [[almide-base64|base64]] / [[almide-csv|csv]] / [[almide-toml|toml]] / [[almide-svg|svg]]。

## Links

- [GitHub](https://github.com/almide/yaml)
