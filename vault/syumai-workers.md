---
title: syumai/workers
tags: [edge-computing, webassembly, go]
created_at: 2026-06-01
updated_at: 2026-06-01T16:05:48+09:00
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

## 注意点

- **experimental** — API は変わりうる
- サイズ制約 → 大依存は TinyGo を検討
- [[v8-isolates|isolate]] の制約(単一スレッド・サイズ=コールドスタート)は当然そのまま受ける

## Links

- [syumai/workers (GitHub)](https://github.com/syumai/workers)

## 関連

- [[go-on-cloudflare-workers]] — 「Go を Workers で動かす」一般論。syumai/workers はその具体実装
- [[wasm-core]] — WASM は I/O を持たない。だから fetch→Go の変換層(グルー)が要る
- [[v8-isolates]] — Workers の実行基盤。本ライブラリもこの制約下で動く
- [[edge-platforms]] — Cloudflare Workers を含むエッジ実行環境
