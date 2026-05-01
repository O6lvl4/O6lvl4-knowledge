---
title: gulp-coach
tags: [web-app, typescript, hexagonal, health]
---

「今あと何 mL（何ごく）飲める? あと何分待つ?」を Profile + 直近摂取量から答える、完全ローカル動作の水分摂取コーチ。

公開: https://o6lvl4.github.io/gulp-coach/

## 主機能

- **Profile** — 体重・年齢・性別から 1 日推奨量と 1 時間吸収上限を算出
- **STATUS** — 「あと **350 mL** OK」または「あと **18分** WAIT」を一目で
- **Quick log** — 100/200/300/500 mL のクイックボタン + 任意量入力
- **Daily progress** — 当日累計と目標進捗バー
- **Recent log** — 直近 5 件の履歴と UNDO
- **完全ローカル** — localStorage のみ、サーバ不要

## 算出ロジック

| 項目 | 計算 |
|---|---|
| 1 日推奨量 | 体重 × 35 mL/kg/day × 性別補正（女性 ×0.95）× 年齢補正（65 歳以上 ×0.9 / 14 歳以下 ×0.8） |
| 1 時間上限 | 体重 × 10 mL/h を [400, 800] にクランプ（Profile で上書き可） |
| 1 回上限 | 400 mL（胃排出能力の保守値） |
| 「飲める」判定 | `availableNow = max(0, MaxRate - sumLast60min)` を `sessionMax` と min。100 mL 以上なら OK |
| 待機時間 | 直近 1h 窓の最古イベントが「100 mL 以上を空ける時刻」まで待つ |

## ドメインモデル

| 概念 | 内容 |
|---|---|
| **Profile** | 体重・年齢・性別（+ 任意の rate 上書き）からなる Entity |
| **IntakeEvent** | id + 時刻 + 量（mL）の Value Object |
| **IntakeLog** | IntakeEvent の集約。期間合計・最古抽出を提供 |
| **HydrationStatus** | 評価結果。`advice = { kind: "ok"; canDrinkUpTo } \| { kind: "wait"; until; waitMinutes }` の判別共用体 |
| **HydrationPolicy** | sessionMax と minimumMeaningful を持つ閾値 VO |

## Architecture

[[environment-health-viewer]] と同じ Hexagonal 構成:

```
src/
  domain/         純粋ドメイン（fetch/DOM ゼロ）
    shared/       Brand, Result, units, Specification, clock
    profile/
    intake/
    hydration/
  application/    ports.ts + use-cases.ts
  infrastructure/ localStorage 実装
  presentation/   DOM 描画
  main.ts         Composition Root
```

依存ルールは `dependency-cruiser` で **CI 強制**。違反コミットはマージできない。

## 関連

- [[environment-health-viewer]] — 同じ Hexagonal アーキテクチャの姉妹アプリ

## Links

- [GitHub](https://github.com/O6lvl4/gulp-coach)
