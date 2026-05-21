---
title: Almide v0.20.0 既知問題
tags: [almide, bug, codegen]
---

Minecraft bot フレームワーク構築中に発覚した v0.20.0 の問題一覧。優先度: 1 > 2 > 5 > 3 = 4 > 6。

## 1. `net` + `http` 併用時に重複 import 生成 [Bug / codegen]

`import net` と `import http` を同一プロジェクトで使うと、生成 Rust に重複 `use` 文が出てビルドが通らない。

```almide
import net
import http
```

生成される Rust:

```rust
use std::io::{Read, Write, BufRead, BufReader};  // http 由来
use std::io::{Read, Write};                       // net 由来
use std::net::{TcpStream, TcpListener};           // http 由来
use std::net::{TcpStream, TcpListener, Shutdown}; // net 由来
```

```
error[E0252]: the name `Read` is defined multiple times
error[E0252]: the name `TcpStream` is defined multiple times
```

codegen 側で import を集約 (dedup / merge) する必要がある。**ビルドブロッカー。**

## 2. record spread で TcpStream が Clone を要求 [Bug / codegen]

`{...r}` が内部で `clone()` を呼ぶ codegen になっているため、Clone を実装していない型 (TcpStream 等) を含む record で壊れる。

```almide
type Connection = { stream: TcpStream, threshold: Int }

fn update(conn: Connection, t: Int) -> Connection =
  { ...conn, threshold: t }
```

```
error[E0599]: no method named `clone` found for struct `TcpStream`
```

変更されないフィールドは move で済ませるべき。**ビルドブロッカー。**

## 3. `env.get()` の `??` が Result パターンを生成 [Bug / codegen]

`env.get` は `Option[String]` を返すが、`??` 演算子が `Ok/Err` パターンマッチを生成してしまう。

```almide
let home = env.get("HOME") ?? "/tmp"
```

生成される Rust:

```rust
match almide_rt_env_get("HOME") { Ok(v) => v, Err(_) => "/tmp" }
// 正しくは Some(v) => v, None => "/tmp"
```

`??` が対象の型 (Option vs Result) を見て適切なパターンを選ぶ必要がある。

## 4. `string.char_at` の `??` も同じ問題 [Bug / codegen]

Issue 3 と同根。`char_at` も `Option[String]` を返すが `Ok/Err` が生成される。

```almide
let c = string.char_at(s, 0) ?? "0"
```

## 5. `bytes.to_string` がない [Enhancement]

`bytes.from_string(s) -> Bytes` はあるが逆方向がない。バイナリプロトコルで受信したバイト列を文字列に変換できない。

```almide
let b = bytes.from_string("hello")  // OK
let s = bytes.to_string(b)          // 存在しない
```

バイナリプロトコル実装のブロッカー。

## 6. `process.sleep` がない [Enhancement]

OAuth device code flow のポーリング等で待機が必要。現状は外部コマンド経由の回避策しかない。

```almide
// 現状の回避策
process.exec("sleep", ["5"])!

// 欲しい API
process.sleep(5000)  // ミリ秒
```

Nice-to-have。

## 関連

- [[almide|Almide]]
- [[almide-compiler-errors|Almide コンパイラエラー体験]]
