---
title: resepy
tags: [cli, python, data, csv]
---

CSV / TSV / 任意区切りファイル（DSV）の変換と結合を行う Python ライブラリ + CLI。

## CLI

### convert（デフォルト）

```bash
# 拡張子から推測
resepy input.csv output.tsv
resepy input.tsv output.csv

# 明示
resepy input.csv --to tsv
cat data.csv | resepy --from csv --to tsv

# 任意区切り
resepy input.csv output.psv
resepy input.csv --to '|'
```

### cat（複数ファイル結合）

```bash
# ヘッダは先頭ファイルのみ
resepy cat part1.csv part2.csv part3.csv -o merged.csv
resepy cat parts/*.tsv                       # stdout
resepy cat part1.csv part2.csv --keep-headers
```

## Python API

```python
from pathlib import Path
from resepy import compose, convert, read_dsv, write_dsv

convert(Path("data.csv"), Path("data.tsv"))
tsv_str = convert(Path("data.csv"), to_delimiter="\t")
compose([Path("part1.csv"), Path("part2.csv")], Path("merged.csv"))

rows = read_dsv(Path("data.tsv"), delimiter="\t")
write_dsv(rows, Path("output.csv"), delimiter=",")
```

## 対応形式

| 拡張子 | 区切り |
|---|---|
| `.csv` | `,` |
| `.tsv` | `\t` |
| `.psv` | `\|` |
| `.ssv` | `;` |

`--from` / `--to` または `delimiter` パラメータで任意の区切り文字を指定可能。

## Install

```bash
pip install git+ssh://git@github.com/O6lvl4/resepy.git
pip install git+ssh://git@github.com/O6lvl4/resepy.git@v0.1.0
pip install -e .
```

## Links

- [GitHub](https://github.com/O6lvl4/resepy)
