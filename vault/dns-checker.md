---
title: dns-checker
tags: [moonbit, dns, cli, mail-auth]
---

MoonBit 製の DNS レコードチェッカー。メール送信ドメインの SPF/DMARC/DKIM 設定状況を確認する。

## チェック項目

- **TXT** — ドメイン検証、SPF
- **DMARC** — メール認証ポリシー
- **DKIM** — 電子署名 (CNAME)

RFC 準拠: SPF (7208), DMARC (7489), DKIM (6376)。

## 使い方

```bash
dns-checker --help
dns-checker example.com
```

### 出力例

```
=== DNS Record Checker ===
Domain: example.com

[OK] TXT @ example.com
    Found: "v=spf1 ..."

[OK] TXT @ example.com (SPF)
    SPF record found

[OK] DMARC @ _dmarc.example.com
    DMARC record found

[NG] DKIM @ selector1._domainkey.example.com
    No DKIM CNAME record found

=== Summary: 3/4 passed ===
```

## 技術スタック

- **言語**: [MoonBit](https://www.moonbitlang.com/)（v0.1.x 以上）
- **非同期ランタイム**: `moonbitlang/async`
- **ターゲット**: Native (macOS / Linux)
- 外部依存: `dig` コマンド

## ビルド

```bash
make build              # ビルド
make run DOMAIN=xxx     # 実行
make install            # ~/.local/bin にインストール
make uninstall
make clean
```

## 設計メモ

- 出力は ANSI カラー付きで `[OK]` / `[NG]` / `[--]`（neutral）を表示
- `dns_checker.mbt` がライブラリ本体、`cmd/` 配下に CLI エントリ
- `CheckSummary` 構造体で全結果を集約

## License

Apache-2.0

## Links

- [GitHub](https://github.com/O6lvl4/dns-checker)
