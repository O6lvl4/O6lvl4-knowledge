---
title: Edge / WebAssembly ランドスケープ
tags: [edge-computing, webassembly, meta]
created_at: 2026-05-24
updated_at: 2026-05-24
srs_state: new
card_count: 0
reviewed_count: 0
next_due: 2026-05-24
---

Edge Computing と WebAssembly エコシステムの全体構成を俯瞰するマップ。各ノートがどのレイヤーに属し、何と何が接続するかを示す。

## 全体アーキテクチャ

```mermaid
graph TB
    subgraph User["ユーザー / クライアント"]
        Browser["ブラウザ / モバイル"]
    end

    subgraph Network["ネットワーク層"]
        QUIC["[[quic-http3|QUIC / HTTP/3]]<br/>トランスポート"]
        Anycast["[[anycast-cdn|Anycast / CDN]]<br/>ルーティング + キャッシュ"]
    end

    subgraph Edge["Edge 実行層"]
        V8["[[v8-isolates|V8 Isolates]]<br/>JS/TS ランタイム"]
        WasmEdge["[[wasm-at-the-edge|WASM at the Edge]]<br/>WASM ランタイム"]
    end

    subgraph Runtime["ランタイム実装"]
        Wasmtime["[[wasmtime|Wasmtime]]<br/>リファレンスランタイム"]
    end

    subgraph Spec["仕様 / 標準"]
        CM["[[component-model|Component Model]]<br/>コンポーネント合成"]
        WASI["[[wasi|WASI]]<br/>システムインターフェース"]
        WinterTC["[[wintertc|WinterTC]]<br/>JS API 標準化"]
    end

    subgraph Data["データ層"]
        EdgeData["[[edge-data|Edge データストア]]<br/>KV / DO / D1 / R2"]
    end

    subgraph Org["組織"]
        BA["[[bytecode-alliance|Bytecode Alliance]]<br/>実装団体"]
    end

    Browser --> QUIC --> Anycast --> Edge
    V8 --> WinterTC
    WasmEdge --> Wasmtime --> CM --> WASI
    BA --> Wasmtime
    BA --> CM
    Edge --> Data
```

## レイヤー構成

```mermaid
graph TB
    subgraph App["アプリケーション層"]
        Patterns["設計パターン<br/>Middleware / SSR / A-B テスト / API Gateway"]
    end

    subgraph Platform["プラットフォーム層"]
        Platforms["Cloudflare Workers / Deno Deploy / Fastly Compute"]
    end

    subgraph Runtime["ランタイム層"]
        JS_RT["JS ランタイム<br/>V8 Isolates<br/>workerd / Deno"]
        WASM_RT["WASM ランタイム<br/>Wasmtime / Wasmer / WasmEdge"]
    end

    subgraph Spec["仕様 / 標準層"]
        JS_Spec["JS API 標準<br/>WinterTC (ECMA-429)"]
        WASM_Spec["Component Model<br/>合成の型システム"]
        WASI_Spec["WASI<br/>システム API"]
    end

    subgraph Data["データ層"]
        DataStore["KV / Durable Objects / D1 / R2 / Queues<br/>CAP / CRDT / 一貫性モデル"]
    end

    subgraph Net["ネットワーク層"]
        Network["Anycast + BGP → 最寄り PoP<br/>QUIC / HTTP/3 → 0-RTT"]
    end

    subgraph Sec["セキュリティ層"]
        Security["DDoS / WAF / TLS 終端 / Zero Trust / Bot"]
    end

    subgraph Foundation["判断フレームワーク"]
        Decide["Edge Computing とは<br/>Edge vs Cloud vs On-premise"]
    end

    App --> Platform
    Platform --> Runtime
    JS_RT --> JS_Spec
    WASM_RT --> WASM_Spec --> WASI_Spec
    Runtime --> Data
    Data --> Net
    Net --> Sec
    Sec --> Foundation
```

## WASM 仕様の階層

Component Model がどこに位置するかを明確にする。

```mermaid
graph BT
    Core["Core WebAssembly Spec<br/>バイトコード, 線形メモリ, 数値型のみ<br/>(W3C Standard)"]
    CM["[[component-model|Component Model]]<br/>WIT + Canonical ABI + Share-Nothing<br/>Core Module を型安全に結合<br/>(W3C Proposal)"]
    WASI["[[wasi|WASI]]<br/>wasi:http, wasi:filesystem, wasi:sockets 等<br/>Component Model の上に定義された API 群<br/>(W3C WASI Subgroup)"]
    App["アプリケーション<br/>Edge ハンドラ, プラグイン, マイクロサービス"]

    Core --> CM
    CM --> WASI
    WASI --> App
```

| 層 | 何を定義するか | 誰が策定 | 状態 |
|---|---|---|---|
| Core Wasm | バイトコード、線形メモリ、4つの数値型 | W3C | Standard (3.0, 2025年9月) |
| [[component-model]] | WIT (IDL) + Canonical ABI + メモリ隔離。Core Module を型安全に結合 | W3C Proposal | 実装済 (Wasmtime)、標準化途中 |
| [[wasi]] | Component Model 上のシステム API (http, fs, sockets 等) | W3C WASI Subgroup | P2 安定、P3 RC、1.0 は 2026末-2027 |

ポイント: Component Model は WASI ではない。WASI は Component Model の「ユーザー」。Component Model はプラグインシステムや多言語ライブラリ共有にも WASI なしで使える。

## 標準化組織の役割分担

```mermaid
graph LR
    W3C["W3C WebAssembly CG<br/>「何を標準にするか」<br/>Core Wasm / Component Model / WASI 仕様"]
    BA["[[bytecode-alliance|Bytecode Alliance]]<br/>「どう実装するか」<br/>Wasmtime / Cranelift / cargo-component"]
    WTC["[[wintertc|Ecma TC55 (WinterTC)]]<br/>JS ランタイム間の API 標準化<br/>ECMA-429"]
    CNCF["CNCF<br/>クラウドネイティブプロジェクト<br/>SpinKube / wasmCloud"]

    W3C -->|"仕様"| BA
    BA -->|"実装フィードバック"| W3C
    WTC -.->|"補完関係"| BA
    BA -->|"プロジェクト寄贈"| CNCF
```

## JS ランタイム vs WASM ランタイム

```mermaid
graph TB
    subgraph JS["JS ランタイム (V8 ベース)"]
        CF["Cloudflare Workers<br/>workerd / 335+ PoP"]
        Deno["Deno Deploy<br/>6 リージョン"]
        Vercel["Vercel Edge<br/>126 PoP"]
    end

    subgraph WASM_RT["WASM ランタイム"]
        Fastly["Fastly Compute<br/>Wasmtime / ~80 PoP"]
        Spin["Fermyon Spin (Akamai)<br/>Wasmtime / 4100+ PoP"]
    end

    subgraph Hybrid["ハイブリッド"]
        CFW["Cloudflare Workers<br/>V8 内で WASM も実行<br/>34% が WASM 含む"]
    end

    JS ---|"[[wintertc]] で API 標準化"| JS
    WASM_RT ---|"[[wasi]] + [[component-model]] で標準化"| WASM_RT
```

## データフロー: リクエストの旅

```mermaid
sequenceDiagram
    participant User as ユーザー (東京)
    participant DNS as DNS
    participant BGP as BGP Anycast
    participant PoP as 東京 PoP
    participant Worker as Edge Worker
    participant Store as Edge Store
    participant Origin as Origin

    User->>DNS: DNS クエリ
    DNS-->>User: Anycast IP
    User->>BGP: HTTPS (QUIC/H3)
    BGP->>PoP: 最寄り PoP にルーティング
    PoP->>PoP: TLS 終端
    PoP->>PoP: キャッシュ確認
    alt キャッシュヒット
        PoP-->>User: 即応答 (< 10ms)
    else キャッシュミス
        PoP->>Worker: V8 Isolate or WASM 実行
        Worker->>Store: KV / D1 / DO アクセス
        Store-->>Worker: データ
        alt Origin 不要
            Worker-->>PoP: Edge で処理完結
        else Origin 必要
            Worker->>Origin: fetch (Neon/外部 DB)
            Origin-->>Worker: レスポンス
        end
        PoP-->>User: レスポンス
    end
```

## Almide → Edge パイプライン

```mermaid
graph LR
    Almide["*.almd<br/>Almide ソース"]
    Rust["*.rs<br/>Rust コード"]
    Component["*.wasm<br/>Component"]
    Edge["Edge デプロイ"]

    Almide -->|"Almide コンパイラ"| Rust
    Rust -->|"cargo-component<br/>wasm32-wasip2"| Component
    Component -->|"spin deploy<br/>fastly compute deploy"| Edge

    WIT["WIT 定義<br/>wasi:http/incoming-handler"]
    WIT -.-> Component

    DCE["[[dead-code-elimination|DCE]]<br/>wasm-opt -Oz"]
    DCE -.->|"バイナリサイズ → Cold Start"| Component

    RI["[[region-inference|Region Inference]]<br/>+ [[perceus|Perceus]]"]
    RI -.->|"GC なしメモリ管理"| Rust
```

## メモリ管理戦略の位置づけ

```mermaid
graph LR
    subgraph Static["コンパイル時決定"]
        Rust_OW["Rust 所有権"]
        RI["[[region-inference|Region Inference]]<br/>リージョン単位一括解放"]
    end

    subgraph Runtime["実行時決定"]
        Perceus_RC["[[perceus|Perceus]]<br/>RC + reuse (alloc/free ゼロ)"]
        GC["GC<br/>(tracing, generational)"]
    end

    subgraph Hybrid_Mem["ハイブリッド"]
        Bump["Bump Allocator<br/>+ リージョンスコープ<br/>(Almide の現在の実装)"]
    end

    Rust_OW -.->|"影響"| RI
    RI -.->|"理論的基盤"| Bump
    Perceus_RC -.->|"reuse の精神"| Bump
```

## ノート間の関連マップ

| ノート | 属するレイヤー | 主な接続先 |
|---|---|---|
| [[edge-computing]] | 概念 | 全ノートの起点 |
| [[edge-vs-cloud-vs-onprem]] | 判断 | edge-computing |
| [[v8-isolates]] | ランタイム | edge-platforms, wintertc |
| [[wasm-at-the-edge]] | ランタイム | wasmtime, wasi, component-model |
| [[wasmtime]] | ランタイム実装 | wasi, component-model, bytecode-alliance |
| [[component-model]] | 仕様 | wasi (上位), Core Wasm (下位), wasmtime (実装) |
| [[wasi]] | 仕様 | component-model (基盤), wasmtime (実装), wasm-at-the-edge (利用) |
| [[wintertc]] | 仕様 | v8-isolates, edge-platforms |
| [[bytecode-alliance]] | 組織 | wasmtime, wasi, component-model |
| [[edge-platforms]] | プラットフォーム | v8-isolates, wasm-at-the-edge, edge-data |
| [[edge-data]] | データ | distributed-consistency, edge-platforms |
| [[distributed-consistency]] | 理論 | edge-data |
| [[anycast-cdn]] | ネットワーク | quic-http3, edge-security |
| [[quic-http3]] | プロトコル | anycast-cdn |
| [[edge-security]] | セキュリティ | anycast-cdn, v8-isolates |
| [[edge-design-patterns]] | パターン | edge-platforms, edge-data |
| [[dead-code-elimination]] | コンパイラ | wasm-at-the-edge (バイナリサイズ → Cold Start) |
| [[region-inference]] | メモリ管理 | perceus, wasm-at-the-edge |
| [[perceus]] | メモリ管理 | region-inference, rust |

## Links

- [[edge-computing]] — 全体の起点
- [[component-model]] — WASM 仕様の中間層 (よく混同される)

## 関連

全ノートへのリンクはこのノート自体がマップとして機能する。
