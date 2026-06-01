---
title: github.com/mruby/mruby
tags: [ruby, language, embedded]
created_at: 2026-06-01
updated_at: 2026-06-01T22:34:25+09:00
---

**軽量・組込み可能な [[ruby|Ruby]] 実装**(まつもとゆきひろ)。ISO 標準(の一部)準拠 + Ruby 4.x の新機能・構文に対応。**C アプリにリンク・埋め込める**のが核で、Ruby を bytecode にコンパイルして小さなVMで動かす。経産省の地域イノベーション創出 R&D 事業の支援で生まれた。

> 確認版: commit `72e5ebed55b672bdff413270022c8398465c2479`(2026-06-01)。README は「ISO 標準準拠 + Ruby 4.x 互換構文」と明記。

## CRuby との違い

| | CRuby (MRI) | **mruby** |
|---|---|---|
| 狙い | 汎用・フル機能 | **組込み・軽量**(フットプリント最小) |
| 埋め込み | しにくい | **C アプリにリンク/埋め込み前提** |
| VM | YARV(スタックマシン) | **RiteVM(レジスタマシン)** |
| ライブラリ | 巨大な stdlib | **mrbgems** で必要な分だけ取捨選択 |

→ レジスタVM(RiteVM)を採る点が [[stack-oriented-programming|スタックマシン]]の CRuby/YARV と対照的。

## アーキテクチャ(ソース確認)

確認版は **mruby 4.0.0**(`include/mruby/version.h`: `MRUBY_RUBY_VERSION "4.0"`、release 2026-04-20)。

```
Ruby ソース → パーサ(parse.y、生成器は tools/lrama)→ codegen
          → RiteVM bytecode(.mrb)→ レジスタVM(src/vm.c)で実行
```

- **VM**: `src/vm.c` のレジスタマシン。`mrbc` が吐く bytecode は C ソースにも埋め込める
- **GC**: **Tri-color incremental Mark & Sweep + 世代別(generational)モード**(`src/gc.c` で明記)。インクリメンタルなので**停止時間を抑える**設計 = 組込み/リアルタイム寄りに有利
- **src/**: vm.c / gc.c / class.c / string.c / hash.c / array.c / proc.c / symbol.c … コア一式
- **mrblib/**: stdlib の一部を **Ruby 自身で実装**(約 10 ファイル)

## モジュールとビルド(確認版)

- **mrbgems**: 約 **60** 個同梱。`mruby`/`mirb`/`mrbc`/デバッガ等の**バイナリ自体も gem**(mruby-bin-*)として構成され、要否を選べる
- **ビルド**: Rake ベース(`Rakefile` + `minirake`)+ **`build_config/` のプリセット**。プリセットの顔ぶれが組込み志向を物語る — Android / Emscripten(WASM)/ Nintendo Switch・Wii / PSP / Dreamcast / DOS / Serenity …
- 単一ファイル化(amalgamation)で C プロジェクトへの取り込みも容易

## ツールと仕組み

- **`mruby`** — インタプリタ、**`mirb`** — 対話シェル(REPL)、**`mrbc`** — Ruby → bytecode コンパイラ
- `mrbc` は **bytecode を C ソースとして出力**できる → ビルドに埋め込んでスクリプトを同梱
- **mrbgems** — モジュール機構。機能を gem 単位で足し引きしてサイズ/機能を調整
- **Amalgamation(単一ファイルビルド)** — 1 ファイルにまとめて組込みしやすく

## なぜ重要か

「**設定/拡張のスクリプト言語を、リソース制約のある C 製プロダクトに埋める**」用途の定番。IoT・組込み・ゲーム・サーバ拡張(例: Web サーバの設定 DSL)などで、フル Ruby を積めない所に Ruby の書き味を持ち込める。

## Links

- [mruby/mruby (GitHub)](https://github.com/mruby/mruby) — 確認版 `72e5ebed55b672bdff413270022c8398465c2479`(2026-06-01)
- [mruby 公式](https://mruby.org/)

## 関連

- [[mruby]] — 技術詳細でなく「位置づけ・設計思想」を扱う概念ノート(本ノートの対)
- [[ruby]] — 本家(CRuby/MRI)。mruby はその軽量・組込み版
- [[stack-oriented-programming]] — mruby の RiteVM はレジスタマシン。YARV(スタック)との対比
- [[build-caching]] — `mrbc` の bytecode 事前生成は「事前コンパイルして埋める」発想の一種
