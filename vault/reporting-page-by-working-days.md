---
title: reporting-page-by-working-days
tags: [tool, attendance, vanilla-js, business]
---

営業日のみを抽出して並べる作業時間入力アプリ。土日祝はスキップ。

## 動作

指定年月のうち土曜・日曜・祝日を除外し、**営業日だけ** を行として表示する。祝日判定は `holidays-jp.github.io` の API を利用。各行に勤務時間・休憩・作業内容を入力し、`xlsx` ダウンロード可能。

```js
if (dayOfWeek === 0 || dayOfWeek === 6 || holidays.includes(dateStr)) continue;
```

## 機能

- 営業日のみのリスト生成
- 年月の前後ナビゲーション（LocalStorage 永続化）
- デフォルト勤務時間の保存と一括適用
- Excel ダウンロード

## [[reporting-page-by-calendar-days]] との違い

- このツール: **営業日のみ** 行を生成
- calendar-days 版: 月の **全日** を行として残し土日祝を色分け

UI 構成・LocalStorage キー・Excel 出力ロジックは共通。生成ロジック (`generateBusinessDayList`) のみ差し替えた姉妹リポジトリ。

## Links

- [GitHub](https://github.com/Aid-On/reporting-page-by-working-days)
