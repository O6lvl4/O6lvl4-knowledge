---
title: premaid
tags: [cli, developer-tools, mermaid]
---

Mermaid ダイアグラムをコマンドラインから美しくレンダリングするツール。

## 仕組み

Puppeteer でヘッドレスブラウザを起動し、Mermaid をレンダリングして SVG/PNG を出力。ブラウザ環境でのレンダリングなので `htmlLabels: true` でも正確に配置される。

## テーマ

2つのビルトインテーマ:

### pretty (ライト)
- インディゴ系パステルカラー
- ノードに柔らかい影 + 角丸12px
- エッジラベルは白ピル風
- 形状ごとの色分け（長方形=インディゴ、ひし形=琥珀、円柱=エメラルド）

### dark
- Slate 系ダークカラー（`#0F172A` / `#1E293B`）
- ノードに深い影
- エッジラベルはダークピル（`rgba(15,23,42,0.96)`）

[[graph-garden]] の Mermaid レンダリングは premaid の dark テーマ設定をそのまま使用。

## 対応図タイプ

flowchart, sequence, class, state, ER, gantt, pie, gitgraph, mindmap, timeline, journey, quadrant, C4, sankey, block, architecture, venn, kanban, ishikawa, xy-chart

各図タイプに専用の CSS ルール（node 形状、色、影、フォント）が定義されている。

## CLI

```bash
premaid render diagram.mmd                    # SVG 出力
premaid render diagram.mmd -f png             # PNG 出力
premaid render diagram.mmd -t dark            # ダークテーマ
premaid render diagram.mmd -t pretty -b gradient  # グラデーション背景
premaid render diagram.mmd --scale 2          # 2x 解像度
```

## Links

- [GitHub](https://github.com/O6lvl4/premaid)
