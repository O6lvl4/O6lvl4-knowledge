---
title: github.com/tinygo-org/tinygo
tags: [go, compiler, webassembly]
created_at: 2026-06-01
updated_at: 2026-06-01T21:58:30+09:00
---

**「小さな場所」向けの Go コンパイラ** — マイクロコントローラ、WebAssembly(wasm/wasi)、CLI ツールが対象。Go 公式の `gc` コンパイラの代わりに、**Go のフロントエンド資産 + [[wasm-core|LLVM]] バックエンド**で、はるかに**小さいバイナリ**を吐く。[[github-com-syumai-workers|syumai/workers]] が Cloudflare Workers 用に使うのもこれ。

> 確認版: commit `f5d0ec93ef0e2cdca902f64e6faea198b8365cb5`(2026-06-01)。

## 公式 Go との違い

| | 公式 Go (`gc`) | **TinyGo** |
|---|---|---|
| バックエンド | 独自 | **LLVM** |
| バイナリサイズ | 大(数 MB〜) | **小**(KB〜)。組込み/WASM 向き |
| 対象 | サーバ/デスクトップ | **MCU・WASM/WASI・CLI** |
| 互換性 | 完全 | **サブセット**(reflect 制限・一部 stdlib 非対応) |
| goroutine | OS スレッド + ランタイム | 独自スケジューラ(協調的) |
| GC | 並行 GC | 選択式(conservative / leaking / none 等) |

→ 「**完全な Go 互換を犠牲に、サイズと組込み性を買う**」トレードオフ。[[constraints-liberate|制約と引き換えに別の自由(小ささ)を得る]]構図。

## 2つの用途

- **組込み(Embedded)**: `machine` パッケージで GPIO/LED/UART/I2C 等を直接叩く。多数のボードを `-target=` で指定。
- **WebAssembly**: ブラウザ(WASM)+ サーバ/エッジ(WASI)。Fastly Compute・Fermyon Spin・wazero 等で動く。`//go:wasmexport` で関数を公開。

```go
//go:wasmexport add
func add(a, b int32) int32 { return a + b }
```
```
tinygo build -buildmode=c-shared -o add.wasm -target=wasip1 add.go
```

## なぜ重要か

Go の型・言語資産を**サイズ制約の厳しい場所**(MCU・エッジ WASM)に持ち込める唯一級の経路。[[go-on-cloudflare-workers|Cloudflare Workers で Go]] を動かす際に標準 Go の wasm が大きすぎる問題([[v8-isolates|isolate]] のサイズ上限)を、TinyGo の小型バイナリが解く。

## Links

- [tinygo-org/tinygo (GitHub)](https://github.com/tinygo-org/tinygo) — 確認版 `f5d0ec93ef0e2cdca902f64e6faea198b8365cb5`(2026-06-01)
- [TinyGo 公式](https://tinygo.org/)

## 関連

- [[tinygo]] — 技術詳細でなく「位置づけ・設計思想」を扱う概念ノート(本ノートの対)
- [[github-com-syumai-workers]] — Workers 用に TinyGo で wasm を吐く定番ライブラリ
- [[go-on-cloudflare-workers]] — TinyGo がサイズ問題を解く文脈
- [[wasm-core]] — 出力先の WASM。LLVM 経由でコンパイル
- [[wasi]] — サーバ/エッジ向けターゲット(`wasip1`)
- [[dead-code-elimination]] — さらにサイズを削る(`wasm-opt`)
- [[constraints-liberate]] — 完全互換を捨てて小ささを買うトレードオフ
