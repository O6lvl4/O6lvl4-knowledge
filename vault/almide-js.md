---
title: almide-js
tags: [almide, wasm, javascript, typescript, benchmarks]
---

[[almide|Almide]] の JS/TS-friendly WASM SDK ストーリーの progress log + ベンチマーク集。バインディング生成器そのものは [[almide-wasm-bindgen]]（Almide で書かれている）にあり、このリポジトリは vision・iteration snapshot・head-to-head 計測を追う。

## ポジション

- 生成器: [[almide-wasm-bindgen]] が本体
- CLI: [[almide-lander]] が `--target wasm` で呼び出す
- このリポジトリ: 進捗管理 + 例 + ベンチ

## 動作する one-shot 例

```bash
curl -fsSL https://almide.dev/install.sh | sh

cat > mylib.almd <<'EOF'
pub fn axpy(a: Matrix, b: Matrix, ka: Float, kb: Float) -> Matrix =
  matrix.add(matrix.scale(a, ka), matrix.scale(b, kb))
EOF

almide run src/main.almd -- --target wasm --outdir dist mylib.almd
```

```ts
import init, { axpy, Matrix } from "./dist/mylib.js";
await init();
const out = axpy(A, B, 2.0, 3.0);
console.log(out.data);   // Float64Array (zero-copy view over WASM memory)
```

## 対 Rust+wasm-bindgen ベンチ (iter 58)

| Workload | Almide | Rust+wasm-bindgen | Result |
|---|---:|---:|---|
| matmul 256×256 | 4.6 ms | 8.5 ms | **Almide 1.84× faster** |
| axpy N=512 | 0.38 ms | 0.36 ms | Rust 1.05× narrow |
| compose N=512 (3-term) | 0.58 ms | 0.44 ms | Rust 1.31× |
| **binary size** | **1490 B** | 11225 B | **Almide 7.53× smaller** |

## TS 型対応（自動生成、手書きバインディング不要）

- 基本型: `Int/Float/Bool` → `number/boolean`、`String` → `string` (UTF-8)
- 構造: `List[T]` → `T[]`、`Option[T]` → `T | null`、`Result[T, String]` → `T`（Err は throw）
- レコード → `interface`、Variant → discriminated union
- `Matrix` → persistent handle class（zero-copy `.data` getter）
- `Map[K, V]` → `Map<K, V>`、`Bytes` → `Uint8Array`

## Multi-host 到達範囲 (iter 50)

同じ `.wasm` が Node / Bun / Deno / Browser / wasmtime / wasmtime-py で動く。Cloudflare Workers は構造的互換、ランタイム検証は未。

## 関連

- [[almide-wasm-bindgen]] — 生成器本体
- [[almide-lander]] — CLI
- [[almide-bindgen]] — native FFI (姉妹)
- [[almide]] — 言語本体

## Links

- [GitHub](https://github.com/almide/almide-js)
