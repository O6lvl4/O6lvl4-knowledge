---
title: HTN Planning（階層型タスクネットワーク）
tags: [ai-planning, task-management, formal-methods]
created_at: 2026-05-25
updated_at: 2026-05-25
---

AI 計画の古典的手法。タスクを**前提条件 (preconditions)** と**効果 (effects)** で定義し、目標達成のための手順を自動導出する。

## プログラマ向けの一言

**ゲームのクエストフラグ管理と本質的に同じ構造。「フラグが揃ったら次が開放」「完了したらフラグが立つ」を形式化したもの。**

## クエストフラグ管理との対応

```ts
// ゲームのクエスト
type Quest = {
  name: string;
  requiredFlags: string[];   // 前提フラグ（これが全部立ってないと着手不可）
  grantsFlags: string[];     // 完了で立つフラグ
  status: "undiscovered" | "available" | "active" | "completed";
};

// HTN Planning のアクション（同じ構造）
type Action = {
  name: string;
  preconditions: string[];   // 前提条件
  effects: string[];         // 効果（世界の状態変化）
  status: "pending" | "applicable" | "executing" | "done";
};

// 本質的に同一。呼び方が違うだけ。
```

## 基本モデル: STRIPS

HTN の基礎となる STRIPS (Stanford Research Institute Problem Solver, 1971) の形式化。

```ts
// 世界の状態 = フラグの集合
type WorldState = Set<string>;

// アクション = 前提条件 + 追加効果 + 削除効果
type StripsAction = {
  name: string;
  preconditions: string[];  // これが全部 state に含まれていたら実行可能
  addEffects: string[];     // 実行後に state に追加
  deleteEffects: string[];  // 実行後に state から削除
};

// アクションが実行可能か判定
function isApplicable(action: StripsAction, state: WorldState): boolean {
  return action.preconditions.every(p => state.has(p));
}

// アクションを適用して新しい状態を返す
function apply(action: StripsAction, state: WorldState): WorldState {
  const next = new Set(state);
  for (const e of action.deleteEffects) next.delete(e);
  for (const e of action.addEffects) next.add(e);
  return next;
}
```

## 具体例: 日常タスクの依存管理

```ts
const actions: StripsAction[] = [
  {
    name: "wasmtime に PR を出す",
    preconditions: [],                          // 前提なし、いつでも着手可
    addEffects: ["bytecodeAllianceContributor"], // 貢献者フラグが立つ
    deleteEffects: [],
  },
  {
    name: "Almide WASM ベンチマーク公開",
    preconditions: ["almideWasmOutput"],         // Almide の WASM 出力が動くこと
    addEffects: ["benchmarkPublished"],
    deleteEffects: [],
  },
  {
    name: "技術ブログ3本書く",
    preconditions: [],
    addEffects: ["blogThreeArticles"],
    deleteEffects: [],
  },
  {
    name: "日本語コミュニティ作成",
    preconditions: ["blogThreeArticles"],        // ブログ3本が前提
    addEffects: ["communityCreated"],
    deleteEffects: [],
  },
  {
    name: "カンファレンス CFP 提出",
    preconditions: ["communityCreated", "benchmarkPublished"],  // 両方必要
    addEffects: ["cfpSubmitted"],
    deleteEffects: [],
  },
  {
    name: "デモ動画作成",
    preconditions: ["benchmarkPublished"],
    addEffects: ["demoReady"],
    deleteEffects: [],
  },
];

// 現在の状態
const currentState: WorldState = new Set(["almideWasmOutput"]);

// 今やれること = preconditions が全て満たされているアクション
const availableActions = actions.filter(a => isApplicable(a, currentState));
// → ["wasmtime に PR を出す", "Almide WASM ベンチマーク公開", "技術ブログ3本書く"]
```

## HTN の「階層」部分

STRIPS は平坦なアクション列。HTN はこれに**階層的分解**を加える。

```ts
// 複合タスク = 複数のサブタスクに分解される
type CompoundTask = {
  name: string;
  preconditions: string[];
  // 分解方法（複数の方法がありうる = 選択肢）
  methods: Method[];
};

type Method = {
  name: string;
  preconditions: string[];   // この分解方法を選ぶ条件
  subtasks: string[];        // 分解後のサブタスク（順序あり）
};

// 例: 「ミドルウェア商用化」は複数の方法で達成できる
const commercialize: CompoundTask = {
  name: "ミドルウェアを商用化する",
  preconditions: ["runtimeMVP"],
  methods: [
    {
      name: "日本市場先行",
      preconditions: ["japaneseDocsReady"],
      subtasks: ["日本企業にアルファ提供", "導入事例を作る", "ライセンス販売開始"],
    },
    {
      name: "グローバル先行",
      preconditions: ["englishDocsReady"],
      subtasks: ["Product Hunt に出す", "海外テックブログ", "ライセンス販売開始"],
    },
  ],
};

// ゲームでいう「メインクエストの攻略ルート分岐」と同じ。
// どの method を選ぶかで展開されるサブタスクが変わる。
```

## 自動計画（プランニング）

目標状態を与えると、現在の状態から到達するためのアクション列を自動で見つける。

```ts
// 前方探索による単純なプランナー
function plan(
  actions: StripsAction[],
  initial: WorldState,
  goal: string[],
): string[] | null {
  // BFS で最短計画を探索
  const queue: Array<{ state: WorldState; plan: string[] }> = [
    { state: initial, plan: [] },
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { state, plan } = queue.shift()!;

    // 目標達成チェック
    if (goal.every(g => state.has(g))) return plan;

    const key = [...state].sort().join(",");
    if (visited.has(key)) continue;
    visited.add(key);

    // 適用可能な全アクションを試す
    for (const action of actions) {
      if (isApplicable(action, state)) {
        queue.push({
          state: apply(action, state),
          plan: [...plan, action.name],
        });
      }
    }
  }

  return null; // 計画が見つからない
}

// 使用例
const result = plan(actions, currentState, ["cfpSubmitted"]);
// → ["Almide WASM ベンチマーク公開", "技術ブログ3本書く",
//    "日本語コミュニティ作成", "カンファレンス CFP 提出"]
// 自動で依存を解決して順序を出してくれる
```

## PDDL（Planning Domain Definition Language）

HTN Planning の標準記述言語。国際計画コンペティション (IPC) で使われる。

```lisp
;; ドメイン定義（アクションの種類）
(define (domain aid-on-strategy)
  (:predicates
    (bytecode-alliance-contributor)
    (benchmark-published)
    (blog-three-articles)
    (community-created)
    (cfp-submitted))

  (:action submit-wasmtime-pr
    :precondition ()
    :effect (bytecode-alliance-contributor))

  (:action publish-benchmark
    :precondition (almide-wasm-output)
    :effect (benchmark-published))

  (:action write-three-blogs
    :precondition ()
    :effect (blog-three-articles))

  (:action create-community
    :precondition (blog-three-articles)
    :effect (community-created))

  (:action submit-cfp
    :precondition (and (community-created) (benchmark-published))
    :effect (cfp-submitted)))

;; 問題定義（初期状態と目標）
(define (problem phase-1)
  (:domain aid-on-strategy)
  (:init (almide-wasm-output))
  (:goal (cfp-submitted)))
```

## 関連する概念・分野

- [[formal-methods|形式手法]] — HTN Planning は状態の形式的な記述と探索
- [[model-checking|モデル検査]] — 「デッドロック（どのタスクも進めない状態）がないか」を検証できる
- [[temporal-logic|時相論理]] — 「いつかは完了する」「常に安全である」等の性質を記述
- [[component-model|Component Model]] — WASM Component 間の依存解決にも同じ構造が現れる
- [[edge-computing|エッジコンピューティング]] — Aid-On 戦略の文脈

## Petri Nets との関係

[[petri-nets|ペトリネット]]は HTN と相補的。

```
HTN:       「何をするか」の計画。前提と効果でアクションを記述。
Petri Net: 「状態がどう遷移するか」のモデル。並行性とデッドロックを分析。
```

クエストフラグ管理を作るなら、HTN でタスク構造を定義し、Petri Net で「詰み状態がないか」を検証する組み合わせが強い。

## Statecharts との関係

Harel の Statecharts は状態機械に階層と並行性を加えたもの。

```
HTN:          タスクの分解と計画。「何を、どの順で」
Statecharts:  状態の管理。「今どこにいるか、次に何が起きうるか」
```

実装するなら XState (TypeScript) が Statecharts の現代的な実装。HTN の計画結果を XState で状態管理するのが実用的。

## 参考文献

- Ghallab, Nau, Traverso. *"Automated Planning: Theory and Practice"* (2004) — AI 計画の教科書。HTN を含む全手法を網羅
- Erol, Hendler, Nau. *"HTN Planning: Complexity and Expressivity"* (1994) — HTN の計算量と表現力の理論的分析
- Fikes & Nilsson. *"STRIPS: A New Approach to the Application of Theorem Proving to Problem Solving"* (1971) — 全ての始まり
- Ghallab et al. *"PDDL - The Planning Domain Definition Language"* (1998) — 標準記述言語
- IPC (International Planning Competition) — 最新のプランナー実装とベンチマーク: ipc.icaps-conference.org
