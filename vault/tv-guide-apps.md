---
title: 番組表アプリ / EPG
tags: [streaming, reference]
created_at: 2026-05-30
updated_at: 2026-05-30T00:44:00+09:00
---

「番組表」= **EPG（Electronic Program Guide）**。海外事例を見ると、番組表は **放送のEPG → ストリーミング横断ガイド** へと意味が拡張しており、プロダクトは3層に分けて捉えると整理しやすい。①視聴者向けアプリ層、②データソース層、③そのどちらでもある OSS/コミュニティ層。

## 1. 従来型ブロードキャスト EPG（放送・IPTV）

地上波/ケーブル/衛星の編成を時間軸グリッドで見せる古典的な番組表。

- **On TV Tonight** — 英国・アイルランド等の無料 TV ガイド（Web + アプリ）。国別展開
- **TitanTV**（米）— 放送/ケーブル/衛星のラインナップ、カスタム編成に対応
- **USA TV Guide: Listings** — Live EPG + DVR録画 + Catch Up(72h) + ペアレンタルコントロール
- **TVEpg.eu** — 欧州主要局のスケジュールを Web で横断
- IPTV 文脈では **XMLTV** 形式の EPG を読み込むビューア（open-epg、epg.pw 等が公開フィードを配布）

特徴: **編成（時刻×チャンネル）が主役**。データは局・放送波に紐づく。

## 2. ストリーミング横断ガイド（番組表の再発明）

「いつ放送か」より **「どこで配信されているか／何を観るか」** が主役。Netflix/Disney+/Prime 等を横断検索する“番組表”の現代版。海外ではこちらが主流。

| サービス | 特徴 |
|---|---|
| **JustWatch** | 対応サービス最多級（Apple TV+/Disney+/Max/Paramount+/Peacock…）。無料 + Pro($2.50/月で広告除去・カスタムリスト) |
| **Reelgood** | 150+ サービス/チャンネルを横断。視聴履歴ベース推薦が強い |
| **Trakt** | 視聴トラッキング + カレンダー(放送/配信予定)。API が充実し外部連携の基盤になりがち |
| **TV Time** | ソーシャル + 視聴管理。次に観る話の追跡 |
| **Simkl / Yidio / Plex(Discover)** | 同系の“ユニバーサルガイド”。Yidio は100+ソース横断 |

特徴: **作品（タイトル）が主役**、配信先は属性のひとつ。推薦・ウォッチリスト・ソーシャルが価値の中心。

## 3. データソース層（番組表の燃料）

アプリ層は自前で編成データを持たず、ここに依存する。**事業として作るなら最重要の選定ポイント**。

- **Gracenote（旧 Tronds Media Solutions / TMS）** — 業界標準。OnConnect/TMS API で TV・映画スケジュール、番組メタ、人物情報を JSON 配信。`prgSvcId`(局) × UTC datetime のタイムスロット単位。無料 Public プランあり、商用は有償
- **XMLTV** — オープンな EPG 交換フォーマット。OSS グラバー群（tv_grab_*）で各国の公開ページから収集。IPTV/自作プレイヤーの定番
- **EPGTalk / globetvapp/epg（GitHub）** — 国別の無料 EPG を配布するコミュニティリポジトリ。米・加・英・墨など

## Web アプリか、ネイティブか

海外の番組表は **Web ファースト**が多い（JustWatch・Reelgood・On TV Tonight も Web が主、アプリは薄いラッパー的）。理由:
- データ更新が頻繁 → サーバ集中管理が向く
- SEO/ディープリンク（「○○ どこで配信」検索流入）が集客の生命線
- [[app-store|ストア手数料]]を避け、サブスク/アフィリエイト課金を Web 主導にできる

ネイティブの価値は **通知（リマインダ）・ウィジェット・TV/リビング端末**（Apple TV / Android TV / Fire TV）に出るとき。実装は[[app-release-flow|通常のリリースフロー]]に乗る。

## 勘所

- 「番組表を作る」と言っても、**放送EPG型** と **配信ガイド型** は別物。前者は編成データ＝Gracenote/XMLTV 調達が肝、後者は作品メタ＋配信可用性（availability）データと推薦が肝
- 収益は **アフィリエイト（配信サービスへの送客）/ サブスク（広告除去・高度フィルタ）/ データ提供** が定番。JustWatch は送客モデルの代表例
- 日本は権利・配信可用性データの整備が薄く、JustWatch 日本版はあるが網羅性が課題 → ニッチ（VTuberやライブのスケジュールEPG等）に勝機がありうる

## 関連

- [[tv-guide-architecture|番組表アーキテクチャ]] — このプロダクト層を支えるシステム設計（データモデル・取込・グリッド配信）
- [[tv-guide-oss|番組表 OSS / EPG ライブラリ]] — 自前構築に使える OSS（データ・サーバ・UI）
- [[streaming-software|配信ソフトウェア]] — 配信を「作る」側。番組表は「見つける/観る」側
- [[app-store|App Store]] / [[google-play|Google Play]] — ネイティブ配信時の手数料・経路
- [[app-release-flow|App Release Flow]] — ネイティブアプリ化する場合の流れ

## Links

- [JustWatch — The Streaming Guide](https://www.justwatch.com/)
- [Reelgood vs JustWatch vs Plex (TechHive)](https://www.techhive.com/article/1428635/reelgood-vs-justwatch-vs-plex-battle-of-the-streaming-guides.html)
- [Gracenote Developer (OnConnect / TMS API)](https://developer.tmsapi.com/)
- [XMLTV (Wikipedia / project)](https://en.wikipedia.org/wiki/XMLTV)
- [On TV Tonight](https://www.ontvtonight.com/)
