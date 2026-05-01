---
title: image-catalog-composer
tags: [cli, typescript, image-processing, design-tools]
---

YAML / JSON spec から画像のラベル付きグリッドカタログ（PNG）を 1 枚生成する Node.js ツール。アイコン比較・スクリーンショット並べ・ロゴカタログ用。

## Core Idea

「Photoshop も ImageMagick も入れたくない、でも UI のスクショや favicon を並べた画像が欲しい」用途。Sharp の native binary を `npm install` で取り込み、システム依存ゼロ。1 つの spec → 1 つの PNG。

## 2 つのモード

### Quick mode — YAML 不要

パスや glob を渡すだけ、ラベルはファイル名から自動生成。

```bash
npx image-catalog-composer "icons/*.ico" -o icons.png --cols 4
npx image-catalog-composer "icons/v1/*.png" "icons/v2/*.png" -o compare.png
npx image-catalog-composer a.png b.png c.png -o out.png --title "Before / After"
```

主要フラグ:

| Flag | Default | 用途 |
|---|---|---|
| `-c, --cols <n>` | auto | 列数（auto = `ceil(sqrt(N))`） |
| `--cell-width / --cell-height <px>` | `240` | セル寸法 |
| `--padding / --gap <px>` | `16` / `12` | 余白 |
| `--background <color>` | `#ffffff` | 背景色 |
| `--label-mode <mode>` | `stem` | `basename` / `stem` / `path` / `none` |
| `--fit <mode>` | `contain` | Sharp の resize 準拠 |
| `--title <str>` | — | 上部タイトル |
| `--sort <order>` | `asc` | ファイル順 |

### Config mode — YAML / JSON で精密制御

```yaml
title: "Icon Comparison"
cellWidth: 200
cellHeight: 200
fit: contain
rows:
  - - { path: icons/v1/logo.png, label: "v1 / logo" }
    - { path: icons/v1/favicon.ico, label: "v1 / favicon" }
  - - { path: icons/v2/logo.png, label: "v2 / logo" }
    - { path: icons/v2/favicon.ico, label: "v2 / favicon" }
```

```bash
npx image-catalog-composer catalog.yaml -o icons-compared.png
```

## Features

- グリッドレイアウト（cell サイズ / padding / gap 自由）
- ラベル多行対応（`\n` または改行）
- **ICO / CUR デコード組み込み**（最大フレームを自動採用）
- Sharp 経由で PNG / JPEG / WebP / AVIF / TIFF / GIF / SVG
- `fit`: `contain` / `cover` / `fill` / `inside` / `outside`
- 背景は CSS 色（`#rrggbbaa` で透過も可）
- システム依存ゼロ

## Programmatic API

```ts
import { compose, loadConfig } from 'image-catalog-composer';
import { writeFile } from 'node:fs/promises';

const config = await loadConfig('catalog.yaml');
const pngBuffer = await compose(config);
await writeFile('out.png', pngBuffer);
```

## Links

- [GitHub](https://github.com/O6lvl4/image-catalog-composer)
