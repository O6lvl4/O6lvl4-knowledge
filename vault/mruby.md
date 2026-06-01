---
title: mruby
tags: [ruby, language, embedded]
created_at: 2026-06-01
updated_at: 2026-06-01T22:18:15+09:00
---

「**大きな言語(Ruby)を、製品に組み込めるよう小さく作り直す**」という発想の実装。フル機能より**フットプリントと埋め込み性**を優先し、Ruby の書き味を C 製プロダクトやリソース制約環境に持ち込む。実装・ソース・確認 commit は [[github-com-mruby-mruby]]、ここは**位置づけと設計思想**を扱う。

## Ruby 実装の地図

「Ruby」は1つの実装ではない。ホスト環境と狙いで分かれる。

| 実装 | ホスト/VM | 性格 | 向く先 |
|---|---|---|---|
| **CRuby / MRI**(参照実装) | C / YARV(スタックVM) | 完全・標準。エコシステム本流 | 一般のアプリ・[[rails\|Rails]] |
| **JRuby** | JVM | 真の並列(GIL なし)・Java 連携 | JVM 資産と統合 |
| **TruffleRuby** | GraalVM | JIT で高速 | 実行速度重視 |
| **mruby** | C / **RiteVM(レジスタVM)** | **最小・組込み第一** | IoT・ゲーム・サーバ拡張・設定 DSL |

mruby は「速さ」でも「フル機能」でもなく、**埋め込みやすさ・小ささ**の軸を取りに行った実装。

## 設計思想: 言語を「部品」として設計する

mruby の核心は、**言語処理系をライブラリとして製品に積む**こと。だから:

- **bytecode 事前コンパイル**(`mrbc`)— スクリプトを RiteVM bytecode にして配布・同梱。起動が軽く、ソースを出さずに済む
- **mrbgems** — 機能を gem 単位で取捨し、必要最小の処理系に絞れる
- **レジスタVM(RiteVM)** — CRuby/YARV の[[stack-oriented-programming|スタックVM]]と対照的な設計選択

汎用性より**制御可能性(サイズ・依存・埋め込み境界を握れること)**を優先している。

## 一般化: 軽量・組込み実装の系譜

- [[tinygo|TinyGo]] と同型 — **Go:TinyGo = Ruby:mruby**。汎用言語を削って制約環境向け軽量実装を作る戦略。
- さらに広く見ると「**言語を組み込み可能なライブラリにする(embeddable language)**」系譜で、その原型は Lua。アプリに**スクリプト拡張点**を与える設計思想に連なる。

## 関連

- [[github-com-mruby-mruby]] — 技術詳細・ソース・確認 commit(本ノートの実装側)
- [[ruby]] — 本家 CRuby/MRI。mruby はその軽量・組込み版
- [[tinygo]] — 同型の戦略(Go の軽量実装)。Go:TinyGo = Ruby:mruby
- [[stack-oriented-programming]] — RiteVM はレジスタマシン。YARV(スタックVM)との対比
- [[constraints-liberate]] — フル機能を捨てて組込み性/小ささを買うトレードオフ
