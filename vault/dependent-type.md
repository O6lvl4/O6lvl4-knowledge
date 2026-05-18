---
title: 依存型
tags: [type-theory, computer-science]
---

型が値に依存できる型システム。

## プログラマ向けの一言

**「長さ3の配列」「正の整数」「ソート済みリスト」を型として表現できる。** 普通の型システムでは「number の配列」までしか言えないが、依存型では「長さが n の number の配列」と言える。

## コードで理解する

```ts
// --- 普通の TypeScript ---
function head(arr: number[]): number {
  return arr[0]; // arr が空だったら？ → undefined が返る → バグ
}

// --- 依存型があれば ---
// 「長さが1以上の配列」を型で表現
// function head(arr: Vec<number, n>): n > 0 ? number : never
// → 空配列を渡すとコンパイルエラー

// TypeScript のタプルで疑似的に:
function safeHead(arr: [number, ...number[]]): number {
  return arr[0]; // 必ず1つ以上ある → 安全
}
safeHead([1, 2, 3]); // OK
// safeHead([]);       // コンパイルエラー
```

## 依存型の核心: 型の中に値が入る

```ts
// 普通の型: 型と値は別の世界
type NumberArray = number[];  // 「number の配列」としか言えない

// 依存型: 型が値をパラメータに取れる
// Vec<number, 3>   ← 型の中に「3」という値が入っている
// Vec<number, n>   ← 型の中に変数 n が入っている

// Idris（依存型言語）での例:
// append : Vec n a -> Vec m a -> Vec (n + m) a
// ↑ 長さ n のベクタと長さ m のベクタを結合すると長さ n+m のベクタ
// → 型レベルで長さの計算をしている

// TypeScript で無理やり近いことをすると:
type Vec<T, N extends number> = N extends 0 ? [] : [T, ...Vec<T, Subtract<N, 1>>];
// ↑ 実際にはこの Subtract は標準で使えないので限界がある
```

## 何が嬉しいか

```ts
// 1. 行列の掛け算で次元ミスをコンパイル時に防ぐ
// multiply : Matrix<m, n> -> Matrix<n, p> -> Matrix<m, p>
// → n が一致しないとコンパイルエラー

// 2. printf の書式文字列と引数の一致をチェック
// printf "%d is %s" : Int -> String -> IO ()
// → 引数の型と個数を書式文字列から導出

// 3. ソート済みリストを型で表現
// insert : (x : Int) -> SortedList -> SortedList
// → 結果が本当にソート済みであることを型が保証
```

## 代表的な言語

- **Idris** — 汎用の依存型プログラミング言語
- **Agda** — 依存型 + [[theorem-proving|定理証明]]
- **Coq** — 定理証明が主目的だが、プログラム抽出もできる
- **Lean** — 数学の形式化 + プログラミング

## 関連

- [[refinement-type|篩型]] — 依存型の軽量版。既存の型に条件を付加
- [[phantom-type|幽霊型]] — 依存型なしで型レベルの状態管理を実現するテクニック
- [[theorem-proving|定理証明]] — 依存型は定理証明の基盤
- [[curry-howard|カリー=ハワード同型対応]] — 依存型 = 述語論理の命題
