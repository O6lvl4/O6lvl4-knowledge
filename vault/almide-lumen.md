---
title: Lumen
tags: [almide, stdlib, graphics, math]
---

[[almide|Almide]] 用の純粋なグラフィックス数学プリミティブ。`@extern(wasm)` を使わず、全ターゲットで動作する。

## Install

```toml
[dependencies]
lumen = { git = "https://github.com/almide/lumen.git" }
```

## モジュール

### `lumen.vec3`

```almide
import lumen.vec3 as v

let a = v.new(1.0, 2.0, 3.0)
let c = v.add(a, b)
let d = v.dot(a, b)
let n = v.normalize(a)
let x = v.cross(v.right(), v.up())
let m = v.lerp(a, b, 0.5)
```

### `lumen.mat4`

```almide
import lumen.mat4 as mat

let model = mat.identity()
  |> mat.rotate_y(0.5)
  |> mat.translate(0.0, 1.0, -5.0)
let view = mat.look_at(0.0, 0.0, 5.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0)
let proj = mat.perspective(0.785, 1.333, 0.1, 100.0)
let mvp  = mat.multiply(proj, mat.multiply(view, model))
```

### `lumen.color`

```almide
import lumen.color as c

let red = c.rgb(1.0, 0.0, 0.0)
let sky = c.from_hex("#87CEEB")
let mid = c.mix(red, sky, 0.5)
let css = c.to_css(c.with_alpha(sky, 0.8))   // "rgba(135,206,235,0.8)"
```

## 利用先

- `wasm-webgl` — WebGL バインディング
- `wasm-canvas` — Canvas 2D バインディング
- `obsid` — 3D rendering の基盤

## 関連

- [[almide]] — 言語本体
- [[almide-svg|svg]] — ベクター描画 (こちらは描画 DSL、Lumen は数学プリミティブ)

## Links

- [GitHub](https://github.com/almide/lumen)
