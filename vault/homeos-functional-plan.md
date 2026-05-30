---
title: HomeOS を関数型で作る — 計画 (仮)
tags: [homeos, elixir, beam, functional-programming, home-automation, local-first, planning, draft]
draft: true
created_at: 2026-05-30
updated_at: 2026-05-30
---

> **[仮版・project plan]** 関数型祭りに向けて、自宅の HomeOS（家の自動化基盤）を関数型プログラミングで「それなりに範囲広く」作る計画。言語は Elixir (BEAM)、配置は local-first で確定。実機はまだ無いのでシミュレータ先行。このノートはプロジェクトの起点ドキュメントで、決定事項・設計原則・フェーズ計画を固定する。

## なぜ Elixir (BEAM) なのか

HomeOS という問題の形が、Erlang が生まれた問題（電話交換機）とほぼ同型だから。「無難だから」ではなく**構造が一致しているから**選ぶ。

家の自動化を分解すると:

- **たくさんの独立した状態持ち**（照明・センサー・エアコン・各部屋・各自動化ルール）
- **それぞれが勝手に壊れる**（Zigbee デバイスが反応しない、API が落ちる）
- **ソフトリアルタイムでイベントに反応**（人感センサー → 照明）
- **24/365 動き続ける**

これは「軽量プロセス1個 = デバイス/部屋/ルール1個」「let it crash + Supervisor で再起動」「メッセージパッシングで疎結合」という BEAM のモデルにそのまま落ちる。**1個のデバイスがクラッシュしても家全体は落ちない、を設計の努力ではなくランタイムが保証する。** これが他言語に対する決定的な差。

### 対抗馬の整理

| 言語 | 立ち位置 | 不採用理由（今回） |
|---|---|---|
| **Elixir** ✅ | BEAM 上の実用関数型。OTP / Phoenix / Nerves | — 採用 |
| Gleam | BEAM 上の静的型付き。型 + OTP | 祭り映えは最強だが OTP 生態系が若い。一部ロジックで同居は検討（補助） |
| Haskell | 純粋・型駆動・FRP | I/O 泥臭い統合と常時稼働運用が不利。OTP 相当は自作 |
| F# | .NET 全資産 + 実用関数型 | 主張が弱め。今回は不要 |
| Clojure | JVM・データ指向・REPL駆動 | 動的型。デモ映えはするが堅牢さ優先で外す |

関連: [[functional-programming]] / [[pure-functional-programming]] / [[algebraic-effects]] / [[adt-gadt]]（ルールを ADT で表現する設計に効く）

## 確定事項

| 項目 | 決定 |
|---|---|
| 言語 | Elixir (BEAM) + Phoenix LiveView（補助に Gleam は任意） |
| 配置 | **完全 local-first**。Hub = 既存の常時稼働箱（NAS/NUC/旧PC 等、SSD 付き） |
| 実機 | まだ無い → **シミュレータ先行**でソフトを完成させ、実機は後から同インターフェースに差す |
| クラウド | 大きなクラウドは使わない。外向きは **LLM API のアウトバウンドのみ**（任意・落ちてOK）。遠隔操作は **Tailscale** |
| LLM | Claude API（Haiku=高速安価 / Sonnet=ルール生成）、任意でローカル小モデル（Bumblebee）フォールバック |

外部依存が「Tailscale メッシュ」と「任意の LLM 呼び出し」だけになり、家の中核は1台で自己完結する。

## 設計原則

### 1. local-first（頭脳をクラウドに置かない）

家を動かすシステムをクラウド依存にするのは堅牢さの観点では**設計バグ**:

- 停電より「ネット断・プロバイダ障害」で家が止まる ── AWS が落ちたら照明が点かない、は許容できない
- レイテンシ ── 人感→点灯が往復インターネットだと体感で負ける
- プライバシー ── 家中のセンサーログを外に出し続けることになる
- ロックイン ── 家の中核を一社に握られる

→ 頭脳（Hub・自動化エンジン・実機制御）は家の中で完結させ、クラウドは「薄くて差し替え可能なエッジ」に限定する。判断軸は [[edge-vs-cloud-vs-onprem]] を参照。

### 2. クラウドの役割は限定する

| 仕事 | 採用 |
|---|---|
| 遠隔アクセス | **Tailscale**（ポート開放ゼロ・クラウド頭脳不要） |
| LLM 連携 | Claude API へのアウトバウンド呼び出しのみ（クリティカルパス外） |
| バックアップ/OTA | 当面ローカル。必要なら Hetzner/Fly の小箱を後付け |

AWS/GCP のフルマネージドは家用途には過剰・高コスト・依存増のため不採用。

### 3. LLM はクリティカルパスから外す

LLM の仕事は**「翻訳」だけ**: 自然言語（「寝るモードにして」）→ 型付きの `%Command{}` か `%Rule{}` に変換。実行は決定論エンジンが担う。

- LLM/ネットが落ちても、既存ルールで家は普通に動く
- 生の LLM 出力は**絶対に実機へ直結させない** → schema 検証 → 危険操作（解錠等）は確認必須
- 「ルール＝データ」設計に完璧に乗る: LLM は `%Rule{}` という*値*を吐くだけ。自然言語でルールを作って無停止でホットロードできる ← 祭りの目玉

## アーキテクチャ（3層）

```
┌─ ③ 知能エッジ（任意・落ちてOK）─────────────┐
│   Brain GenServer → Claude API / ローカル小モデル  │
│   自然言語 →「検証済み %Command / %Rule」に変換だけ │
└───────────────┬─────────────────────────┘
                ↓ 検証済みデータのみ流す（生出力は実機に触れさせない）
┌─ ② インターフェース ──────────────────────┐
│   LiveView ダッシュボード / Tailscale 経由の遠隔   │
└───────────────┬─────────────────────────┘
                ↓
┌─ ① 制御コア（決定論・常時稼働）───────────────┐
│   Supervisor + Device GenServers + Rule Engine + Bus │
│   ★ここだけで家は完全に動く。①は②③が死んでも無傷   │
└─────────────────────────────────────────┘
```

### スーパービジョンツリー（堅牢さの本体）

```elixir
# application.ex
children = [
  HomeOS.Repo,                              # 履歴(SQLite/Postgres via Ecto)
  {Phoenix.PubSub, name: HomeOS.PubSub},    # 内部イベントバス
  {Registry, keys: :unique, name: HomeOS.DeviceRegistry},
  HomeOS.MQTT.Connection,                   # Tortoise (実機導入後に有効化)
  HomeOS.Ingest.Pipeline,                   # Broadway: センサ洪水を背圧制御
  {DynamicSupervisor, name: HomeOS.Devices.Sup},     # 1デバイス=1プロセス
  {DynamicSupervisor, name: HomeOS.Automations.Sup}, # 1ルール=1プロセス
  HomeOS.Brain,                             # LLM 境界（任意・circuit breaker 付き）
  HomeOS.Scheduler,                         # cron(Quantum)
  HomeOSWeb.Endpoint                        # LiveView
]
Supervisor.init(children, strategy: :one_for_one)
```

### 自動化を「データ + 純粋関数」で持つ（関数型の本領）

```elixir
%HomeOS.Rule{
  id: "夜の人感ライト",
  trigger: {:device, "hall_motion"},
  condition: fn ctx -> ctx.sun == :night and ctx.hall_motion == :detected end,
  action: {:set, "hall_light", :on, ttl: {:minutes, 5}}
}
```

ルールは**値**。だからテストできる（純粋関数）／シリアライズして DB 保存できる／LiveView や LLM から無停止で追加・差し替えできる。エンジンはイベントを畳み込む reducer に過ぎない。

## フェーズ計画

| フェーズ | 内容 | 完了の定義 |
|---|---|---|
| **P0 土台** | リポジトリ / CI(GH Actions) / Tailscale / Hub セットアップ | `mix phx.new` が Hub 上で起動 |
| **P1 堅牢コア + シミュレータ** | Supervisor+Registry+PubSub、Device GenServer、**仮想デバイス**、LiveView 表示 | プロセスを kill→自己回復、画面がリアルタイム更新 |
| **P2 自動化エンジン** | Rule as data、純粋エンジン、無停止差し替え、テスト | 「人感→点灯」ルールが値として追加・テストできる |
| **P3 LLM 連携** | Brain 境界 GenServer、structured output→検証→提案→適用、circuit breaker | 自然言語で `%Rule{}` 生成→承認→ホットロード |
| **P4 遠隔 & 運用** | Tailscale 遠隔、`:telemetry`/LiveDashboard、バックアップ | 外からダッシュボード操作、メトリクス可視化 |
| **P5 実機統合 → 拡大** | Zigbee2MQTT 導入で仮想→実機、在室/電力/通知へ拡張 | 実機1個がシミュレータと同じコードで動く |

**実機が無いのはむしろ好都合。** P1〜P4 を全部シミュレータ（仮想デバイスが PubSub に状態を流すだけ）で完成でき、ノートPC1台で「殺して直る」「LLM 切っても動く」を実演できる。実機は P5 で同じインターフェースに差し込むだけ。

「範囲を広く」は同じ4部品（Registry・PubSub・Supervisor・Rule）の反復で伸びる。在室検知 / 電力モニタ / 通知 / 音声 / スケジュール / 履歴分析 ── どれも「バスに繋がる新しいプロセス群 + 新しいルール」でしかなく、認知コストが線形にしか増えない。

## 祭りデモシナリオ

1. **プロセスを殺して自己回復** ── デバイスプロセスを `Process.exit` で落とし、Supervisor が即座に復帰させる様子を見せる
2. **家を止めず自然言語でルール追加** ── LiveView から「夜に廊下で動いたら5分点灯」と入力 → LLM が `%Rule{}` 生成 → 承認 → 無停止でホットロード
3. **LLM を切断しても家は動く** ── ネットを切り、既存ルールで自動化が継続することを実演（local-first の証明）

## Open questions

- Hub の具体機種（既存箱のどれにするか）→ 別途確定
- 永続化: SQLite（単一箱で十分）か Postgres か。時系列データの長期保存方針
- LLM フォールバック: Bumblebee でローカル intent 分類をどこまで持つか
- Gleam をどのモジュールで同居させると祭り映えと実益が両立するか（ルールエンジン候補）
- 実機の最初の1台（Zigbee2MQTT 対応デバイス）の選定

## 関連

- [[functional-programming]] / [[pure-functional-programming]] — 本プロジェクトの中核パラダイム
- [[algebraic-effects]] — 副作用の宣言/処理分離。ルール実行の effect 設計の参考
- [[adt-gadt]] — ルール・コマンドを ADT で型安全に表現する
- [[edge-vs-cloud-vs-onprem]] — local-first 採用の判断軸
- [[distributed-consistency]] — BEAM クラスタで Hub + エッジノードを分散する際の一貫性
- [[edge-design-patterns]] — エッジでの処理設計（遠隔アクセス層の参考）
