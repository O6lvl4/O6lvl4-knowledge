---
title: AITubeStudio (仮)
tags: [almide, aituber, agent, product, draft, planning]
created_at: 2026-05-07
updated_at: 2026-05-07
draft: true
srs_state: new
card_count: 6
reviewed_count: 0
next_due: 2026-05-07
---

> **[仮版・planning]** AITubeStudio はまだ実装されていない計画段階のプロダクト。プロダクト名（"AITubeStudio" 自体が仮置き）・スコープ・市場ポジションすべて流動的。本ドキュメントは Almide エコシステムにおけるこのプロダクトの構造的役割を記述する planning ノート。

Almide エコシステムにおける **showcase product**。Web 時代に Basecamp が Rails の起源プロダクトだったのと同じ役割を担う。AITubeStudio から、Almide における Rails 等価物（フレームワーク、名前 TBD）が抽出される予定。

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

## AITubeStudio が Basecamp 役を担う理由

候補は他にもあった:

- **homullus**（既存の AI agent CLI runtime、Almide 製）
- daily 自動化エージェント（GitHub triage / CI watcher 等）
- **almide-aituber**（既存の AITuber 関連実装）

これらと比較して、AITubeStudio が Basecamp 級のショーケースにふさわしい理由は:

1. **要求の幅が広い** — エージェントループだけでなく、persona / voice / avatar / 配信 / リアルタイム対話 / スケジュール / 収益化など、長尺の機能要求がある。フレームワーク抽出の母体として豊富な抽象を生む
2. **長時間運用が前提** — 配信中の永続エージェントループは agent framework の真の難所（メモリ、エラー復旧、状態管理、コスト最適化）。短命タスクの繰り返しでは出てこない要求が顕在化する
3. **市場性がある** — Basecamp が「金を払うユーザーがいる」SaaS だったのと同じく、AITubeStudio は理論上の現場ではなく実在する経済圏（AITuber 市場）に向く
4. **Mastra で作りにくい領域** — 永続ループ + 低レイテンシ応答 + WASM 配布（クライアント側で動かす可能性）は、TS/Node 基盤で作ろうとすると構造的に重くなる。Almide 基盤の強み（単一バイナリ・WASM 直接 emit・GC なし）が直接効く差別化領域

つまり AITubeStudio は **Almide 基盤からしか出せない性質を、実プロダクトとして証明する場** になる。

## homullus の位置づけ（修正）

homullus は Basecamp ではなく、**AITubeStudio に至る前段の testbed / dogfooding 環境**。

- Almide の言語機能を実コードで圧力テストする現場（compiler PR を産む）
- AI agent の最小ループパターン（query → tool → response → 再帰）を検証する場
- 将来抽出される framework の原型（agent loop / tool dispatch / permission resolver）を先に試す前哨地

Rails の用語で言えば、homullus は「Basecamp 直前の社内ツール群」に近い。Basecamp 級のプロダクトが立ち上がる前に、抽象の素地が homullus で先行整備される構造。

framework として抽出されるのは AITubeStudio に達する段階であり、homullus から直接抽出するのではない。homullus で先行検証された抽象が、AITubeStudio で「実プロダクトの要求」に磨かれた段階で初めて framework として独立する。

## フレームワークの名前について

framework name は未定。"Reins" は候補から外れた。名前選定のタイミングは:

- AITubeStudio v0 が動き始め、framework 的な抽象が現実に見え始めた段階
- 第二の現場（homullus / 他のエージェント）で再利用可能性が確認できた段階

それまでは「Almide の Rails 等価物」または「Almide エージェントフレームワーク」として placeholder 参照に留める。

## ポジショニング — Mastra を超える水準

AITubeStudio + framework の組み合わせが target にする水準は、現時点で agent framework として領先している **Mastra**（TypeScript ベース）。

差別化軸:

| 軸 | Mastra | Almide エコシステム（目標）|
|---|---|---|
| 基盤言語 | TypeScript（Node 中心）| Almide（Rust 出力 / WASM 直接 emit）|
| ツール定義の失敗モデル | ランタイム検証 | `effect fn` で型システムが保証（コンパイル時）|
| 配布ターゲット | Node / serverless | ネイティブバイナリ + WASM（ブラウザ・エッジ・組込）|
| 実行時依存 | Node + 多数の npm 依存 | GC なし・ランタイムなし・単一バイナリ |
| エージェントコードの修正生存性 | TS の型はあるが MSR 概念なし | MSR を一次指標として設計（[[the-almide-doctrine]]）|
| 規約密度 | TS の表現多様性をそのまま受け継ぐ | One Canonical Form でコーパスが一貫 |
| トークン経済性 | TS ボイラープレート分の context 消費 | 構文ノイズが少なく agent 定義が小さい context に収まる |

「Mastra を超える」という野心の核は機能網羅で勝つことではなく、**エージェントコード自体を AI が連続的に修正しても壊れない性質**（MSR）を構造的に確保すること。これは TS 上では原理的に難しく、Almide 基盤だからこそ提供できる差別化軸。AITubeStudio はこの差別化軸を **動くプロダクトとして実証する場** になる。

## 4 ステップ計画

1. **AITubeStudio v0 構想** — プロダクトスコープと最小機能の明確化（永続配信 agent / persona / voice / avatar / 視聴者対話 / どこを切るか）
2. **AITubeStudio v0 実装** — homullus / almai / Almide stdlib を基盤に組み立て。homullus が先行整備した agent loop 抽象をプロダクト要求で揉む
3. **抽象抽出** — AITubeStudio + homullus の共通要素から再利用可能な agent 語彙を切り出し、framework として独立化（このタイミングで名前確定）
4. **第二の現場で検証** — framework v0 を別プロダクトで再利用、抽象の妥当性確認。妥当でなければ作り直す

この経路を経て、初めて Mastra を超える AI agent framework が成立する。

## 押さえどころ（カード化候補）

- AITubeStudio (仮) の役割 → **Almide エコシステムの Basecamp。Web 時代の Basecamp:Rails と同じ位置で、framework 抽出の起源プロダクト**
- 構造的アナロジー → **Ruby:Rails:Basecamp = Almide:?(TBD):AITubeStudio(仮)**
- AITubeStudio が Basecamp 役にふさわしい理由 → **要求の幅広さ・長時間運用・市場性・Mastra で作りにくい領域、の 4 点**
- homullus の正しい位置づけ → **Basecamp ではなく testbed / dogfooding 環境。AITubeStudio に至る前段で agent loop 抽象を先行検証する場**
- framework 名選定のタイミング → **AITubeStudio v0 が動き、第二の現場で再利用可能性が確認できた段階。それまでは placeholder**
- Mastra を超える差別化の核 → **機能網羅ではなく、エージェントコード自体の MSR（修正生存性）。TS では原理的に難しく Almide 基盤だからこそ提供できる**

## Links

- [almide/homullus（先行 testbed）](https://github.com/almide/homullus)
- [almide/almai（multi-provider LLM client）](https://github.com/almide/almai)
- [Mastra（比較対象の TS agent framework）](https://mastra.ai/)
- [Almide 公式](https://almide.github.io/)
