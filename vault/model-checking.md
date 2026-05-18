---
title: モデル検査
tags: [formal-methods, computer-science]
---

[[formal-methods|形式手法]]の一種。システムの状態を網羅的に探索して、仕様違反がないことを自動で検証する。

## プログラマ向けの一言

**状態遷移を全パターン試して「デッドロックしない」「必ず完了する」等を機械的に保証する。** 人間が証明を書く[[theorem-proving|定理証明]]と違い、機械が全自動でやってくれる。

## コードで理解する

```ts
// 例: 2つのプロセスが共有リソースを取り合う
type State = { p1: "idle" | "waiting" | "critical"; p2: "idle" | "waiting" | "critical"; lock: boolean };

// 全状態を探索して「2つのプロセスが同時に critical にならない」を検証
function modelCheck(): boolean {
  const initial: State = { p1: "idle", p2: "idle", lock: false };
  const visited = new Set<string>();
  const queue: State[] = [initial];

  while (queue.length > 0) {
    const state = queue.shift()!;
    const key = JSON.stringify(state);
    if (visited.has(key)) continue;
    visited.add(key);

    // 安全性検査: 2つが同時に critical section に入っていないか？
    if (state.p1 === "critical" && state.p2 === "critical") {
      console.log("VIOLATION!", state);
      return false; // 仕様違反を発見
    }

    // 次の状態を列挙（可能な遷移すべて）
    for (const next of transitions(state)) {
      queue.push(next);
    }
  }
  return true; // 全状態を探索して違反なし
}

function transitions(s: State): State[] {
  const nexts: State[] = [];
  // p1 の遷移
  if (s.p1 === "idle") nexts.push({ ...s, p1: "waiting" });
  if (s.p1 === "waiting" && !s.lock) nexts.push({ ...s, p1: "critical", lock: true });
  if (s.p1 === "critical") nexts.push({ ...s, p1: "idle", lock: false });
  // p2 の遷移
  if (s.p2 === "idle") nexts.push({ ...s, p2: "waiting" });
  if (s.p2 === "waiting" && !s.lock) nexts.push({ ...s, p2: "critical", lock: true });
  if (s.p2 === "critical") nexts.push({ ...s, p2: "idle", lock: false });
  return nexts;
}
```

## 検証できる性質

```ts
// 安全性 (Safety): 「悪いことが起きない」
// → デッドロックしない、2つのプロセスが同時に critical に入らない

// 活性 (Liveness): 「良いことがいつか起きる」
// → リクエストにはいつか応答が返る、待っているプロセスはいつか実行される

// これらは [[temporal-logic|時相論理]] で形式的に記述する
```

## 主要ツール

- **TLA+** — Amazon (AWS) が S3, DynamoDB の検証に使用。Leslie Lamport 作
- **Spin** — 並行システムのモデル検査。LTL で仕様記述
- **Alloy** — 軽量な形式手法。リレーショナルモデル

## 限界: 状態爆発

```ts
// 変数が増えると状態数が指数関数的に爆発する
// bool 変数 3つ → 2^3 = 8 状態
// bool 変数 30個 → 2^30 = 10億状態 → メモリに載らない
//
// 対策: 抽象化、対称性の利用、部分順序簡約
// → それでも大規模システムには限界がある
// → だから定理証明との使い分けが重要
```

## 関連

- [[formal-methods|形式手法]] — モデル検査はその一手法
- [[theorem-proving|定理証明]] — 全探索の代わりに証明を書く手法
- [[temporal-logic|時相論理]] — モデル検査の仕様記述に使う論理
