---
title: OBS Studio プラグインシステム
tags: [streaming, architecture, plugin, open-source]
created_at: 2026-05-20
updated_at: 2026-05-20
srs_state: new
card_count: 6
reviewed_count: 0
next_due: 2026-05-20
---

[[obs|OBS Studio]] のプラグインシステムの全体像。OBS の具体的機能はほぼすべて `obs_module_t`（プラグインモジュール）として実装されている。

## プラグインの仕組み

### ロードと登録

各プラグインは共有ライブラリ（`.so` / `.dylib` / `.dll`）として実装され、libobs が起動時にロードする。プラグインは `obs_module_load()` エントリポイントで以下の登録関数を呼んで型を登録：

- `obs_register_source(obs_source_info*)` — Source 型の登録
- `obs_register_output(obs_output_info*)` — Output 型の登録
- `obs_register_encoder(obs_encoder_info*)` — Encoder 型の登録
- `obs_register_service(obs_service_info*)` — Service 型の登録

1 つのプラグインが複数の型を登録できる。例えば `obs-ffmpeg` は Source（メディアソース）、Output（録画出力）、Encoder（FFmpeg エンコーダ）を 1 モジュールで登録する。

### info 構造体

各 info 構造体はコールバック関数のテーブル。プラグインが実装すべきインターフェースを定義する。

**`obs_source_info` の主要コールバック:**

| コールバック | タイミング | 責務 |
|---|---|---|
| `create` | インスタンス生成時 | リソース確保、初期設定 |
| `destroy` | インスタンス破棄時 | リソース解放 |
| `video_render` | 毎フレーム（ビデオスレッド） | GPU 上に映像を描画 |
| `video_tick` | 毎フレーム（状態更新） | アニメーション、タイマー等の更新 |
| `audio_render` | 音声処理時 | 音声サンプルの生成/加工 |
| `get_properties` | UI 表示時 | ユーザーに公開する設定項目の定義 |
| `update` | 設定変更時 | 新しい設定の適用 |
| `get_defaults` | 初回 | デフォルト設定値の提供 |

**`obs_encoder_info` の主要コールバック:**

| コールバック | 責務 |
|---|---|
| `create` / `destroy` | エンコーダの初期化・破棄 |
| `encode` | 1 フレームをエンコードしてパケットを返す |
| `get_extra_data` | SPS/PPS 等のヘッダデータ取得 |
| `get_sei_data` | SEI メッセージの取得 |
| `get_video_info` | エンコーダが要求する映像フォーマット |

**`obs_output_info` の主要コールバック:**

| コールバック | 責務 |
|---|---|
| `start` / `stop` | 出力の開始・停止 |
| `raw_video` / `raw_audio` | 生映像/音声の受信（エンコードなし出力の場合） |
| `encoded_packet` | エンコード済みパケットの受信 |

### ライフサイクル

```
モジュールロード (obs_module_load)
  ↓
型の登録 (obs_register_source 等)
  ↓
インスタンス生成 (create コールバック)
  ↓
動作中 (video_render / encode / start 等が繰り返し呼ばれる)
  ↓
インスタンス破棄 (destroy コールバック)
  ↓
モジュールアンロード (obs_module_unload)
```

## 全 38 プラグインの分類

### キャプチャ系（映像の取り込み）

| プラグイン | 対象 OS | 技術 |
|---|---|---|
| `mac-capture` | macOS | ScreenCaptureKit による画面/ウィンドウキャプチャ |
| `mac-avcapture` | macOS | AVFoundation によるカメラキャプチャ |
| `win-capture` | Windows | Game Capture (フック) / Display Capture (DXGI) / Window Capture (GDI/WGC) |
| `win-dshow` | Windows | DirectShow デバイス（カメラ、キャプチャカード） |
| `linux-capture` | Linux | X11 (XComposite/XShm) / PipeWire によるスクリーンキャプチャ |
| `linux-v4l2` | Linux | Video4Linux2 カメラデバイス |
| `decklink` | 全 OS | Blackmagic DeckLink キャプチャカード |
| `aja` | 全 OS | AJA キャプチャカード |

`win-capture` の Game Capture は特殊で、ゲームプロセスに DLL をインジェクトして GPU テクスチャを直接共有メモリ経由で取得する。これにより、ゲーム描画を CPU にダウンロードせずにキャプチャできる。

### 音声系

| プラグイン | 対象 OS | 技術 |
|---|---|---|
| `win-wasapi` | Windows | WASAPI（アプリ音声 / デバイス出力のキャプチャ） |
| `coreaudio-encoder` | macOS | CoreAudio AAC エンコード |
| `linux-pulseaudio` | Linux | PulseAudio |
| `linux-pipewire` | Linux | PipeWire（PulseAudio の後継、画面キャプチャも兼ねる） |
| `linux-alsa` | Linux | ALSA（低レベル音声） |
| `linux-jack` | Linux | JACK Audio Connection Kit（プロオーディオ向け） |
| `oss-audio` | BSD 系 | Open Sound System |
| `sndio` | OpenBSD | sndio |

音声系は OS ごとに完全に異なる API を使う。libobs のオーディオパイプラインがこの差異を吸収し、統一された音声サンプルとして処理する。

### エンコーダ系（映像/音声の圧縮）

| プラグイン | 技術 | 対応コーデック |
|---|---|---|
| `obs-x264` | x264 (CPU) | H.264 |
| `obs-nvenc` | NVENC (NVIDIA GPU) | H.264 / HEVC / AV1 |
| `obs-qsv11` | Quick Sync (Intel GPU) | H.264 / HEVC |
| `mac-videotoolbox` | VideoToolbox (Apple Silicon/Intel) | H.264 / HEVC |
| `obs-libfdk` | libfdk-aac | AAC 音声 |
| `obs-ffmpeg` | FFmpeg | 汎用（録画 muxing、リプレイバッファ、VA-API エンコード等） |

`obs-ffmpeg` は最も多機能なプラグイン。エンコーダとしてだけでなく、メディアソース（動画/音声ファイル再生）、録画出力（MP4/MKV muxing）、リプレイバッファ（直前 N 秒の常時録画）も提供する。

### 出力/配信系

| プラグイン | 機能 |
|---|---|
| `obs-outputs` | RTMP 配信出力、FLV muxing |
| `obs-webrtc` | WebRTC (WHIP プロトコル) 配信出力 |
| `rtmp-services` | 各配信サービス（Twitch, YouTube, Facebook 等）の接続設定データベース。サーバー URL やストリームキーの管理 |

`rtmp-services` はデータフローに関与せず、JSON ファイルとして配信サービスのメタデータ（RTMP URL 一覧、推奨設定等）を提供するだけのプラグイン。

### エフェクト/フィルタ系

| プラグイン | 機能 |
|---|---|
| `obs-filters` | 色補正、クロマキー、カラーキー、シャープ、スクロール、LUT 適用、ノイズ抑制、ノイズゲート、コンプレッサー、リミッター |
| `obs-transitions` | フェード、カット、スライド、スワイプ、スティンガー（動画トランジション） |
| `nv-filters` | NVIDIA AI 背景除去、ルームエコー除去、顔追跡による自動フレーミング |

`obs-filters` が最も多くの Source 型を 1 モジュールに詰め込んでいる。映像フィルタと音声フィルタの両方を含む。各フィルタは `.effect` ファイル（OBS 独自シェーダ形式）で GPU 処理を記述。

### ソース系（追加入力）

| プラグイン | 機能 |
|---|---|
| `image-source` | 画像ファイル / 画像スライドショー |
| `obs-text` | テキスト表示（OS ネイティブ API） |
| `text-freetype2` | FreeType2 によるテキストレンダリング |
| `vlc-video` | libVLC によるメディア再生 |
| `obs-browser` | CEF（Chromium Embedded Framework）埋め込み。URL を指定して Web ページを映像ソースとして表示 |

`obs-browser` は最も重い依存を持つプラグイン。Chromium をプロセス内に埋め込むため、メモリ消費が大きい。しかし配信オーバーレイ（チャット、アラート、ウィジェット）の大半が Web ベースであるため、実質的に必須のプラグイン。

### macOS 固有

| プラグイン | 機能 |
|---|---|
| `mac-syphon` | Syphon フレームワーク連携。他の macOS アプリが Syphon Server として公開した映像を GPU テクスチャ共有で取り込む |
| `mac-virtualcam` | macOS 仮想カメラ（CoreMediaIO DAL プラグイン）。OBS の出力を仮想カメラデバイスとして公開 |

### 制御/連携系

| プラグイン | 機能 |
|---|---|
| `obs-websocket` | WebSocket サーバー。外部ツール（Stream Deck, Touch Portal, 自作スクリプト）から OBS のほぼ全機能を制御可能 |
| `obs-vst` | VST 2.x オーディオプラグインのホスト。DAW 向けの音声エフェクトを OBS の音声パイプラインに挿入 |

## プラグイン間の結合

プラグイン同士は**互いの存在を知らない**。すべて [[obs-libobs|libobs]] のコア抽象型を介して間接的に連携する。

```
[mac-capture]        ──registers→ obs_source_info  ──→ libobs
[mac-videotoolbox]   ──registers→ obs_encoder_info ──→ libobs
[obs-outputs]        ──registers→ obs_output_info  ──→ libobs
[rtmp-services]      ──registers→ obs_service_info ──→ libobs

libobs がデータフローを仲介:
  Source (mac-capture) → Scene → Encoder (mac-videotoolbox) → Output (obs-outputs)
                                                                  ↑
                                                          Service (rtmp-services)
```

`mac-capture` が生成した映像フレームが `mac-videotoolbox` でエンコードされ `obs-outputs` で RTMP 配信される、という協調動作は、libobs のパイプラインが仲介することで実現される。各プラグインは自分の型のコールバックを実装するだけ。

この疎結合設計により：
- プラグインの追加・削除がコアに影響しない
- プラットフォーム固有の実装がプラグインに閉じる
- サードパーティが OBS 本体を変更せずに機能追加できる

## プラグインの OS 分布

| カテゴリ | 全 OS | macOS のみ | Windows のみ | Linux のみ | BSD 系 |
|---|---|---|---|---|---|
| キャプチャ | 2 | 2 | 2 | 2 | — |
| 音声 | — | 1 | 1 | 4 | 2 |
| エンコーダ | 3 | 1 | 1 | — | — |
| 出力 | 3 | — | — | — | — |
| フィルタ | 2 | — | — | — | — |
| ソース | 5 | — | — | — | — |
| macOS 固有 | — | 2 | — | — | — |
| 制御 | 2 | — | — | — | — |

プラットフォーム非依存のプラグイン（出力、フィルタ、ソース、制御）は全 OS で共有される。キャプチャと音声はプラットフォームごとに完全に異なる実装が必要で、ここが OS 対応の最大のコスト。

## 押さえどころ（カード化候補）

- プラグインの登録メカニズム → **共有ライブラリが obs_module_load() で obs_register_source / output / encoder / service を呼んで型を登録。1 モジュールが複数型を登録可能**
- info 構造体の役割 → **コールバック関数テーブル。create/destroy/video_render/encode/start 等、プラグインが実装すべきインターフェースを定義**
- obs-ffmpeg の特殊性 → **最も多機能なプラグイン。エンコーダ・メディアソース・録画出力・リプレイバッファを 1 モジュールで提供**
- win-capture の Game Capture → **ゲームプロセスに DLL をインジェクトし、GPU テクスチャを共有メモリ経由で直接取得。CPU ダウンロード不要**
- プラグイン間の疎結合設計 → **プラグイン同士は互いの存在を知らない。libobs のコア抽象型とデータフロー仲介により間接的に連携**
- OS 対応のコスト構造 → **出力・フィルタ・ソース系は全 OS 共通。キャプチャと音声はプラットフォームごとに完全に異なる実装が必要で、OS 対応の最大コスト**

## 関連

- [[obs-studio-architecture]] — 全体アーキテクチャ
- [[obs-libobs]] — libobs コアライブラリ
- [[obs|OBS Studio]] — 概要・使い方
