---
title: Go を Cloudflare Workers で動かす
tags: [edge-computing, webassembly, go]
created_at: 2026-06-01
updated_at: 2026-06-01T15:34:16+09:00
---

Cloudflare Workers は [[v8-isolates|V8 isolate]] 上で **JS と WASM** を動かす実行系で、ネイティブな Go ランタイムは持たない。だから「Workers で Go」= **Go を WASM にコンパイルし、JS グルーから呼ぶ**こと。実用上の定番は **TinyGo + [syumai/workers]**。

## なぜそのまま動かないか / なぜ TinyGo か

WASM は I/O の標準インターフェースを持たない。fetch イベント・ネットワーク・KV などは **JS 側で受けて wasm の export 関数を呼ぶ(または wasm が import する)**しかない。そしてサイズの壁:

| | 標準 Go (`go build`) | **TinyGo** |
|---|---|---|
| wasm 出力 | GC + ランタイム同梱で**大きい**(数 MB) | 専用の小型ランタイムで **~1MB 以下** |
| Workers サイズ上限 | 無料 ~3MB / 有料 10MB(gzip 後)に当たりやすい | 余裕で収まる |
| プラン | 大依存だと**有料前提** | 無料でも可 |
| 互換性 | Go 標準ライブラリほぼ全部 | 一部制限(reflect・net 等に制約) |

→ Workers の**バンドルサイズ上限**が効くので、ほぼ **TinyGo 一択**。サイズはそのまま [[v8-isolates|isolate]] のコールドスタート/コストにも響く。

## 2つの経路

1. **syumai/workers(デファクト)** — `net/http` 風のハンドラを Go で書き、TinyGo で wasm 化、`wrangler` + JS グルーでデプロイ。**D1 / KV / R2 などの Cloudflare バインディングに Go の API でアクセス**できる。テンプレ `worker-tinygo` 推奨。
   ```go
   // syumai/workers: net/http ハンドラがそのまま動く
   func main() {
       http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
           fmt.Fprintln(w, "Hello from Go on Workers")
       })
       workers.Serve(nil) // JS グルーが fetch を Go ハンドラへ橋渡し
   }
   ```
2. **WASI 経路** — Cloudflare が [[wasi|WASI]] の(実験的)対応を追加。Go 1.21+ の `GOOS=wasip1 GOARCH=wasm` や TinyGo の wasi ターゲットで、ファイル/標準入出力など WASI システムコールを使うコードを載せられる。

## 仕組み(なぜグルーが要るか)

```
fetch イベント(JS) → JS グルーが wasm を instantiate → export 関数を呼ぶ
            ↑ KV/R2/D1 などのバインディングも JS 経由で wasm に import
```

WASM 単体は外界と繋がれない([[wasm-core|純粋な計算機械]])。syumai/workers はこの **JS↔wasm の橋渡しを隠蔽**し、Go 側からは普通の HTTP サーバに見せている。

## 制約(理解して使う)

- **シングルスレッド** — isolate は1スレッド。Go の goroutine は協調スケジューリングで回るが、OS スレッド並列は無い。
- **サイズ = コスト** — wasm が大きいほどコールドスタート・課金に響く。TinyGo + `wasm-opt`([[dead-code-elimination|DCE]])で絞る。
- **境界オーバーヘッド** — JS↔wasm の値の受け渡しコスト。大量の小さな往復は不利。
- **標準ライブラリ制限** — TinyGo は reflect・一部 net 等に制約。重い依存は載らないことがある。

## なぜやるか

Go の**エコシステム・型安全・既存資産**をエッジに持ち込める。ただし「ネイティブ Go が動く」のではなく「**WASM + 制約環境(単一スレッド・JS 橋渡し・サイズ上限)**で動かす」と理解するのが肝。[[edge-wasm-landscape|エッジ/WASM ランドスケープ]]の「複数言語をエッジへ」という流れの Go 版。

## 押さえどころ（カード化候補）

- **本質** → Workers にネイティブ Go は無い。Go→WASM にして JS グルーから呼ぶ。定番は TinyGo + syumai/workers。
- **なぜ TinyGo** → 標準 Go の wasm は GC+ランタイムで数 MB、Workers のサイズ上限(無料3MB/有料10MB gzip)に当たる。TinyGo は ~1MB 以下。
- **2経路** → ①syumai/workers(net/http 風 + D1/KV/R2 バインディング)②WASI(`GOOS=wasip1` / TinyGo wasi、Cloudflare が実験対応)。
- **グルーが要る理由** → WASM は I/O 標準が無く、fetch/バインディングは JS で受けて wasm export を呼ぶ。syumai/workers が隠蔽。
- **制約** → 単一スレッド・サイズ=コールドスタート/コスト・JS↔wasm 境界オーバーヘッド・TinyGo の stdlib 制限。

## Links

- [syumai/workers — Go on Cloudflare Workers](https://github.com/syumai/workers)
- [Announcing experimental WASI on Cloudflare Workers](https://blog.cloudflare.com/announcing-wasi-on-workers/)
- [Cloudflare Workers — WebAssembly (Wasm) docs](https://developers.cloudflare.com/workers/runtime-apis/webassembly/)

## 関連

- [[v8-isolates]] — Workers の実行基盤。JS/WASM を isolate で動かす(プロセスでない軽量隔離)
- [[edge-platforms]] — Cloudflare Workers を含むエッジ実行環境の比較
- [[wasm-core]] — WASM は I/O を持たない純粋な計算機械。だから JS グルーが要る
- [[wasi]] — もう一方の経路。システムコールを wasm に与える標準
- [[edge-wasm-landscape]] — エッジ × WASM の全体像。本ノートはその Go 版の一例
- [[dead-code-elimination]] — wasm-opt 等でサイズを削る(サイズ=コールドスタート直結)
