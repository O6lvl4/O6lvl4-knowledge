---
title: macleap
tags: [cli, typescript, hexagonal, macos]
---

現マシンを検出し、同等以上の現行 Mac を提案、下取り後の実質アップグレードコストを算出する CLI。日本市場（JPY）対応、データは region 単位の JSON。

## Core Idea

「今の Mac に近い性能で、いくら追金すれば最新世代に乗れるか」を 1 コマンドで答える。`system_profiler` で現マシンを検出し、`data/regions/<region>/lineup.json` と照合、減価モデルで下取り価格を推定。

内部アーキテクチャは region 引数化されており、新地域追加は **JSON 編集だけ** でコード変更不要。

## CLI

```sh
npm install
npx tsx src/index.ts plan --budget 400000
```

```
macleap [detect]                 現 Mac スペック表示（default）
macleap suggest [options]        同等以上の現行モデル候補
macleap tradein [options]        下取り見積
macleap plan [options]           上記を統合し net upgrade cost を算出

Options:
  -b, --budget <amount>          上限価格（JPY 等）
  -c, --condition <state>        asNew | good | fair（default: asNew）
  --region <code>                 default: jp
  --allow-smaller-screen
  --limit <n>
  --all
  --json
```

`NO_COLOR` と非 TTY 環境を自動尊重。

## 出力例

```
$ macleap plan -b 400000

Current Mac
  Model      MacBook Pro (Mac15,3)
  Chip       Apple M3
  Memory     24 GB
  Storage    460 GB

Trade-in estimate (condition: asNew)
Matched MacBook Pro 14" M3 / 24GB / 512GB (2023/11, retail ¥308,800)
┌──────────────────────┬──────────────┐
│ Channel              │ Estimate     │
├──────────────────────┼──────────────┤
│ Apple Trade In       │    ¥150,000  │
│ Private (median)     │    ¥170,000  │
│ Private (best)       │    ¥200,000  │
└──────────────────────┴──────────────┘

Equal-or-better current models — net upgrade cost (within ¥400,000)
┌────┬──────────────────────────┬──────────────┬───────────┬───────────┐
│ #  │ Model                    │ Config       │ Price     │ Net       │
├────┼──────────────────────────┼──────────────┼───────────┼───────────┤
│ 1  │ MacBook Air 15" M5       │ 24GB / 1TB   │ ¥279,800  │  ¥79,800  │
│ 2  │ MacBook Pro 14" M5       │ 24GB / 1TB   │ ¥308,800  │ ¥108,800  │
└────┴──────────────────────────┴──────────────┴───────────┴───────────┘
```

## データ構造

```
data/regions/<region-code>/
  lineup.json         現行ラインナップ（価格・構成）
  historical.json     過去 Mac とリリース時定価
  tradein-model.json  減価率と channel/condition 倍率
```

現状は `jp` のみ shipped。Apple Trade In + Iosys / Amemoba 出品で校正（2026-04 時点）。

### Stale-data monitor

毎週走る GitHub Action が Apple Japan Newsroom の Atom feed を `lineup.json#updatedAt` 以降で scan、Mac 関連の発表があれば deduplicated issue を起票 → データ更新の cue。

## Architecture

Hexagonal: `domain` (純粋) ← `application` (use cases + ports) ← `infrastructure` (adapters) と `presentation` (CLI)。`dependency-cruiser` で層境界を機械強制、Vitest で domain + application を unit test。

## Links

- [GitHub](https://github.com/O6lvl4/macleap)
