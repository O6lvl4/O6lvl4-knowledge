---
title: Algebraic Effects
tags: [programming-paradigm, computer-science, type-theory]
created_at: 2026-05-18
updated_at: 2026-05-31T21:33:23+09:00
---

副作用を「宣言」と「処理」に分離する仕組み。

## プログラマ向けの一言

**`throw` と `try/catch` の一般化。** 例外を投げるのと同じように任意の副作用を「投げ」て、ハンドラで「受けて」処理する。ただし例外と違って処理後に元の場所に戻れる。

## コードで理解する

```ts
// 例外: 投げたら戻れない
function example() {
  const x = 1;
  throw new Error("boom"); // ← ここで脱出。二度と戻れない
  return x + 1;            // ← 到達しない
}

// Algebraic Effects: 投げた後に「戻れる」
// （TypeScript には存在しないが、概念を疑似コードで）
//
// function example() {
//   const x = 1;
//   const name = perform AskName();  // ← 副作用を「投げる」
//   return `${name}: ${x + 1}`;     // ← ハンドラが値を返すと、ここから再開
// }
//
// handle example() {
//   AskName() => resume("Alice")     // "Alice" を返して、perform の位置に戻る
// }
// → "Alice: 2"
```

## Generator で模倣する

```ts
// JS の Generator は Algebraic Effects に最も近い既存の機能

function* program(): Generator<{ type: string; payload?: any }, string, any> {
  const name: string = yield { type: "ask", payload: "名前は？" };
  const age: number = yield { type: "ask", payload: "年齢は？" };
  return `${name} (${age})`;
}

// ハンドラ: 副作用をどう処理するか決める
function handleWithDefaults(gen: Generator) {
  let result = gen.next();
  while (!result.done) {
    if (result.value.type === "ask") {
      // 副作用を処理して、結果を gen に「戻す」
      result = gen.next("default");
    }
  }
  return result.value;
}

function handleInteractive(gen: Generator) {
  let result = gen.next();
  while (!result.done) {
    if (result.value.type === "ask") {
      const answer = prompt(result.value.payload); // 本当にユーザーに聞く
      result = gen.next(answer);
    }
  }
  return result.value;
}

// 同じ program に対してハンドラを差し替えられる
// → テスト時はモック、本番はリアルI/O
// → 副作用の「宣言」と「実装」が分離される
```

## Monad との違い

```ts
// Monad: 副作用を「型の中に閉じ込める」
//   → Promise<T>, Option<T>, Result<T, E>
//   → 合成するには flatMap/chain が必要。ネストが深くなりがち

// Algebraic Effects: 副作用を「投げて」ハンドラに処理させる
//   → 直接的なコードが書ける（CPS 変換を言語がやる）
//   → 複数の副作用を自由に組み合わせられる

// Monad は「色付き関数」問題を起こす（async 関数は async からしか呼べない等）
// Algebraic Effects はこの問題を起こさない
```

## 実装がある言語

- **OCaml 5** — 2022年にネイティブサポート追加
- **Eff** — Algebraic Effects の研究言語
- **Koka** — Microsoft Research の言語。Effects を前面に押し出した設計
- **Unison** — Abilities として実装

## 押さえどころ（カード化候補）

- **Algebraic Effects とは** → 副作用を「宣言（perform）」と「処理（handler）」に分離する仕組み。`throw`/`try-catch` の一般化
- **例外との違い** → 例外は投げたら戻れないが、エフェクトはハンドラが `resume(値)` を呼ぶと perform の位置に戻って計算を続けられる
- **宣言と実装の分離** → 同じプログラムに対しハンドラを差し替え可能（テストはモック、本番はリアル I/O）。Generator の `yield`/`gen.next(値)` で模倣できる
- **Monad との違い** → Monad は副作用を型に閉じ込め flatMap でネストし「色付き関数」問題を起こす。Effects は直接的に書け複数副作用を自由に組み合わせられる
- **実装言語** → OCaml 5（2022 ネイティブ）、Eff（研究言語）、Koka、Unison（Abilities）

## 関連

- [[effect-handlers|効果ハンドラ]] — 「throw/try-catch の一般化」の中身。例外・状態・generator・async・非決定性を1機構の特殊例にまとめる
- [[algebraic-operations|代数的演算]] — 「代数的」効果の理論的根拠。演算 signature + 等式で副作用を定義
- [[continuation|継続 / 限定継続]] — Algebraic Effects は限定継続で実装される
- [[monad|Monad]] — 副作用を扱う別のアプローチ
- [[pure-functional-programming|純粋関数型言語]] — 副作用管理の文脈で比較される
- [[coeffect|Coeffect]] — effect（出力側）の双対＝文脈・資源の要求（入力側）
- [[ocaml|OCaml]] — 5.0 でエフェクトハンドラを言語機能として導入
