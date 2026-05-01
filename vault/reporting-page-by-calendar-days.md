---
title: reporting-page-by-calendar-days
tags: [tool, attendance, vanilla-js, business]
---

月の全カレンダー日を一覧表示する作業時間入力アプリ。土日祝も色分けして残し、Excel ダウンロード可能。

## 動作

指定年月の **全日付** を行として表示する。`holidays-jp.github.io` の祝日 API を fetch し、土曜・日曜・祝日を色分け。各行に出退勤時刻・休憩・作業内容を入力でき、`xlsx` 形式でダウンロードできる。

## 機能

- 年月の前後ナビゲーション（最後に開いた月を LocalStorage 保存）
- デフォルト勤務時間設定の保存と一括適用
- 行ごとの再判定（祝日 API 取得後の再計算）
- Excel ダウンロード

## Architecture

```
index.html
js/
├── main.js     # 起動・イベント登録
├── table.js    # 日付リスト生成・行スタイル
├── storage.js  # LocalStorage
├── excel.js    # xlsx 出力
└── utils.js
```

## [[reporting-page-by-working-days]] との違い

- このツール: **月の全日** を表示（土日祝も行として残し色分け）
- working-days 版: **営業日のみ** を表示（土日祝はスキップ）

## Links

- [GitHub](https://github.com/Aid-On/reporting-page-by-calendar-days)
