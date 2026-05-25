---
title: OBS Studio アーキテクチャ
tags: [streaming, architecture, open-source, video]
created_at: 2026-05-20
updated_at: 2026-05-20
---

[[obs|OBS Studio]] の内部アーキテクチャの分析。ソースコード（GitHub `obsproject/obs-studio`）を基に構成要素と設計判断を整理したもの。

## 4 層アーキテクチャ

OBS Studio は 4 つのレイヤーに分離されている。

```
┌──────────────────────────────────────────────┐
│  Frontend (Qt UI)                            │
├──────────────────────────────────────────────┤
│  Plugins (38個)                              │
│  キャプチャ / エンコーダ / 出力 / フィルタ等       │
├──────────────────────────────────────────────┤
│  libobs (C コアライブラリ)                     │
│  Source / Scene / Encoder / Output / Service  │
├───────────┬──────────┬───────────────────────┤
│ libobs-   │ libobs-  │ libobs-              │
│ metal     │ opengl   │ d3d11                │
│ (macOS)   │ (Linux)  │ (Windows)            │
└───────────┴──────────┴───────────────────────┘
```

各レイヤーの責務：

| レイヤー | 責務 | 実装言語 |
|---|---|---|
| **Frontend** | ユーザーインターフェース。シーン管理・配信制御・プレビュー表示 | C++ (Qt) |
| **Plugins** | すべての具体的機能。キャプチャ・エンコード・出力・フィルタ等 | C / C++ |
| **libobs** | コア抽象型の定義、映像/音声パイプラインの駆動、モジュールシステム | C |
| **レンダリングバックエンド** | GPU 描画の実装。libobs の `graphics/` API を各 GPU API で実装 | C / Obj-C |

この分離の要点は **コア（libobs）が具体的な機能を一切持たない** こと。画面キャプチャも、H.264 エンコードも、RTMP 送出も、すべてプラグインが担う。libobs は「Source とは何か」「Encoder とは何か」という**型の定義**と、それらを駆動する**パイプライン**だけを提供する。

## 6 つのコア抽象

libobs が定義する基本型。すべてプラグインとして差し替え可能。

| 抽象 | C 型 | 役割 | 実装例 |
|---|---|---|---|
| **Source** | `obs_source_t` | 映像/音声の入力。フィルタやトランジションも Source | 画面キャプチャ、カメラ、画像、テキスト |
| **Scene** | `obs_scene_t` | 複数 Source を位置・スケール・回転つきで配置するコンテナ | — (libobs 組み込み) |
| **Encoder** | `obs_encoder_t` | 映像/音声の圧縮 | x264, NVENC, VideoToolbox |
| **Output** | `obs_output_t` | エンコード済みデータの出力先 | RTMP 配信、MP4 録画 |
| **Service** | `obs_service_t` | 配信サービスの接続情報 | Twitch, YouTube, カスタム RTMP |
| **Display** | `obs_display_t` | プレビューウィンドウのレンダリングコンテキスト | — (libobs 組み込み) |

各型には弱参照版（`obs_weak_source_t` 等）が用意され、オブジェクト破棄後の安全な遅延アクセスを可能にしている。

Scene と Display は libobs 自身が実装を持つが、他の 4 型（Source / Encoder / Output / Service）は原則としてプラグインが実装を提供する。

## コアデータフロー

```
[Source] ─→ [Scene 合成] ─→ [Canvas/Display] ─→ プレビュー表示
                 │
                 ↓
            [Encoder] ─→ [Output] ─→ ファイル / RTMP / WebRTC
                            ↑
                        [Service]（配信先の接続情報）
```

1. **Source** が映像/音声フレームを生成（同期 or 非同期）
2. **Scene** が複数 Source をレイヤー順に GPU 上で合成し、1 フレームを生成
3. 合成結果が **Encoder** に渡されて H.264 / HEVC / AV1 等に圧縮
4. **Output** がエンコード済みデータをファイルやネットワークに送出
5. **Service** が配信先（Twitch, YouTube 等）の接続パラメータを Output に供給
6. 同時に、合成結果は **Display** 経由で UI のプレビューウィンドウにも描画される

Output は Encoder を直接参照し、Encoder が生成したパケットを pull する構造。Service は Output に接続情報を渡すだけで、データフローには直接関与しない。

## スレッドモデル

OBS は最低 3 つの主要スレッドで動作する。

| スレッド | 駆動元 | 責務 |
|---|---|---|
| **ビデオスレッド** | `obs-video.c` | レンダリングループ。全 Source の描画 → Scene 合成 → Encoder へ転送 → Display 更新 |
| **オーディオスレッド** | `obs-audio.c` | 音声ミキシング。各 Source の音声をサンプル単位で混合 → フィルタ適用 → Encoder / モニタリングへ |
| **UI スレッド** | Frontend (Qt) | ユーザー操作の受付、プレビュー描画の要求 |

ビデオスレッドとオーディオスレッドは独立して動作し、タイムスタンプで同期をとる。Encoder は両方のスレッドからデータを受け取り、mux して Output に渡す。

GPU エンコードの場合は `obs-video-gpu-encode.c` が介在し、レンダリング結果を GPU メモリ上のまま直接エンコーダに渡す最適化パスが存在する（CPU へのダウンロードを回避）。

## レンダリングバックエンド

| ライブラリ | GPU API | 対象 OS |
|---|---|---|
| `libobs-metal` | Metal | macOS |
| `libobs-opengl` | OpenGL | Linux, macOS (レガシー) |
| `libobs-d3d11` | Direct3D 11 | Windows |

libobs の `graphics/` サブシステムが統一 API を定義し、各バックエンドがそれを実装する。この抽象層が提供する機能：

- テクスチャの生成・破棄・操作
- エフェクトファイル（`.effect`）によるシェーダ記述
- レンダーターゲットの切り替え
- 頂点バッファ・描画コマンドの発行

Scene 合成、フィルタ適用、プレビュー描画のすべてがこの抽象層を通る。プラグインも `graphics/` API を通じて描画するため、バックエンドの違いを意識しない。

## コードベースの規模

| ディレクトリ | 主要言語 | 概要 |
|---|---|---|
| `libobs/` | C | コアライブラリ。約 60 ファイル + サブディレクトリ群 |
| `plugins/` | C / C++ | 38 プラグイン。各プラグインが独立ディレクトリ |
| `frontend/` | C++ (Qt) | UI 実装 |
| `libobs-metal/` | Obj-C / Metal | macOS レンダリング |
| `libobs-opengl/` | C | OpenGL レンダリング |
| `libobs-d3d11/` | C++ | D3D11 レンダリング |
| `deps/` | 各種 | 外部依存ライブラリ |
| `shared/` | C / C++ | プラグイン・フロントエンド間で共有されるユーティリティ |

全体で C 51.8%、C++ 36.9%。CMake ベースのビルドシステム。

## 設計上の注目点

**「すべてが Source」の統一モデル**: 映像入力、音声入力、フィルタ、トランジション、Scene 自体がすべて `obs_source_t` として統一されている。フィルタは Source にチェーンされるだけの Source であり、トランジションは 2 つの Source 間を補間する Source。この統一により、パイプラインの組み合わせが自由になる。

**コアの薄さ**: libobs は型の定義とパイプラインの駆動だけを行い、具体的な映像処理・プロトコル実装を一切持たない。画面キャプチャひとつとっても、macOS は ScreenCaptureKit、Windows は DXGI/GDI、Linux は X11/PipeWire と完全に異なるが、それらはすべてプラグイン側に閉じている。

**プラグイン間の疎結合**: プラグイン同士は互いを知らない。すべて libobs のコア抽象型を介して間接的に連携する。`mac-capture` と `mac-videotoolbox` が協調して動作するのは、libobs が Source → Encoder のデータフローを仲介するからであり、両者が直接通信しているわけではない。

**GPU エンコードの最適化**: レンダリング結果を CPU にダウンロードせず GPU メモリ上のままエンコーダに渡すパスがある。これは配信のレイテンシと CPU 負荷の両方に効く重要な最適化。

## 押さえどころ（カード化候補）

- OBS Studio の 4 層構成 → **Frontend (Qt UI) / Plugins (38個) / libobs (C コア) / レンダリングバックエンド (Metal/OpenGL/D3D11)。コアは具体的機能を持たず、型定義とパイプライン駆動のみ**
- libobs の 6 つのコア抽象 → **Source, Scene, Encoder, Output, Service, Display。Source/Encoder/Output/Service はプラグインが実装を提供し、Scene/Display は libobs 組み込み**
- OBS のデータフロー → **Source → Scene 合成 (GPU) → Encoder → Output → 配信先/ファイル。Service は接続情報を供給するだけでデータフローに直接関与しない**
- OBS のスレッドモデル → **ビデオスレッド（レンダリングループ）、オーディオスレッド（ミキシング）、UI スレッド（Qt）の 3 本。映像と音声はタイムスタンプで同期**
- OBS の「すべてが Source」設計 → **映像入力、音声入力、フィルタ、トランジション、Scene がすべて obs_source_t。フラグで種別を分類。パイプラインの組み合わせを自由にする統一モデル**
- OBS のプラグイン疎結合 → **プラグイン同士は互いを知らない。libobs のコア抽象型を介して間接的に連携する設計**
- GPU エンコード最適化パス → **レンダリング結果を CPU にダウンロードせず GPU メモリ上のまま直接エンコーダに渡す。レイテンシと CPU 負荷の両方に効く**

## 関連

- [[obs|OBS Studio]] — 概要・使い方
- [[obs-libobs]] — libobs コアライブラリの詳細
- [[obs-plugin-system]] — プラグインの分類と全体像
- [[streaming-software|配信ソフトウェア]] — ジャンルの抽象概念
- [[metal|Metal]] — macOS レンダリングバックエンド
- [[opengl|OpenGL]] — Linux レンダリングバックエンド
