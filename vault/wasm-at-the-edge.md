---
title: WASM at the Edge
tags: [edge-computing, webassembly, wasm, runtime]
created_at: 2026-05-24
updated_at: 2026-05-24
srs_state: new
card_count: 12
reviewed_count: 0
next_due: 2026-05-24
---

WebAssembly を [[edge-computing|Edge Computing]] の実行モデルとして使うアプローチ。[[v8-isolates|V8 Isolates]] と並ぶ Edge の二大実行モデルの一つ。AOT コンパイルによる 35-50μs の Cold Start、リニアメモリによる構造的なセキュリティ分離、言語非依存性が技術的優位。Fastly Compute が先駆者で、Akamai の Fermyon 買収 (2025) によりエンタープライズ採用が加速。

## なぜ Edge で WASM か

| 優位性 | 詳細 |
|---|---|
| Cold Start | 35-50μs (AOT)。V8 Isolates (0.4ms) より桁違いに速い |
| バイナリサイズ | 2-5MB。Docker イメージ (100-200MB) の 50-75x 小さい |
| セキュリティ | リニアメモリによるサンドボックス。リクエスト間でメモリ非共有 → 情報漏洩を構造的に排除 |
| 言語非依存 | Rust, C/C++, Go, JS, Python。WASM にコンパイルできる任意の言語 |
| 予測可能な性能 | AOT コンパイル → JIT warmup / deoptimization なし。p99 レイテンシの分散が小さい |

Solomon Hykes (Docker 共同創設者): "If WASM+WASI existed in 2008, we wouldn't have needed to create Docker." ただし2026年現在は「置換」ではなく「補完」。

## V8 Isolates との比較

| 特性 | WASM (Wasmtime) | V8 Isolates (Cloudflare) |
|---|---|---|
| Cold Start | 35-50μs | 0.4ms (p50) |
| 隔離モデル | リクエストごとに独立リニアメモリ | 共有 V8 内の Isolate |
| クロスリクエスト漏洩 | 構造的に不可能 | 理論的に可能 (共有ランタイム) |
| 言語 | 言語非依存 | JS/TS ネイティブ + WASM |
| JIT | なし (AOT) | あり (段階的コンパイル) |
| 開発体験 | Rust 中心。JS は二級 | JS/TS + npm 直接利用 |

Cloudflare は V8 内で WASM を実行する「ハイブリッド」を採用。Workers デプロイの 34% が WASM を含む (2023: 12%)。V8 を捨てるのではなく共存する方向。

## 主要プラットフォーム

### Fastly Compute

WASM-native Edge の先駆者。Wasmtime ベース (元は独自の Lucet → Wasmtime に統合)。

| 項目 | 値 |
|---|---|
| ランタイム | Wasmtime (Bytecode Alliance) |
| Cold Start | 35-50μs (AOT プリコンパイル) |
| PoP | 90+ |
| 言語 | Rust, Go, JS (StarlingMonkey) |
| CPU 時間 | 50ms/リクエスト |
| メモリ | 128MB/実行 |
| パッケージ上限 | 100MB/サービス |

Cold Start が速い理由:
1. AOT プリコンパイルで実行時コンパイルをクリティカルパスから除去
2. Pooling Allocator でインスタンス化を高速化
3. per-request isolation: リクエストごとに新しいサンドボックスを起動

### Cloudflare Workers での WASM

V8 エンジン内の WASM 実行パスを使用。workerd (OSS ランタイム) が基盤。

- WASM 利用率: 34% (2025)。用途: データ変換 (28%)、暗号処理 (22%)、画像処理 (19%)
- Pyodide (Python on WASM): CPython を WASM にポート。NumPy, Pandas 等の C 拡張もサポート
- 2026年: Dynamic Worker Loader がオープンベータ。AI 生成コードの実行サンドボックス

### Fermyon Spin (Akamai)

Component Model を全面採用した WASM FaaS。2025年に Akamai が買収。

- Spin 3.0 (2025年2月): Component Dependencies (多言語コンポーネント統合)、Selective Deployments、OpenTelemetry
- SpinKube: Kubernetes 上で Spin アプリを実行。CNCF に移管
- デフォルト制限: メモリ 128MiB、アプリ 50MiB、ハンドラ 30秒

### その他

| プラットフォーム | 特徴 |
|---|---|
| Wasmer Edge | WASIX (WASI の POSIX 拡張) ベース。マイクロ秒起動 |
| wasmCloud | CNCF Incubating。NATS メッセージングバックボーン |
| WasmEdge | CNCF Sandbox。Edge AI 特化 (WASI-NN, TensorFlow Lite, llama.cpp) |

## WASI (WebAssembly System Interface)

WASM にシステムリソースへのアクセスを提供する標準インターフェース。Bytecode Alliance が主導。

### Preview 1 vs Preview 2

| 特性 | Preview 1 (2019) | Preview 2 / WASI 0.2 (2024) |
|---|---|---|
| API 設計 | フラットな POSIX-like 関数群 | Component Model ベースの「worlds」 |
| ネットワーキング | なし | wasi-sockets (TCP/UDP), wasi-http |
| 構成単位 | Core Module | Component |
| Rust ターゲット | `wasm32-wasip1` | `wasm32-wasip2` |

Preview 1 の最大の問題: ネットワーキングの欠如。HTTP サーバすら構築できなかった。

### Component Model

WASM モジュールを LEGO ブロックのように組み合わせ可能にする仕様。

- 高レベルのデータ型 (文字列、構造体、リスト) を直接やりとり
- 言語間の相互運用 (Rust コンポーネント + Go コンポーネント)
- deny-by-default のケーパビリティ付与
- OCI レジストリを通じたコンポーネント配布

WIT (WebAssembly Interface Types) がインターフェース定義言語:

```wit
package my:app;

world edge-handler {
  import wasi:http/types@0.2.0;
  export wasi:http/incoming-handler@0.2.0;
}
```

### WASI Preview 3 (策定中)

フォーカス: async I/O。2026年中〜2027年にかけて策定予定。

- ネイティブ非同期サポート
- スレッド対応ランタイム
- `wasi-http` のコンポーネントモデルチェーニング
- Wasmtime 37+ でプレビュー利用可能
- 最終的な WASI 1.0 は 2026年末〜2027年初頭が目標

## ランタイム比較

| ランタイム | Cold Start | 実行時間 | メモリ | 特徴 |
|---|---|---|---|---|
| Wasmtime | 5.2ms | 10.4ms | 15MB | 標準準拠。Component Model リーダー。Fastly の基盤 |
| Wasmer | 6.8ms | 12.1ms | 12MB | WASIX 独自拡張。JIT/AOT |
| WasmEdge | 8.1ms | 15.3ms | 8MB | Edge AI 特化。最小メモリ |
| Wazero | 4.5ms | 18.7ms | - | Pure Go。CGO 不要 |
| Wasm3 | 2.1ms | 45.2ms | - | インタプリタ。最速起動 |

## Rust/Almide → WASM → Edge パイプライン

Almide の自然なパス: `*.almd` → Almide コンパイラ → `*.rs` → cargo-component → `*.wasm`

### ビルドとデプロイ

```bash
# Preview 2 / Component Model (推奨)
cargo install cargo-component
cargo component new my-edge-app
cargo component build --release

# サイズ最適化
wasm-opt -Oz target/wasm32-wasip2/release/app.wasm -o app.opt.wasm

# Fastly Compute へデプロイ
fastly compute build && fastly compute deploy

# Fermyon Spin (Akamai) へデプロイ
spin build && spin deploy

# SpinKube (Kubernetes) へデプロイ
spin registry push ghcr.io/org/app:latest
kubectl apply -f spinapp.yaml
```

バイナリサイズと [[dead-code-elimination|DCE]]: WASM の明示的なインポート/エクスポート構造により DCE がネイティブバイナリより効果的。`wasm-opt -Oz` で典型的に 10-30% 削減。Edge の Cold Start はバイナリサイズに直結するため、DCE の質がそのままユーザー体験に影響する。

## ユースケース

| 分野 | Workers での利用率 | 詳細 |
|---|---|---|
| データ変換 | 28% | JSON/XML 変換、データパイプライン |
| 暗号処理 | 22% | JWT 検証、HMAC、暗号化/復号化 |
| 画像処理 | 19% | リサイズ、フォーマット変換、圧縮 |
| ML 推論 | 成長中 | WASI-NN (ONNX, TF Lite, llama.cpp) |
| プラグインシステム | - | サードパーティコードの安全な実行 (Figma, Shopify) |
| マルチテナント SaaS | - | 高密度 (数千インスタンス/マシン) でテナント隔離 |

## 課題と制限

| 課題 | 詳細 |
|---|---|
| スレッド不在 | WASI にネイティブスレッディングなし。並列計算、DB、高スループット処理が制約。Preview 3 待ち |
| デバッグの未熟さ | スタックトレース不透明、IDE 統合限定的、成熟した APM なし。コンテナに10年遅れ |
| Rust 以外のツールチェーン | Rust は洗練されているが他言語は二級市民。Java は公式 WASM ターゲットなし (2026年初頭) |
| 仕様チャーン | WASI Preview 間の API 名・crate 名の変更。エンタープライズの躊躇を招く |
| JS 相互運用コスト | JS-WASM 境界越えのマーシャリングオーバーヘッド。小関数は純 JS より遅い |
| ステートフルの困難 | スレッド不在 + 永続化 API の未成熟 |

「三年間の almost ready」問題: Edge FaaS とプラグインサンドボックスでは成功。ステートフルサービスと汎用バックエンドには不向き。

## 市場動向 (2025-2026)

- Cloudflare Workers の 34% が WASM 含む (2023: 12%)
- Akamai が Fermyon 買収 → エンタープライズ採用の正当性確立
- Docker Desktop 4.15+ が WASM ランタイムをプラグインサポート
- SpinKube + wasmCloud が CNCF で進行。KubeCon 2025 で WasmCon トラック
- WebAssembly 3.0 が W3C 標準化 (2025年9月: WasmGC, 例外処理, tail calls 等)
- ただし Component Model は 3.0 に含まれず。「Docker moment」は未達成

## 押さえどころ（カード化候補）

- WASM at the Edge の3つの優位性 → AOT コンパイルで 35-50μs Cold Start (V8 の 0.4ms より桁違い)、リニアメモリでリクエスト間情報漏洩を構造的に排除、言語非依存 (WASM にコンパイルできる任意の言語)
- Fastly Compute の Cold Start が速い理由 → AOT プリコンパイルで実行時コンパイルをクリティカルパスから除去。Pooling Allocator でインスタンス化を高速化。per-request isolation でリクエストごとに新しいサンドボックスを起動
- WASM vs V8 Isolates のセキュリティ差 → WASM はリクエストごとに独立リニアメモリで情報漏洩が構造的に不可能。V8 は共有ランタイムモデルで理論的に漏洩リスクがあり、V8 Sandbox + PKU で対策
- WASI Preview 1 vs Preview 2 の違い → P1 はフラットな POSIX-like 関数でネットワーキングなし。P2 は Component Model ベースで wasi-sockets/wasi-http を追加。構成単位が Core Module から Component に進化
- Component Model の価値 → 異なる言語のコンポーネントを型安全に結合。WIT でインターフェース定義、Canonical ABI でデータマーシャリング。OCI レジストリでコンポーネント配布
- Akamai + Fermyon の戦略的意味 → 世界最大の CDN が WASM FaaS を中核戦略に。エンタープライズ採用の正当性が確立。SpinKube で Kubernetes + WASM ハイブリッドが標準化方向
- WASM Edge の「三年間の almost ready」 → Edge FaaS とプラグインサンドボックスでは成功。ステートフルサービスと汎用バックエンドには不向き。スレッド不在、デバッグの未熟さ、Rust 以外の二級市民が課題
- DCE と WASM Edge の関係 → Edge の Cold Start はバイナリサイズに直結。WASM の明示的インポート/エクスポート構造で DCE が効果的に動作。wasm-opt -Oz で 10-30% 削減。DCE の質がユーザー体験に直結
- Almide → WASM → Edge のパス → *.almd → Almide コンパイラ → *.rs → cargo-component → *.wasm → Edge デプロイ。Almide が WASM ターゲットを持つことで Edge ランタイム上で直接実行可能
- WASM ランタイムの使い分け → Wasmtime: 標準準拠・Component Model リーダー。WasmEdge: Edge AI 特化・最小メモリ。Wasmer: WASIX 独自拡張で即時利用性重視。Wazero: Pure Go で CGO 不要
- WASI Preview 3 の重要性 → async I/O のネイティブサポート。現在の同期的ブロッキング設計の最大のボトルネックを解消。スレッド対応も。2026年末〜2027年初頭に WASI 1.0 として安定化予定
- V8 を WASM が置換する可能性 → 短期的には共存 (Cloudflare は V8 内で WASM 実行)。長期的には Component Model + WASI 1.0 の成熟で JS 不要のワークロードが V8 を迂回する可能性。ただし JS エコシステムの巨大さで完全置換は非現実的

## Links

- [Fastly Compute](https://www.fastly.com/products/edge-compute)
- [Wasmtime (Bytecode Alliance)](https://wasmtime.dev/)
- [Fermyon Spin (Akamai)](https://www.fermyon.com/spin)
- [SpinKube](https://www.spinkube.dev/)
- [WASI Roadmap](https://wasi.dev/roadmap)
- [Bytecode Alliance](https://bytecodealliance.org/)
- [Component Model Spec](https://github.com/WebAssembly/component-model)

## 関連

- [[v8-isolates]] — WASM と並ぶ Edge の二大実行モデル。Cloudflare は V8 内で WASM を実行するハイブリッド
- [[edge-computing]] — WASM at the Edge の全体的な位置づけ
- [[wasm-simd]] — Edge での WASM 実行に関連する SIMD 最適化
- [[dead-code-elimination]] — WASM バイナリサイズと Edge Cold Start の関係
- [[swiss-table]] — hashbrown は WASM では SIMD 不使用 (ポータブル fallback)
