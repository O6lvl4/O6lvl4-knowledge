---
title: 時相論理
tags: [formal-methods, computer-science, logic]
created_at: 2026-05-18
updated_at: 2026-05-19
---

「いつか」「常に」「〜するまで」といった時間に関する性質を表現する論理。

## プログラマ向けの一言

**「このイベントはいつか必ず起きる」「デッドロックは絶対に起きない」をプログラムの仕様として形式的に書くための言語。** [[model-checking|モデル検査]]で検証する仕様はこれで書く。

## コードで理解する

```ts
// 時相論理の演算子を TS の概念で理解する

// □ (Always / Globally): 「常に P が成り立つ」
// → サーバーは常に応答する
// → invariant と同じ。ループの各ステップで成り立つ条件
function checkAlways(trace: boolean[]): boolean {
  return trace.every(p => p === true);  // 全ステップで true
}

// ◇ (Eventually): 「いつか P が成り立つ」
// → リクエストにはいつか応答が返る
// → Promise が resolve されることの保証
function checkEventually(trace: boolean[]): boolean {
  return trace.some(p => p === true);  // どこかのステップで true
}

// ○ (Next): 「次のステップで P が成り立つ」
function checkNext(trace: boolean[]): boolean {
  return trace.length > 1 && trace[1] === true;
}

// U (Until): 「Q が成り立つまで P が成り立ち続ける」
// → ロックを取得するまでスレッドは待機状態を維持する
function checkUntil(p: boolean[], q: boolean[]): boolean {
  for (let i = 0; i < p.length; i++) {
    if (q[i]) return true;   // q が成り立った → OK
    if (!p[i]) return false;  // q の前に p が崩れた → NG
  }
  return false; // q が一度も成り立たなかった
}
```

## LTL と CTL

```ts
// LTL (Linear Temporal Logic / 線形時相論理):
// 時間が一本道。「この1つの実行パス上で」性質を語る。
// □(request → ◇response)
// 「常に、リクエストが来たらいつか応答が返る」

// CTL (Computation Tree Logic):
// 時間が分岐する木。「すべての分岐で」「ある分岐で」を区別する。
// AG(request → EF response)
// A = All paths（すべての分岐で）
// E = Exists path（ある分岐で）
// G = Globally, F = Finally

// プログラマ的には:
// LTL = 1つの実行トレースについて語る
// CTL = 非決定性がある場合に「すべての可能性で」or「ある可能性で」を区別
```

## プログラマが知っている時相論理

```ts
// 実はプログラマは日常的に時相論理的な性質を扱っている:

// □ (Always) = ループ不変条件
while (queue.length > 0) {
  // ここでは常に queue.length > 0 が成り立つ
  const item = queue.shift()!;
  process(item);
}

// ◇ (Eventually) = Promise の resolve
const data = await fetch("/api"); // いつか結果が返る

// U (Until) = イベントリスナの解除待ち
element.addEventListener("click", handler);
// handler が呼ばれるまでリスナがアクティブ

// □(A → ◇B) = リトライロジック
// 「常に、失敗したらいつかリトライが成功する」
async function withRetry(fn: () => Promise<void>) {
  while (true) {
    try { await fn(); return; }
    catch { await sleep(1000); }
  }
}
```

## 実用例

```ts
// TLA+ での仕様記述（Amazon が使っている）
// 「メッセージは送信されたら、いつか配信される」
// □(sent(m) → ◇delivered(m))

// 「2つのプロセスが同時にクリティカルセクションに入らない」
// □¬(inCS(p1) ∧ inCS(p2))

// 「待っているプロセスはいつかクリティカルセクションに入れる」
// □(waiting(p) → ◇inCS(p))
```

## 関連

- [[model-checking|モデル検査]] — 時相論理で書いた仕様を検証する手法
- [[formal-methods|形式手法]] — 時相論理はその仕様記述言語
- [[intuitionistic-logic|直観主義論理]] — 別の非古典論理
