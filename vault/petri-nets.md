---
title: ペトリネット
tags: [formal-methods, concurrency, computer-science]
created_at: 2026-05-25
updated_at: 2026-05-25
---

並行システムの状態遷移を数学的にモデル化する手法。1962年、Carl Adam Petri の博士論文に由来。

## プログラマ向けの一言

**「複数のことが同時に進む」システムで、デッドロックや到達不能状態がないかを数学的に検証できる。** ゲームのクエストフラグ管理、ワークフローエンジン、並行プログラミングの裏側にいる。

## 基本要素

```ts
// ペトリネットの3要素
type Place = string;       // 場所（状態・条件を表す。= フラグ）
type Transition = string;  // 遷移（イベント・アクションを表す）
type Token = number;       // トークン（場所にある印。= フラグが立っている数）

type PetriNet = {
  places: Place[];
  transitions: Transition[];
  // 入力辺: この遷移を発火するのに必要なトークン
  inputArcs: Map<Transition, Map<Place, number>>;
  // 出力辺: 発火後にトークンが置かれる場所
  outputArcs: Map<Transition, Map<Place, number>>;
};

type Marking = Map<Place, number>;  // マーキング = 現在の状態（各場所のトークン数）
```

## クエストフラグ管理としての解釈

```ts
// クエスト「カンファレンス CFP 提出」をペトリネットで表現
//
//   [ブログ3本] ──→ (コミュニティ作成) ──→ [コミュニティ済]─┐
//                                                       ├→ (CFP提出) → [CFP済]
//   [ベンチ公開] ────────────────────────────────────────┘
//
// [] = place (フラグ)
// () = transition (タスク)

const net: PetriNet = {
  places: ["blogDone", "benchmarkDone", "communityDone", "cfpDone"],
  transitions: ["createCommunity", "submitCFP"],
  inputArcs: new Map([
    ["createCommunity", new Map([["blogDone", 1]])],          // ブログ3本が前提
    ["submitCFP", new Map([["communityDone", 1], ["benchmarkDone", 1]])],  // 両方必要
  ]),
  outputArcs: new Map([
    ["createCommunity", new Map([["communityDone", 1]])],
    ["submitCFP", new Map([["cfpDone", 1]])],
  ]),
};

// 遷移が発火可能か判定
function isEnabled(net: PetriNet, marking: Marking, t: Transition): boolean {
  const required = net.inputArcs.get(t);
  if (!required) return false;
  for (const [place, count] of required) {
    if ((marking.get(place) ?? 0) < count) return false;
  }
  return true;
}

// 遷移を発火して新しいマーキングを返す
function fire(net: PetriNet, marking: Marking, t: Transition): Marking {
  const next = new Map(marking);
  // 入力場所からトークンを消費
  for (const [place, count] of net.inputArcs.get(t)!) {
    next.set(place, (next.get(place) ?? 0) - count);
  }
  // 出力場所にトークンを生成
  for (const [place, count] of net.outputArcs.get(t)!) {
    next.set(place, (next.get(place) ?? 0) + count);
  }
  return next;
}

// 使用例
let state: Marking = new Map([["blogDone", 1], ["benchmarkDone", 1]]);
// → createCommunity が発火可能（blogDone が必要、ある）
// → submitCFP は発火不可（communityDone がまだない）

state = fire(net, state, "createCommunity");
// → communityDone にトークンが置かれる
// → submitCFP が発火可能になる
```

## HTN Planning との違い

```
HTN Planning:  「ゴールに到達する手順」を計画する。前向きの探索。
ペトリネット: 「全ての状態遷移」をモデル化して性質を検証する。

HTN = 何をするか決める
ペトリネット = それで問題が起きないか確かめる
```

併用が強い。[[htn-planning|HTN]] で計画を立て、ペトリネットでデッドロックがないか検証する。

## 検証できる性質

```ts
// 1. 到達可能性 (Reachability)
// 「この状態に到達できるか？」
// → 「CFP 提出済み」に到達できるか？

// 2. 有界性 (Boundedness)
// 「トークンが無限に増えないか？」
// → フラグが際限なく増殖するバグがないか

// 3. 活性 (Liveness)
// 「どの遷移もいつかは発火可能になるか？」
// → 永遠に着手できないタスクがないか（デッドロック検出）

// 4. 安全性 (Safety)
// 「各場所のトークンが1以下か？」
// → フラグは ON/OFF の2値に収まるか
```

## 関連

- [[htn-planning|HTN Planning]] — タスクの計画。ペトリネットで検証
- [[formal-methods|形式手法]] — ペトリネットは形式検証の一手法
- [[model-checking|モデル検査]] — ペトリネットの状態空間を全探索して性質を検証
- [[temporal-logic|時相論理]] — 「いつかは完了する」等の性質を記述する論理

## 参考文献

- Murata. *"Petri Nets: Properties, Analysis and Applications"* (1989) — 最も引用されるサーベイ論文
- Peterson. *"Petri Net Theory and the Modeling of Systems"* (1981) — 教科書
- van der Aalst. *"Workflow Management: Models, Methods, and Systems"* (2002) — ペトリネットのワークフロー応用
