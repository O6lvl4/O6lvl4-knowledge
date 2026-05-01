---
title: almide/svg
tags: [almide, stdlib, svg, graphics]
---

[[almide|Almide]] 用の SVG ドキュメント生成ライブラリ。Pure Almide、コンパイラ拡張なし、全ターゲットで動作。

## Install

```bash
almide add svg@v0.1.0
```

## Usage

```almide
import svg
import svg.path

let chart = svg.doc(800.0, 600.0, [
  svg.rect(10.0, 10.0, 200.0, 100.0)
    |> svg.fill("#4A90D9")
    |> svg.rx(8.0),
  svg.circle(400.0, 200.0, 60.0)
    |> svg.stroke("#333")
    |> svg.fill("none"),
  svg.text(400.0, 350.0, "Hello SVG")
    |> svg.text_anchor("middle"),
  svg.path(path.d([
    path.move_to(500.0, 50.0),
    path.cubic(550.0, 20.0, 600.0, 80.0, 650.0, 50.0),
    path.close(),
  ])) |> svg.fill("#E74C3C"),
])

fs.write("chart.svg", svg.render(chart))
```

## API

### Element factories

`doc` / `rect` / `circle` / `ellipse` / `line` / `polyline` / `polygon` / `path` / `text` / `group` / `defs` / `el`。

### Attribute modifiers (pipe-friendly)

`fill` / `stroke` / `stroke_width` / `opacity` / `transform` / `font_size` / `font_family` / `text_anchor` / `rx` / `ry` / `dash_array` / `id` / `class` / `style` / `attr`。

### Transform helpers

`svg.translate(x, y)` / `svg.rotate(deg)` / `svg.scale(sx, sy)` — transform 文字列を返す。

### `svg.path`

`move_to` / `line_to` / `h_line` / `v_line` / `cubic` / `smooth_cubic` / `quad` / `smooth_quad` / `arc` / `close` / `d`（コマンド連結）。

## 関連

Almide stdlib のフォーマットライブラリ群: [[almide-base64|base64]] / [[almide-csv|csv]] / [[almide-toml|toml]] / [[almide-yaml|yaml]]。

## Links

- [GitHub](https://github.com/almide/svg)
