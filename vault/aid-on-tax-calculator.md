---
title: aid-on-tax-calculator
tags: [cli, python, tax, business]
---

日本の消費税 10% を端数誤差なく計算する Python 製 CLI。標準ライブラリのみ。

## Core Idea

`floor` で素直に逆算すると 1 円ズレることがある。再計算して元の税込額に戻らなければ `+1` 補正することで誤差ゼロを保証する。

```python
def inclusive_to_exclusive(price, rate=0.1):
    excl = math.floor(price / (1 + rate))
    if math.floor(excl * (1 + rate)) < price:
        excl += 1
    return excl, price - excl, price
```

## 使い方

```bash
python main.py 1 55,640   # 税込 → 税抜
python main.py 2 50,582   # 税抜 → 税込
```

カンマ区切り入力にも対応。出力は税抜・消費税・税込の 3 行。

## 関連

- [[aid-on-invoice-generator]] — 請求書作成
- [[aid-on-contract-generator]] — 契約書作成

## Links

- [GitHub](https://github.com/Aid-On/aid-on-tax-calculator)
