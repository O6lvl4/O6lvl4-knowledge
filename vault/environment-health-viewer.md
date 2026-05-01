---
title: environment-health-viewer
tags: [web-app, typescript, hexagonal, health]
---

気象・大気質データから **偏頭痛・寒暖差・熱中症・UV・大気質・黄砂・花粉** のリスクと **気象庁警報・現在天候・太陽運行** を 1 画面で俯瞰する静的ダッシュボード。

公開: https://o6lvl4.github.io/environment-health-viewer/

## Core Idea

> **Environmental Health Risk Surveillance**
> 個人の「今日の体調・行動判断」用に、外部 API の環境データをリスクメトリクスへ変換し可視化する。医学的助言ではなく、環境データからの **推定** を提示する責務範囲。

- **位置 (Location)** が決まれば全データが従属
- **現在 (Now)** に最も近いスナップショットをリスク判定の起点
- 各リスクは独立した **Metric** として算出され、**System State** に集約

## Architecture (Hexagonal / Ports & Adapters)

```
src/
  domain/              純粋ドメイン（fetch/DOM ゼロ）
    shared/            Result, Brand, RiskLevel, units, temporal
    location/
    conditions/        WeatherSnapshot, weather-code
    risk/              Metric, Assessment, metrics/{migraine,heat,...}
    warnings/          Severity, ActiveWarning, OfficeCode
    solar/
  application/         ports.ts, refresh-dashboard.ts, dashboard-state.ts
  infrastructure/      open-meteo / jma-warnings / bigdatacloud-geocoder / browser-geolocation
  presentation/        renderers, dom-refs, status, chart, level-classes
  main.ts              Composition Root
```

| 層 | 依存 | 責務 |
|---|---|---|
| domain | なし | 値オブジェクト・集約・ドメインサービス。`Result` で失敗を返す |
| application | domain | ユースケースを ports 越しに表現 |
| infrastructure | domain + ports | 外部 API / Browser API の adapter |
| presentation | domain + application | 状態 → DOM の変換 |
| main.ts | 全レイヤ | DI + 状態ループの司令塔 |

`dependency-cruiser` で層境界を **CI 機械強制**。

## 2026 イケてる要素

- **Branded types** — `Hpa`, `Celsius`, `Percent`, `UvIndex`, `Latitude`, `OfficeCode` を `& { __brand }` で型安全化、`X.of(n)` がバリデーション付き factory
- **Result<T,E>** — 例外なし、判別共用体で失敗を表現
- **判別共用体 DashboardState** — `init | loading | ready | error`
- **Specification + RiskPolicy** — 各 Metric は `observe* → Policy → NOTES` の 3 段。Specification は `and / or / not` で合成可能、Policy は閾値ルール集
- **アーキテクチャテスト** — `dependency-cruiser` で `domain → infrastructure` 違反を CI で落とす
- 副作用は composition root と infrastructure に閉じ、ドメインは純関数

## リスクモデル

4 段階の `Level`: `low` (NOMINAL) / `mid` (ELEVATED) / `high` (WARNING) / `danger` (CRITICAL)。`maxLevel(levels)` が System State を決定。

### 主なメトリクス

| Metric | 入力 | 観測量 / 閾値 |
|---|---|---|
| 偏頭痛 | `pressure_msl` | 12h Drop / 12h Swing。8/12, 5/8, 3/5 hPa |
| 寒暖差 | `daily.temperature_2m_max/min` | Diurnal Range と DoD の max。13/10/7 ℃ |
| 熱中症 | `temperature_2m`, `relative_humidity_2m` | WBGT（BoM 経験式）。31/28/25 ℃ |
| UV | `daily.uv_index_max[0]` | UVI 11/8/6/3 |
| 大気質 | `pm2_5`, `european_aqi` | PM2.5 / AQI 二重判定 |
| 黄砂 | `dust` | 500/200/80 μg/m³ |
| 花粉 | 6 樹種 grains/m³ | TopVal と Total の二重判定 |

## 警報モデル

JMA 警報を `WarningResult` (`prefecture` + `reportDatetime` + `ActiveWarning[]`) に集約。`ActiveWarning` は `code` / `name` / `severity` (`alert` / `warn` / `info`) / `areas`。47 都道府県 → `OFFICE_CODE` の固定マップを保持。

## データソース

| 用途 | エンドポイント |
|---|---|
| 気象 | `api.open-meteo.com/v1/forecast` |
| 大気質 | `air-quality-api.open-meteo.com/v1/air-quality` |
| 逆ジオコーディング | `api.bigdatacloud.net/data/reverse-geocode-client` |
| 気象庁警報 | `www.jma.go.jp/bosai/warning/data/warning/{officeCode}.json` |
| Twemoji | jdecked/twemoji@15.1.0 |

すべて API キー不要・CORS 許可済み。

## 技術スタック

- TypeScript (strict)
- Vite 5 + Tailwind CSS v4 (`@tailwindcss/vite`、設定ファイルなし)
- フレームワークなし（Vanilla TS + DOM）
- カラートークンは `@theme` で一元定義
- Vitest で domain + application を 60+ テスト

## 関連

- [[gulp-coach]] — 同じ Hexagonal 構成の姉妹アプリ

## Links

- [GitHub](https://github.com/O6lvl4/environment-health-viewer)
