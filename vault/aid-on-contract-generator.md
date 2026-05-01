---
title: aid-on-contract-generator
tags: [tool, business, contract, vanilla-js]
---

ブラウザだけで動く汎用契約書ジェネレーター。Vanilla JS / ビルド不要 / サーバー不要。

## Core Idea

フレームワークもバンドラも使わず、HTML + CSS + ES6 モジュールだけで契約書作成 UI を構築。すべてのデータはブラウザ内で完結し外部送信なし。

## 対応契約書タイプ

- `consulting` 業務委託契約書
- `employment` 雇用契約書
- `nda` 秘密保持契約書
- `rental` 賃貸借契約書
- `sales` 売買契約書
- `custom` カスタム契約書

各タイプに必須/オプションフィールドとデフォルト条項テンプレートが定義されている。

## 機能

- リアルタイムプレビュー（左フォーム / 右プレビュー）
- 条項のドラッグ & ドロップ並び替え
- `{{変数名}}` 形式で条項中に動的値を埋め込み
- LocalStorage 自動保存
- 設定の JSON エクスポート / インポート
- HTML コピー、新規タブ表示、印刷ダイアログ経由の PDF 出力

## Architecture

```
index.html        # 単一エントリ
styles.css        # 単一スタイル
js/
├── config.js     # CONTRACT_TEMPLATES（契約書定義）
├── utils.js
├── main.js
└── *-manager.js  # 機能別マネージャー
```

ブラウザ API: LocalStorage / File API / Blob API / Drag and Drop API。

## 関連

請求書系の [[aid-on-invoice-generator]]、税計算の [[aid-on-tax-calculator]] と並ぶ Aid-On 業務ツール群の一つ。

## Links

- [GitHub](https://github.com/Aid-On/aid-on-contract-generator)
