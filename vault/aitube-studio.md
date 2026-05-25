---
title: AITubeStudio (仮)
tags: [almide, aituber, agent, product, draft, planning]
draft: true
created_at: 2026-05-07
updated_at: 2026-05-07
---

> **[仮版・planning]** AITubeStudio はまだ実装されていない計画段階のプロダクト。プロダクト名（"AITubeStudio" 自体が仮置き）・スコープ・市場ポジションすべて流動的。本ドキュメントは Almide エコシステムにおけるこのプロダクトの構造的役割を記述する planning ノート。

Almide エコシステムにおける **showcase product**。具体的には [Aid-On/openaituber](https://github.com/Aid-On/openaituber)（TypeScript / React / Three.js / three-vrm 製、開発中の OSS AITuber 配信基盤）の **Almide 版実装** に相当する。Web 時代に Basecamp が Rails の起源プロダクトだったのと同じ役割を担い、AITubeStudio から Almide における Rails 等価物（フレームワーク、名前 TBD）が抽出される予定。

## 構造的アナロジー

```
Ruby   :  Rails       :  Basecamp
Almide :  ? (TBD)     :  AITubeStudio (仮)
```

```mermaid
flowchart LR
    subgraph future["AI エージェント時代"]
      Almide[Almide<br/>言語] --> FW[? (名前 TBD)<br/>エージェント FW]
      FW -.抽出元.-> Studio[AITubeStudio<br/>仮]
    end
    subgraph past["Web 時代"]
      Ruby[Ruby] --> Rails[Rails]
      Rails -.抽出元.-> Basecamp[Basecamp]
    end
```

各層の対応関係:

| 役割 | Web 時代 | AI エージェント時代 |
|---|---|---|
| 言語 | Ruby | Almide |
| フレームワーク | Rails | ? (名前 TBD) |
| 起源プロダクト | Basecamp | AITubeStudio (仮) |
| 競合相手 | Java EE / PHP（重い、構造がない）| Mastra（TS / Node 中心）|

## openaituber を Almide 化するということ

AITubeStudio は架空の構想ではなく、**現に開発が進んでいる TS 製プロダクトの Almide 版** という具体的な位置を持つ。

[openaituber](https://github.com/Aid-On/openaituber) のスコープ（要約）:

- VRM アバターのブラウザ内描画（three-vrm 経由）と FBX モーション再生
- 表情プリセット、視線・口の動き、自動瞬き / 呼吸 / 微小揺れなどの idle 挙動
- マイク入力リップシンク、TTS 音声再生駆動の口同期
- カメラプリセット、背景・ライティング制御
- 外部 AI エージェントが接続する **WebSocket API**（`setEmotion` / `lookAt` / `speak` / `playFbx` / `setCamera` / `setBackground` 等のコマンド体系）
- OBS ブラウザソース取り込み用の chrome-free 描画モード

つまり openaituber は **「アバターの描画・制御サーフェス」** であって、エージェント本体ではない。エージェントは外部から WebSocket でこれを駆動する。AITubeStudio は同じ役割を Almide で担い直す。

**Almide 化することで何が変わるか**:

| 観点 | openaituber (TS) | AITubeStudio (Almide) |
|---|---|---|
| ランタイム | Node / Vite / React | Almide → WASM 直接 emit、または native binary |
| クライアント | ブラウザ + React SPA | WASM 単独 or 軽量 host（GC なし、依存少）|
| プロトコル定義 | `protocol.ts`（TS 型）| `effect fn` シグネチャ + `Result` 伝播 |
| 失敗モデル | ランタイムチェック / try-catch | コンパイル時に保証される effect 型 |
| 配布 | Node 起動 + npm 依存 | 単一バイナリ + WASM、エッジで動く可能性 |
| 修正生存性 | TS の型はあるが MSR 概念なし | MSR を一次指標として設計（[[the-almide-doctrine]]）|

Almide で書き直すことが意味を持つのは、**WASM 配布で Node 依存を消し、effect 型でプロトコル契約をコンパイル時に保証し、コードベースを LLM が連続修正しても壊れないようにする** こと。これは TS 上では構造的に難しい領域。

## AITubeStudio が Basecamp 役を担う理由

候補は他にもあった:

- **homullus**（既存の AI agent CLI runtime、Almide 製）
- daily 自動化エージェント（GitHub triage / CI watcher 等）
- **almide-aituber**（既存の AITuber 関連実装）

これらと比較して、AITubeStudio（openaituber の Almide 版）が Basecamp 級のショーケースにふさわしい理由は:

1. **要求の幅が広い** — アバター描画・モーション・表情・音声・WebSocket 制御・OBS 連携・外部エージェント接続まで、複数のサブシステムを束ねる。フレームワーク抽出の母体として豊富な抽象を生む
2. **長時間・リアルタイム運用が前提** — 配信中はミリ秒応答とフレーム更新が要求される。短命タスクでは表面化しない実時間制約・状態同期・エラー復旧の要求が顕在化する
3. **既に TS 版に現実の検証がある** — openaituber が動いており、機能要件と protocol が判明している。設計から始める空理空論ではなく、ポート先として明確
4. **Almide 基盤の強みが直接効く領域** — WASM 配布でブラウザクライアントを Node-free にできる、effect 型で WebSocket protocol を契約化できる、単一バイナリでエッジ配置できる、など TS/Node 基盤では構造的に難しい性質が需要に直結
5. **市場性がある** — AITuber は既に経済圏が成立しているニッチ。Basecamp が「金を払うユーザーがいる」SaaS だったのと同じく、理論上の現場ではない

つまり AITubeStudio は **Almide 基盤からしか出せない性質を、既に存在する実需要に対して証明する場** になる。

## homullus と AITubeStudio — 違うレイヤを叩く 2 つの現場

homullus と AITubeStudio は同じ framework の異なるレイヤを叩く 2 つの現場として並走する。どちらか一方が Basecamp なのではなく、**両方を経由して初めて framework として一般化に耐える抽象が抽出される**。

| | homullus | AITubeStudio |
|---|---|---|
| 形態 | CLI agent runtime | リアルタイム配信 + 制御サーフェス |
| 駆動形 | 単発リクエスト → ツール → 完了 | 永続ループ + フレーム更新 + 外部 protocol |
| 叩く層 | agent core（loop / tool / permission / memory / provider）| character / streaming（avatar / animation / protocol / multimedia / 実時間制約）|
| 状態 | 短命の REPL 状態 | 長時間の配信状態（persona / 履歴 / 視聴者文脈）|
| 失敗モード | コマンド失敗 → やり直し | フレーム落ち / 接続切断 / 音声同期ズレ |

つまり:

- **homullus が叩くのは agent core 層** — どの agent framework にも共通する「LLM とツールを往復しながら状態を進める」抽象
- **AITubeStudio が叩くのは domain + realtime 層** — AITuber に固有のアバター制御・配信統合・外部プロトコル

framework は両者の積として育つ。homullus 単独で抽出すると agent core に偏り、AITubeStudio 単独で抽出すると AITuber 固有の都合が抽象に染み込みすぎる。**両方の重力場の交点に framework を置く** のが筋の良い抽出ライン。

この意味で「Basecamp」は厳密には AITubeStudio が担うが、homullus は **「framework が AITubeStudio に閉じない汎用性を持つことを保証する第二現場」** として不可欠。Rails の歴史で言えば、Basecamp 抽出後の Rails が他のアプリで使われ始めた最初期段階を、homullus が並行して先取りしている構図。

## フレームワークの名前について

framework name は未定。"Reins" は候補から外れた。名前選定のタイミングは:

- AITubeStudio v0 が動き始め、framework 的な抽象が現実に見え始めた段階
- 第二の現場（homullus / 他のエージェント）で再利用可能性が確認できた段階

それまでは「Almide の Rails 等価物」または「Almide エージェントフレームワーク」として placeholder 参照に留める。

## ポジショニング — Mastra を超える水準

AITubeStudio + framework の組み合わせが target にする水準は、現時点で agent framework として領先している **Mastra**（TypeScript ベース）。ただし「超える」軸は機能網羅ではなく、Almide 基盤からしか出せない性質と、AITuber というドメイン固有の要求の交点にある。

差別化軸:

| 軸 | Mastra | Almide エコシステム（目標）|
|---|---|---|
| 基盤言語 | TypeScript（Node 中心）| Almide（Rust 出力 / WASM 直接 emit）|
| 適用領域 | 汎用 agent（タスク自動化・ワークフロー）| 汎用 agent + リアルタイムキャラクター駆動 |
| ツール定義の失敗モデル | ランタイム検証 | `effect fn` で型システムが保証（コンパイル時）|
| 配布ターゲット | Node / serverless | ネイティブバイナリ + WASM（ブラウザ・エッジ・組込）|
| 実行時依存 | Node + 多数の npm 依存 | GC なし・ランタイムなし・単一バイナリ |
| エージェントコードの修正生存性 | TS の型はあるが MSR 概念なし | MSR を一次指標として設計（[[the-almide-doctrine]]）|
| 規約密度 | TS の表現多様性をそのまま受け継ぐ | One Canonical Form でコーパスが一貫 |
| トークン経済性 | TS ボイラープレート分の context 消費 | 構文ノイズが少なく agent 定義が小さい context に収まる |
| リアルタイム / フレーム更新 | 想定外（serverless / 単発リクエスト型）| 一級市民（AITubeStudio 由来の要求）|

「Mastra を超える」という野心の核は次の 2 つ:

1. **エージェントコード自体の MSR** — AI が連続的に修正しても壊れない性質を構造的に確保する。TS 上では原理的に難しく、Almide 基盤だからこそ提供できる
2. **リアルタイムキャラクター駆動領域のカバー** — Mastra や LangGraph のような汎用 agent framework がカバーしていない、配信・アバター制御・低レイテンシ対話の領域。openaituber が示した実需要に直接応えるドメイン

AITubeStudio はこれら 2 軸を **動くプロダクトとして実証する場** になる。汎用 agent framework としても勝てる地盤を持ちつつ、ドメイン固有の強みでも勝てる構造。

## 4 ステップ計画

1. **openaituber スコープ確定 + AITubeStudio v0 設計** — TS 版 openaituber のうち何をそのまま Almide 化し、何を Almide 流に再設計するかの線引き（VRM 描画は WASM 経由、protocol は `effect fn` で契約化、など）
2. **AITubeStudio v0 実装** — homullus / almai / Almide stdlib を基盤に組み立て。homullus 側で先行整備した agent loop 抽象を、AITubeStudio のリアルタイム制約で揉む
3. **抽象抽出** — AITubeStudio + homullus の共通要素から再利用可能な語彙を切り出し、framework として独立化（このタイミングで名前確定）
4. **第二の現場で検証** — framework v0 を別プロダクト（汎用 agent / 別ジャンルのキャラクター）で再利用、抽象の妥当性確認。妥当でなければ作り直す

この経路を経て、初めて Mastra を超える AI エージェントフレームワークが成立する。出発点は架空構想ではなく、TS 版 openaituber が既に開発中である現実なので、ステップ 1 は「設計から始める」ではなく「既存実装の境界を引き直す」という具体的な作業になる。

## 押さえどころ（カード化候補）

- AITubeStudio (仮) の正体 → **Aid-On/openaituber（TS / React / three-vrm 製の AITuber 配信基盤）の Almide 版実装。Almide エコシステムの Basecamp 役**
- 構造的アナロジー → **Ruby:Rails:Basecamp = Almide:?(TBD):AITubeStudio(仮)**
- openaituber を Almide 化する意味 → **WASM 配布で Node 依存を消す / `effect fn` で WebSocket protocol をコンパイル時契約化する / コードを LLM が連続修正しても壊れない MSR を獲得する**
- homullus と AITubeStudio の関係 → **同じ framework の異なるレイヤを叩く 2 つの現場。homullus は agent core 層、AITubeStudio は character + realtime 層。両者の交点に framework を置く**
- framework 名選定のタイミング → **AITubeStudio v0 が動き、第二の現場で再利用可能性が確認できた段階。それまでは placeholder**
- Mastra を超える 2 つの軸 → **(1) エージェントコード自体の MSR（TS では原理的に難しい）/ (2) リアルタイムキャラクター駆動領域（汎用 agent framework がカバーしていないドメイン）**
- 出発点の特殊性 → **設計から始める空理空論ではなく、TS 版 openaituber が既に動いている現実から境界を引き直す作業として始まる**

## Links

- [Aid-On/openaituber（AITubeStudio の TS 版・移植元）](https://github.com/Aid-On/openaituber)
- [almide/homullus（agent core 層の testbed）](https://github.com/almide/homullus)
- [almide/almai（multi-provider LLM client）](https://github.com/almide/almai)
- [Mastra（比較対象の汎用 agent framework）](https://mastra.ai/)
- [Almide 公式](https://almide.github.io/)
- [three-vrm（openaituber が描画に利用、Almide 版での扱いは設計時に検討）](https://github.com/pixiv/three-vrm)
