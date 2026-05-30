---
title: 番組表 OSS / EPG ライブラリ
tags: [streaming, reference]
created_at: 2026-05-30
updated_at: 2026-05-30T01:00:00+09:00
---

[[tv-guide-architecture|番組表アーキテクチャ]]の各層に対応する OSS。重要な構図: **放送EPG型（XMLTV エコシステム）は OSS が非常に厚い**が、**配信ガイド型（ストリーミング可用性）はほぼ OSS が無い** — そこが [[tv-guide-apps|JustWatch/Gracenote]] の堀になっている。

## データ / グラバー層（最も厚い）

XML ベースの **XMLTV** が事実上の共通フォーマットで、エコシステム全体がこれを中心に回る。

| OSS | 役割 | 備考 |
|---|---|---|
| **iptv-org/epg** | 数百ソースから1000+ch・50+国の EPG を取得 | この分野の中心。GitHub Actions で日次自動更新、MIT。チャンネル定義は iptv-org/database |
| **XMLTV** | フォーマット本体 + 各国グラバー(`tv_grab_*`) + Perl ライブラリ | エコシステムの土台。多国対応 |
| **WebGrab+Plus** | 多サイト増分 XMLTV グラバー | Docker で自前ホスト可。設定駆動 |
| **Freeview-EPG** | 英 FTA 局/ラジオの XMLTV データ | 地域特化データ提供型 |
| **Tempest-EPG-Generator** | GUI 付き・低メモリの高速 XMLTV 生成 | |
| **nxtvepg** | XMLTV/Teletext のブラウザ + マージ表示 | 複数ソース統合の参考 |

## サーバ / PVR / メディアセンター層

XMLTV を食べて録画・配信・視聴する自前ホスト基盤。番組表は機能の一部として載る。

- **Tvheadend** — TV ストリーミングサーバ + 録画(PVR)。チューナー管理と EPG グラブを統合
- **NextPVR** — PVR。EPG/録画スケジューリング
- **Jellyfin** — OSS メディアサーバ。Live TV + XMLTV EPG 対応（Plex の OSS 代替）
- **Kodi** — メディアセンター。PVR アドオン経由で EPG グリッド表示

## フロント / UI コンポーネント層

グリッド UI を自作せず使えるライブラリ。[[tv-guide-architecture|仮想化]]済みが実用上の分かれ目。

| OSS | 技術 | 特徴 |
|---|---|---|
| **Planby** | React + TypeScript, MIT | 最有力。カスタム[[virtual-scrolling\|仮想ビュー]]で大量データ対応、ライブ更新・サイドバー・タイムライン込み。EPG 以外(予約/ガント等)にも転用可 |
| **react-tv-epg** | React + HTML5 Canvas | TV/セットトップボックス向け。Canvas 描画 |
| **react-epg / reactjs-epg** | React | TV ガイド型グリッドコンポーネント |
| **epggrid** | JS | チャンネル×スケジュールのグリッド表示 |

## 配信ガイド型は OSS が薄い（重要）

ストリーミング可用性（どの作品がどのサービス/地域で観られるか）の **OSS データセットや基盤は実質存在しない**。

- 可用性データは日次でチャーンし、収集・名寄せ・権利確認に継続コストがかかる → **データ自体が堀**で、JustWatch/Gracenote 等の商用に集約
- 周辺に **JustWatchAPI（dawoudt/JustWatchAPI, Python の非公式ラッパー）** のようなクライアントはあるが、データソースそのものではない
- 自作するなら TMDB の watch/providers（JustWatch 由来）等の API に依存するのが現実解

## 勘所

- **放送EPG型を作る/試すなら OSS だけで一周できる**: iptv-org/epg（データ）→ Tvheadend/Jellyfin（サーバ）→ Planby（UI）
- **配信ガイド型の価値はデータ調達**にあり、UI/サーバを OSS で埋めても可用性データの鮮度で勝負が決まる
- Planby は EPG 専用ではなく**汎用タイムライン**。番組表以外（ライブ配信スケジュール、VTuber 配信表など）にも流用が利く

## 関連

- [[tv-guide-architecture|番組表アーキテクチャ]] — これらの OSS が各層に対応する設計図
- [[tv-guide-apps|番組表アプリ / EPG]] — 商用プロダクト事例とデータソース
- [[streaming-software|配信ソフトウェア]] — 配信を「作る」側の OSS（OBS 等）

## Links

- [iptv-org/epg (GitHub)](https://github.com/iptv-org/epg)
- [XMLTV (SourceForge)](https://sourceforge.net/projects/xmltv/)
- [Planby — React Schedule/EPG Component](https://planby.app/)
- [Jellyfin](https://jellyfin.org/)
- [JustWatchAPI (dawoudt, 非公式)](https://github.com/dawoudt/JustWatchAPI)
