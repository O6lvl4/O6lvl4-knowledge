---
title: obsid
tags: [almide, graphics, wasm, webgl, canvas]
---

[[almide|Almide]] のグラフィクスランタイム。Canvas 2D / WebGL / 3D メッシュレンダリングを WASM 経由で提供する。

## Modules

| Module | 内容 | 用途 |
|---|---|---|
| `obsid.canvas` | Canvas 2D API バインディング | 2D 描画、チャート、UI |
| `obsid.webgl` | WebGL 1.0 API バインディング | 自前シェーダ、低レベル 3D |
| `obsid` | 3D メッシュレンダラ | シーングラフ、orbit camera、ライティング |

純粋数学（vec3, mat4, color）は別パッケージ [[almide-lumen|lumen]] に分離。

## Usage

### Canvas 2D

```almide
import obsid.canvas as canvas

effect fn main() -> Unit = {
  canvas.set_fill_style("#4A90D9")
  canvas.fill_rect(10.0, 10.0, 200.0, 100.0)
}
```

### WebGL

```almide
import obsid.webgl as gl
import lumen.mat4 as mat

effect fn render_frame(time: Float) -> Unit = {
  gl.clear(gl.color_buffer_bit() + gl.depth_buffer_bit())
  let model = mat.identity() |> mat.rotate_y(time)
}
```

### 3D Renderer

```almide
import obsid

effect fn main() -> Unit = {
  obsid.create_mesh(0)
  obsid.upload_mesh(0, vert_ptr, vert_count, idx_ptr, idx_count)
  obsid.set_camera(0.785, 1.333, 0.1, 100.0, 0.0, 2.0, 5.0, 0.0, 0.0, 0.0)
}
```

## Dual Host

同じ `.wasm` をブラウザ／ネイティブ両方で実行できる。

| ホスト | 実装 | 場所 |
|---|---|---|
| Browser | JS + WebGL | `host/browser/` (obsid.js / canvas.js / webgl.js) |
| Native | Rust + wasmtime + wgpu + winit | `host/native/` |

```bash
# Native 実行
cd host/native && cargo run --release -- ../browser/examples/sphere.wasm
```

## Build

```bash
almide build examples/canvas-demo.almd --target wasm
almide build examples/cube.almd --target wasm
almide build examples/sphere.almd --target wasm
```

## 構造

```
src/
  mod.almd       3D renderer bindings + orbit camera
  canvas.almd    Canvas 2D bindings
  webgl.almd     WebGL 1.0 bindings
host/
  browser/       JS + WebGL ランタイム
  native/        Rust + wasmtime + wgpu + winit
examples/
  canvas-demo.almd
  cube.almd
  sphere.almd
```

## 関連

- [[almide]] — WASM ターゲットの代表的な利用例
- [[almide-lumen|lumen]] — vec3 / mat4 / color の数学プリミティブ
- [[playground]] — 別系統のブラウザ WASM 実行（こちらは汎用）
- [[porta]] — CLI / MCP 用の WASM 実行ホスト

## Links

- [GitHub](https://github.com/almide/obsid)
