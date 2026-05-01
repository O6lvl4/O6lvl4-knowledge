---
title: almide-bindgen
tags: [almide, ffi, codegen, library]
---

[[almide|Almide]] のユニバーサル FFI バインディング生成器。すべて Almide で書かれたライブラリ（`import bindgen`）。CLI は [[almide-lander]]。

## 20 言語 + Rust scaffolding

| Language | FFI | Language | FFI |
|---|---|---|---|
| Python | ctypes | C++ | extern "C" |
| Go | cgo | Rust | FFI |
| Ruby | FFI gem | JavaScript | koffi |
| Swift | C header | Scala | JNA |
| C# | P/Invoke | Julia | ccall |
| Dart | dart:ffi | PowerShell | DllImport |
| Kotlin | JNA | Elixir | NIF |
| Java | JNA | PHP | FFI ext |
| C | header | Lua | LuaJIT FFI |
| Zig | extern | Nim | dynlib |

## バイトバッファプロトコル

すべての型は FFI 境界でバイトバッファに直列化される。C struct マッピング不要。

```
Rust:   extern "C" fn bridge_distance(args: *const u8, args_len: i32, out: *mut u8, out_cap: i32) -> i32
Python: buf = struct.pack('>d', a.x) + ... → result = struct.unpack_from('>d', call(buf))
```

| Type | Encoding | Size |
|---|---|---|
| Int | big-endian i64 | 8 bytes |
| Float | big-endian f64 | 8 bytes |
| Bool | 0/1 | 1 byte |
| String | u32 BE length + UTF-8 | 4 + N |
| Record | fields in order | sum |
| Variant | u32 BE tag + payload | 4 + payload |

## ライブラリ API

```almide
import bindgen

bindgen.version()                                   // "0.1.0"
bindgen.supported_languages()                       // ["python", "go", ...]

let lib_rs   = bindgen.scaffolding.generate(iface_json, rust_source)
let cargo    = bindgen.scaffolding.generate_cargo(iface_json)
let py_code  = bindgen.bindings.python.generate(iface_json)
let go_code  = bindgen.bindings.go.generate(iface_json)
// ... 20 言語
```

## 設計

- すべての generator は `.almd` ファイル
- 外部ツール依存ゼロ（UniFFI なし、PyO3 なし、napi-rs なし）
- `scaffolding.almd` が Rust FFI レイヤを生成
- `bindings/<lang>.almd` が pure な言語ラッパを生成

## 関連

- [[almide-wasm-bindgen]] — WASM + JS/TS 専用（target model が違うため分離）
- [[almide-lander]] — CLI orchestrator
- [[almide]] — 言語本体

## Links

- [GitHub](https://github.com/almide/almide-bindgen)
