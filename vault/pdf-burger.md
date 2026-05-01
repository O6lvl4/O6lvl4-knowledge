---
title: pdf-burger
tags: [cli, python, pdf, developer-tools]
---

複数 PDF とディレクトリを 1 つのファイルに積み上げて結合する CLI。

## CLI

```bash
pip install pdf-burger
# または
uv tool install pdf-burger

pdf-burger a.pdf b.pdf c.pdf            # → merged.pdf
pdf-burger ./invoices/                  # ディレクトリ内すべて（自然順）
pdf-burger ./docs/ -r                   # 再帰
pdf-burger cover.pdf chapters/ end.pdf -o book.pdf
pdf-burger ./docs/ --dry-run            # プレビュー
```

| Option | 説明 |
|---|---|
| `-o, --output` | 出力ファイル名（default: `merged.pdf`） |
| `-r, --recursive` | サブディレクトリを再帰探索 |
| `--overwrite` | 既存ファイルを上書き許可 |
| `--verbose` | 詳細ログ |
| `--dry-run` | 対象ファイル一覧のみ表示 |

## Smart Naming

`-o` 省略時:

- 複数入力 → `merged.pdf`
- 単一ディレクトリ → `{directory_name}.pdf`
- 衝突時 → 自動採番（`merged_001.pdf`...）

## Directory Handling

- ディレクトリ内 PDF は **自然順** ソート（`1.pdf`, `2.pdf`, `10.pdf`）
- デフォルトは非再帰、`-r` で subdir を含める
- 破損 PDF は警告のみ出してスキップ

## Links

- [GitHub](https://github.com/O6lvl4/pdf-burger)
