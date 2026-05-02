---
title: 継続（Continuation）
tags: [concept, fp, control-flow]
---

「この計算が終わったあと、何が続くか」を値として取り出せるしくみ。関数型プログラミングで例外・非同期・コルーチン・バックトラックなどを統一的に表現する基盤。

## 何ができる？／なぜ重要？

本を読むときに「いまから先の話の続き」を栞として友人に渡せたとしたら、友人はその栞からあなたの代わりに続きを読み始めることができます。継続はまさにそれの計算版で、「いまの計算の続き」を値として保管・複製・差し替えできる仕組みです。

これがあると、例外（途中で投げ捨てて別の場所から再開）、非同期（待ち時間中に栞を保留して、結果が来たら再開）、ジェネレータ（`yield` で栞を渡して、後で続きから走らせる）、バックトラック（栞を複数取って枝分かれを試す）が、すべて **同じ仕組み一つ** で書けます。「制御の流れ自体をデータとして扱える」のが嬉しさの本質です。

## 仕組み

```mermaid
flowchart LR
    A[計算開始] --> B["途中で<br/>continuation を取得"]
    B --> K1["k = 「ここから先の続き」<br/>(栞)"]
    B --> C[現在の計算を続行]
    C --> D[結果]

    K1 -.->|後で k(値) を呼ぶと| E[別経路で続きを再開]
    K1 -.->|k を 2回呼ぶと| F[同じ続きが2度走る]
```

continuation `k` は「ここから先の処理を表した関数」。`k(value)` を呼ぶと、`value` をその地点に注入して続きが走り出す。`k` を保管すれば後から再開でき、複数回呼べば同じ「続き」を何度でも実行できる。

## 主要な形態

### CPS (Continuation-Passing Style)

普通の関数は `(x) => 値を返す` だが、CPS では `(x, k) => k(値)` のように「結果を直接返す代わりに、続き `k` に渡す」。コンパイラが内部表現で使うことが多い。

```js
// 通常スタイル
function add(a, b) { return a + b }

// CPS
function addCPS(a, b, k) { k(a + b) }
addCPS(1, 2, (sum) => console.log(sum))  // 3
```

### call/cc（call-with-current-continuation）

「いま実行中の地点の continuation」を関数として取り出す。Scheme/Standard ML 等が直接サポート。

```scheme
(+ 1 (call/cc (lambda (k) (+ 2 3))))
; → 6 （k は使われない）
(+ 1 (call/cc (lambda (k) (k 10))))
; → 11 （k で「+ 1 の続き」に 10 を注入）
```

### Delimited continuation（区切られた継続）

`reset` で範囲を区切り、`shift` でその範囲内の continuation を取り出す。プログラム全体ではなく **一部分だけ** を継続として扱える。Racket、OCaml の effect handlers、Haskell の `Cont` モナド等。

### Continuation Monad

純粋関数型言語で副作用なしに継続を表現する方法。`Cont r a = (a -> r) -> r` という型。Haskell の `Control.Monad.Cont`。

## 何が表現できるか

| 言語機能 | 継続での表現 |
|---|---|
| 例外（throw / catch） | continuation を保管 → エラー時に保管した方を呼ぶ |
| async / await | await 地点で continuation を保留 → Promise resolve 時に呼び戻す |
| ジェネレータ / yield | yield で continuation を呼び出し元に返す |
| コルーチン | 双方の continuation を交互に呼び合う |
| バックトラック / non-determinism | continuation を複数回呼んで分岐を試行 |
| 早期 return | 関数の出口に対する continuation を即座に呼ぶ |

「制御構文の親玉」とも呼ばれ、これ一つあれば上記すべて実装できる。

## 用語

- **コントロールフロー**: プログラムの実行順序。普通は逐次・分岐・ループだけ。
- **CPS (Continuation-Passing Style)**: 関数が結果を返さず、結果を「続きの関数」に渡すスタイル。
- **call/cc**: 現在の継続を関数として取り出す演算子（Scheme 由来）。
- **delimited continuation**: プログラム全体ではなく、`reset` で囲まれた範囲だけを継続として扱える形態。
- **shift / reset**: delimited continuation の取得（shift）と区切り（reset）の演算子ペア。
- **継続モナド (Cont monad)**: `(a -> r) -> r` 型のラッパで継続を扱う、純粋関数型での実装手段。
- **first-class continuation**: 継続を値として保管・受け渡し・複数回呼び出しできる扱いのこと。
- **escape continuation**: 1 回しか呼べない簡易版の継続。早期 return 等に使う。
- **stack-frame**: 関数呼び出し時に積まれる呼び出し情報。継続は概念的にはスタックの「上に積まれている続き」全体。
- **trampoline**: 末尾呼び出し最適化のないランタイムで深い再帰を CPS にしてヒープに逃がす技法。

## なぜ難しいか

継続は「文の意味」ではなく「計算が今どこにいて、これからどう動くか」を扱うため、初学者にとってはステップ実行のメンタルモデルを根本から塗り替える必要がある。普通のプログラミングでは見えない「実行コンテキストそのもの」が値になる。慣れると逆に、async/await や例外処理が **継続のシンタックスシュガー** であることが見えるようになる。

## 関連概念

- [[async-await]] — async/await は継続の限定形（1 回だけ呼べる delimited continuation の糖衣）
- [[effect-system]] — Effect handler はしばしば delimited continuation で実装される
- [[compiler]] — CPS 変換はコンパイラ中間表現でよく使われる

## Links

- [Wikipedia: Continuation](https://en.wikipedia.org/wiki/Continuation)
- [Wikipedia: Continuation-passing style](https://en.wikipedia.org/wiki/Continuation-passing_style)
- [Wikipedia: Call-with-current-continuation](https://en.wikipedia.org/wiki/Call-with-current-continuation)
- [Composable continuations tutorial (Racket Documentation)](https://docs.racket-lang.org/reference/cont.html)
- [Haskell Wiki: Continuation](https://wiki.haskell.org/Continuation)
