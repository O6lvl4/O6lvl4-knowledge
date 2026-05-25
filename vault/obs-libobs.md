---
title: libobs
tags: [streaming, architecture, c, library]
created_at: 2026-05-20
updated_at: 2026-05-20
---

[[obs|OBS Studio]] のコアライブラリ。C 言語で実装され、映像/音声パイプラインの全基盤を提供する。OBS の「カーネル」にあたる部分であり、具体的な機能（キャプチャ、エンコード、配信）は一切持たず、**抽象型の定義**と**パイプラインの駆動**だけを行う。

## ディレクトリ構成

```
libobs/
├── obs.h                    # 公開 API ヘッダ（全機能のエントリポイント）
├── obs.c                    # 初期化・シャットダウン・グローバル状態管理
│
│  ── コア抽象型 ──
├── obs-source.c/h           # Source 型（映像/音声/フィルタ/トランジション）
├── obs-source-deinterlace.c # Source のデインターレース処理
├── obs-source-transition.c  # Source のトランジション処理
├── obs-scene.c/h            # Scene 型（Source のコンテナ + 空間配置）
├── obs-encoder.c/h          # Encoder 型（映像/音声の圧縮）
├── obs-output.c/h           # Output 型（エンコード済みデータの送出先）
├── obs-output-delay.c       # Output の遅延制御（ストリームディレイ）
├── obs-service.c/h          # Service 型（配信サービスの接続情報）
├── obs-display.c            # Display 型（プレビューウィンドウ）
├── obs-canvas.c             # Canvas（カスタムレンダリングサーフェス）
│
│  ── パイプライン駆動 ──
├── obs-video.c              # ビデオスレッド（レンダリングループ）
├── obs-video-gpu-encode.c   # GPU エンコード最適化パス
├── obs-audio.c              # オーディオスレッド（ミキシング）
├── obs-audio-controls.c/h   # 音量フェーダー・ミュート制御
│
│  ── コーデック支援 ──
├── obs-avc.c/h              # H.264 NAL ユニットのパース/構築
├── obs-hevc.c/h             # HEVC NAL ユニットのパース/構築
├── obs-av1.c/h              # AV1 OBU のパース/構築
├── obs-nal.c/h              # NAL 共通ユーティリティ
│
│  ── モジュール・設定・UI支援 ──
├── obs-module.c/h           # プラグインモジュールのロード・登録
├── obs-properties.c/h       # プロパティ定義（UI に表示する設定項目）
├── obs-data.c/h             # JSON ベースの設定データ管理
├── obs-hotkey.c/h           # ホットキーシステム
├── obs-interaction.h        # ソースへのマウス・キーボード入力
│
│  ── サブディレクトリ ──
├── graphics/                # GPU 描画抽象層
├── audio-monitoring/        # 音声モニタリング（リアルタイム視聴）
├── media-io/                # メディア I/O（映像/音声フォーマット変換）
├── util/                    # ユーティリティ（スレッド、文字列、設定ファイル、ハッシュ等）
├── callback/                # シグナル/スロット・プロシージャコールバック
│
│  ── プラットフォーム固有 ──
├── obs-cocoa.m              # macOS 固有処理
├── obs-windows.c            # Windows 固有処理
├── obs-nix.c                # Linux 共通
├── obs-nix-x11.c/h          # X11 固有
├── obs-nix-wayland.c/h      # Wayland 固有
└── obs-nix-platform.c/h     # Linux プラットフォーム抽象
```

## Source の統一設計

`obs_source_t` は libobs で最も重要な型。映像入力・音声入力・フィルタ・トランジション・合成ソースが**すべて同一の型**で表現される。内部的にはフラグの組み合わせで種別を分類：

| フラグ | 種別 | 振る舞い | 例 |
|---|---|---|---|
| `OBS_SOURCE_VIDEO` | 映像ソース | `video_render` コールバックで毎フレーム描画 | 画面キャプチャ、画像 |
| `OBS_SOURCE_AUDIO` | 音声ソース | 音声データをオーディオスレッドに供給 | マイク入力 |
| `OBS_SOURCE_ASYNC` | 非同期ビデオ | フレームを任意タイミングで push（ビデオスレッドと非同期） | カメラ、メディアプレーヤー |
| `OBS_SOURCE_FILTER` | フィルタ | 親 Source の描画結果を加工して返す | クロマキー、色補正、ノイズ抑制 |
| `OBS_SOURCE_TRANSITION` | トランジション | 2 つの Source 間を時間経過で補間 | フェード、スライド |
| `OBS_SOURCE_COMPOSITE` | 合成 | 子 Source を内部に持ち、まとめて描画 | Scene |

フラグは複合可能。例えば `VIDEO | AUDIO` は映像と音声の両方を出すソースを意味する。

フィルタチェーン: Source には任意個のフィルタ Source を連結できる。描画時、Source 自身が描画した結果をフィルタが順に加工していくチェーン構造。

トランジション: 2 つの Scene（= Composite Source）間を補間する特殊な Source。切り替え開始時に source A → source B への補間が始まり、完了すると source B が active になる。

## ビデオパイプライン

`obs-video.c` が専用スレッドで駆動するレンダリングループ。1 フレームの処理フロー：

```
1. obs_video_thread_loop()
   │
   ├── 2. 全 Source の video_tick() を呼ぶ（状態更新）
   │
   ├── 3. Scene の render を実行
   │   ├── 各 SceneItem の Source の video_render() を呼ぶ
   │   ├── フィルタチェーンを適用
   │   └── レイヤー順に GPU 上で合成
   │
   ├── 4. 合成結果をステージングテクスチャにコピー
   │
   ├── 5a. [CPU エンコードパス] GPU → CPU ダウンロード → Encoder
   ├── 5b. [GPU エンコードパス] GPU メモリ上のまま → Encoder（obs-video-gpu-encode.c）
   │
   └── 6. Display にプレビュー描画
```

GPU エンコードパス（5b）は `obs-video-gpu-encode.c` が担当。レンダリング結果を CPU にダウンロードせず、GPU メモリ上のまま NVENC / VideoToolbox 等のハードウェアエンコーダに渡す。これにより CPU 負荷とレイテンシの両方が削減される。

## オーディオパイプライン

`obs-audio.c` が専用スレッドで駆動する音声ミキシング。

```
1. 各 Source から音声サンプルを取得
2. Source ごとのフィルタチェーンを適用（ノイズ抑制、コンプレッサー等）
3. 全 Source を指定チャンネルにミックスダウン
4. 最終ミックスを Encoder / モニタリング出力に送出
```

音声は固定サンプルレート（通常 44.1kHz or 48kHz）で処理される。ビデオスレッドとはタイムスタンプベースで同期をとり、Encoder 側で A/V の整合性を保つ。

## グラフィックス抽象層 (`graphics/`)

レンダリングバックエンド（Metal / OpenGL / D3D11）への統一インターフェースを定義。

| 機能 | 説明 |
|---|---|
| テクスチャ管理 | 生成・破棄・ステージング・フォーマット変換 |
| エフェクトファイル | `.effect` 形式のシェーダ記述言語。頂点/フラグメントシェーダをクロスプラットフォームで記述 |
| レンダーターゲット | オフスクリーン描画先の切り替え |
| 描画コマンド | 頂点バッファ・インデックスバッファ・ドローコール |

エフェクトファイル（`.effect`）は OBS 独自のシェーダ記述形式。プラグインはこの形式でフィルタを実装するため、バックエンドの違いを意識せずに GPU 処理を記述できる。

## コールバック・シグナルシステム (`callback/`)

libobs 内部のイベント通知機構。Qt のシグナル/スロットに似た設計。

- **シグナル**: Source の状態変化（作成・破棄・名前変更・アクティブ化等）を通知
- **プロシージャ**: 外部から Source に対して操作を要求

Frontend（Qt UI）はシグナルを購読して UI を更新する。obs-websocket プラグインも同じシグナルを購読して外部クライアントにイベントを転送する。

## 設定データシステム (`obs-data.c`)

JSON ベースの統一設定管理。

- 各 Source / Encoder / Output / Service のインスタンス設定を `obs_data_t` で保持
- シリアライズ（JSON 文字列）とデシリアライズを提供
- デフォルト値の階層的な管理（プラグインのデフォルト → ユーザー設定 の上書き）
- シーンコレクション（全 Scene 構成の保存/復元）もこのシステムに依存

## コーデック支援モジュール

`obs-avc.c` / `obs-hevc.c` / `obs-av1.c` は Encoder プラグインの補助。NAL ユニット（H.264/HEVC）や OBU（AV1）のパース・構築ユーティリティを提供する。エンコーダプラグインがこれを使ってビットストリームを正しく構成する。

これらは libobs に含まれているが、実際に使うのはエンコーダプラグイン側。共通処理をコアに集約して重複を避ける設計。

## 押さえどころ（カード化候補）

- libobs の役割 → **C 言語のコアライブラリ。抽象型の定義（Source/Scene/Encoder/Output/Service/Display）とパイプラインの駆動（ビデオ/オーディオスレッド）のみ。具体的な機能は一切持たない**
- Source の統一設計 → **映像入力、音声入力、フィルタ、トランジション、Scene がすべて obs_source_t。フラグ（VIDEO/AUDIO/ASYNC/FILTER/TRANSITION/COMPOSITE）の組み合わせで種別を表現**
- フィルタチェーン → **Source に任意個のフィルタ Source を連結。描画時に Source の出力をフィルタが順に加工するチェーン構造**
- ビデオパイプラインの 1 フレーム → **全 Source の tick → Scene render（GPU 合成） → Encoder 転送（CPU パス or GPU パス） → Display プレビュー**
- GPU エンコードパス → **obs-video-gpu-encode.c。レンダリング結果を CPU にダウンロードせず GPU メモリ上のままハードウェアエンコーダに渡す最適化**
- エフェクトファイル (.effect) → **OBS 独自のシェーダ記述形式。graphics/ 抽象層を通じてクロスプラットフォームで GPU 処理を記述。フィルタプラグインの実装に使用**

## 関連

- [[obs-studio-architecture]] — 全体アーキテクチャ
- [[obs-plugin-system]] — プラグインの分類
- [[obs|OBS Studio]] — 概要・使い方
- [[metal|Metal]] — macOS バックエンドが実装する GPU API
- [[opengl|OpenGL]] — Linux バックエンドが実装する GPU API
