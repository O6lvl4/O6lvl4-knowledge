---
title: php-build-standalone
tags: [php, distribution, static-binary, release]
---

全プラットフォーム向けの静的リンク済み PHP バイナリ。`apt`、`brew`、Docker 不要。ダウンロードして展開して `php -v` するだけ。

## What

実用的な拡張モジュールセットを焼き込んだ静的リンク PHP バイナリを GitHub Release で配布する。sha256 チェックサム付き。

ビルドは [static-php-cli](https://github.com/crazywhalecc/static-php-cli) を使用。

## Platforms

| Target | Status |
|---|---|
| `aarch64-apple-darwin` (macOS arm64) | ✓ |
| `x86_64-apple-darwin` (macOS Intel) | ✓ |
| `x86_64-unknown-linux-musl` (Linux x86_64) | ✓ |
| `aarch64-unknown-linux-musl` (Linux arm64) | ✓ |

## Included extensions

Laravel / Symfony / モダンな PHP プロジェクトをカバーする実用セット:

```
bcmath, calendar, ctype, curl, dom, fileinfo, filter, iconv,
json, mbstring, mysqlnd, mysqli, openssl, pdo, pdo_mysql,
pdo_sqlite, phar, posix, readline, session, simplexml,
sockets, sodium, tokenizer, xml, xmlreader, xmlwriter,
zip, zlib
```

## Usage

```bash
# 直接ダウンロード（macOS arm64, PHP 8.4）
curl -fsSL https://github.com/O6lvl4/php-build-standalone/releases/download/php-8.4.20/php-8.4.20-aarch64-apple-darwin.tar.gz | tar xz
./php -v

# qusp 経由
qusp install php 8.4.20
```

## 関連

- [[qusp]] — `qusp install php` のソースとして使用
- [[anyv-core]] — qusp の sha 検証 / 解凍ロジックの substrate

## License

MIT (このプロジェクト)。PHP 本体は PHP License、バンドルライブラリは各々のライセンス。

## Links

- [GitHub](https://github.com/O6lvl4/php-build-standalone)
