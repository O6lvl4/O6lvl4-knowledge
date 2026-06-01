---
title: TinyGo
tags: [go, compiler, embedded, webassembly]
created_at: 2026-06-01
updated_at: 2026-06-01T22:18:05+09:00
---

「**Go を制約の厳しい場所で動かすために、互換性を一部捨てて作り直した代替コンパイラ**」という発想。マイコン・WASM・CLI のように**バイナリサイズと実行環境が厳しい**ターゲットを、Go の言語のまま狙う。実装・ソース・バージョンの事実は [[github-com-tinygo-org-tinygo]]、ここは**位置づけと設計思想**を扱う。

## Go コンパイラの地図

Go の実装は1つではない。狙いで棲み分ける。

| 実装 | バックエンド | 性格 | 向く先 |
|---|---|---|---|
| **gc**(公式) | 自前 | 高速ビルド・並行 GC・完全互換 | サーバ/デスクトップ |
| **gccgo** | GCC | GCC 最適化資産を利用 | 既存 GCC 環境 |
| **TinyGo** | **LLVM** | 極小バイナリ・サブセット | **MCU・WASM/WASI・CLI** |

公式 gc が「速く・完全に」なら、TinyGo は「**小さく・届く範囲を広げる**」方向に振った別実装。

## 設計思想: サブセット + 専用ランタイム

TinyGo の本質は「フル互換を目指さない」決断。**言語の一部機能(`reflect` 多用・一部 stdlib)を切り、ランタイム(goroutine スケジューラ・GC)をターゲット向けに作り替える**ことで、gc では数 MB になる出力を KB 級にする。

これは [[constraints-liberate|制約と引き換えに別の自由を得る]]典型 — **「どこでも動く完全互換」を捨て、「極小・組込み可能」という到達範囲を買う**。だから判断軸は明快:

- **向く**: マイコン(`machine` で GPIO 直叩き)、エッジ WASM([[go-on-cloudflare-workers|Workers]]・Fastly・Spin)、単一バイナリ CLI
- **向かない**: reflect 重用(多くの ORM/DI)・巨大依存のサーバアプリ → 公式 gc の領分

## 一般化: 「大きな言語を小さく作り直す」

TinyGo の戦略は Go 固有でない。**汎用言語の機能を削り、制約環境(組込み/エッジ)向けの軽量実装を別に作る**という反復するパターンで、Ruby に対する [[mruby]] と同型。汎用性を捨ててニッチを取りに行く、言語実装の一系譜。

## 関連

- [[github-com-tinygo-org-tinygo]] — 技術詳細・ソース・確認 commit(本ノートの実装側)
- [[mruby]] — 同型の戦略(Ruby の軽量・組込み実装)。Go:TinyGo = Ruby:mruby
- [[go-on-cloudflare-workers]] — TinyGo の小バイナリがエッジのサイズ制約を解く文脈
- [[wasm-core]] / [[wasi]] — 主要ターゲット
- [[constraints-liberate]] — 完全互換を捨ててサイズ/到達範囲を買うトレードオフ
