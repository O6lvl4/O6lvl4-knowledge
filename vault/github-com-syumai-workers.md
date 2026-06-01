---
title: github.com/syumai/workers
tags: [edge-computing, webassembly, go]
created_at: 2026-06-01
updated_at: 2026-06-01T16:14:40+09:00
---

**標準の `net/http` ハンドラを Cloudflare Workers 上で動かす** Go パッケージ(syumai 作)。[[go-on-cloudflare-workers|Go を Workers で動かす]]の定番実装で、Go→WASM 化と JS グルーを隠蔽し、**既存の Go HTTP コードがほぼそのまま**エッジで動くようにする。experimental と明記。

## 何をしているか(中核)

Workers の **FetchEvent を Go の `http.Handler` に橋渡し**するのが本質。

```go
func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "hello")
    })
    workers.Serve(nil)          // or workers.Serve(handler)
}
```

裏側の流れ(syumai/workers が隠す部分):

```
JS エントリが fetch を受ける
  → wasm を instantiate
  → JS の Request を Go の *http.Request に変換して export 関数を呼ぶ
  → Go が書いた http.ResponseWriter を JS の Response に戻す
```

→ `chi` / `gorilla/mux` / 標準 `ServeMux` など**既存ルータがそのまま乗る**のが嬉しさ。WASM が外界に繋がれない問題([[wasm-core]])を、この変換層で吸収している。

## どうやって JS と話すか(syscall/js)

Go の wasm(`GOOS=js`)は **`syscall/js`** パッケージで JS の値を掴み・呼べる。これが唯一の JS↔Go の通路で、syumai/workers は **Cloudflare ランタイムの JS オブジェクト(Request / Response / `env` のバインディング)を `syscall/js` 越しにラップ**し、Go の型に見せている。

```
[JS shim (.mjs エントリ)]
  - wasm_exec ランタイム(標準 Go / TinyGo 版)で wasm を instantiate
  - fetch/scheduled/queue ハンドラを wasm の export に配線
  - env(KV/R2/D1…)を Go から触れるよう globalThis 等に公開
        ↕ syscall/js
[Go (wasm)]
  - js.Value で Request を読み、Response を組み立てる
  - cloudflare サブパッケージが env バインディングを Go API でラップ
```

要件は **Go 1.24.0+**。バインディング実装は `github.com/syumai/workers/cloudflare/...` サブパッケージ群に分かれている(core の `workers` が Serve/ハンドラ、`cloudflare/*` が KV・R2・D1 等)。

## 非同期 I/O の橋渡し

Cloudflare のバインディング(KV/R2/fetch…)は JS 側で **Promise** を返す。Go の wasm はそれを **`syscall/js` のコールバック → Go チャネルで待つ**定石で同期的なコードに見せる(ライブラリが隠蔽)。goroutine は [[v8-isolates|isolate]] の**単一スレッド上で協調スケジューリング**され、OS スレッド並列は無いが、Promise 待ち中に他 goroutine は進める。

## HTTP 以外のハンドラ

| 機能 | 用途 |
|---|---|
| **FetchEvent** | HTTP リクエスト処理(中核) |
| **Cron Triggers** | スケジュール実行(scheduled handler) |
| **Queues** | Producer / Consumer |
| **TCP Sockets** | 外部への TCP 接続 |

## Cloudflare バインディングへの Go API

JS バインディングを Go から叩けるよう薄くラップしている。

| バインディング | 対応 |
|---|---|
| **KV** | Get / List / Put / Delete |
| **R2** | Head / Get / Put / Delete / List |
| **Cache API** | 対応 |
| **Durable Objects** | stub 呼び出し |
| **D1** | alpha 段階 |
| 環境変数 | 対応 |

## ビルド/デプロイ

- `npm create cloudflare@latest` のテンプレート(`_templates/cloudflare/worker-go` / `worker-tinygo`)から初期化
- `go mod init` → `npm start`(開発)→ ビルドで Go→WASM → `wrangler` でデプロイ
- **標準 Go か TinyGo を選択** — 依存が多い標準 Go は WASM サイズ上限(無料 3MB / 有料 10MB)に当たりやすく、その場合 **TinyGo 推奨**([[go-on-cloudflare-workers]] 参照)

## いつ使うか(代替との比較)

| 選択肢 | 向くケース | 弱み |
|---|---|---|
| **syumai/workers**(Go+wasm) | 既存 Go 資産・型・ライブラリをエッジへ。net/http コードを再利用 | wasm サイズ→コールドスタート、JS↔wasm 境界、experimental |
| 素の JS/TS Worker | 最小コールドスタート・最小サイズ・公式サポート | Go 資産は使えない |
| Go の WASI 経路(`GOOS=wasip1`) | WASI システムコール前提のコード | Workers の WASI は実験的、バインディング統合が薄い |

→ 「**Go で書きたい/既存 Go を載せたい**」が動機なら syumai/workers、純粋に速さ・軽さ最優先なら素の JS。

## 注意点

- **experimental** — API は変わりうる
- **コールドスタート** — isolate ごとに wasm を instantiate するため、サイズが初回起動に直結。TinyGo + `wasm-opt`([[dead-code-elimination|DCE]])で削る
- サイズ制約 → 大依存は TinyGo を検討
- [[v8-isolates|isolate]] の制約(単一スレッド・サイズ=コールドスタート)は当然そのまま受ける

## Links

- [syumai/workers (GitHub)](https://github.com/syumai/workers)

## 関連

- [[go-on-cloudflare-workers]] — 「Go を Workers で動かす」一般論。syumai/workers はその具体実装
- [[wasm-core]] — WASM は I/O を持たない。だから fetch→Go の変換層(グルー)が要る
- [[v8-isolates]] — Workers の実行基盤。本ライブラリもこの制約下で動く
- [[edge-platforms]] — Cloudflare Workers を含むエッジ実行環境
