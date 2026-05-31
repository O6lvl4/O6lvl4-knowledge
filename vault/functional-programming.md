---
title: 関数型言語
tags: [programming-paradigm, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:32:58+09:00
---

関数を第一級の値として扱うプログラミングパラダイム。理論的基盤は [[lambda-calculus|λ計算]]。

## プログラマ向けの一言

**関数を変数に入れたり、引数に渡したり、返り値にできる言語。** JavaScript/TypeScript を書いてる時点で、あなたは既に関数型プログラミングを部分的にやっている。

## コードで理解する

```ts
// 関数が「第一級 (first-class)」= 値として扱える
const double = (x: number) => x * 2;
const apply = (f: (x: number) => number, x: number) => f(x);
apply(double, 5); // 10

// 高階関数: 関数を受け取る or 返す関数
const numbers = [1, 2, 3, 4, 5];
numbers.filter(x => x % 2 === 0);  // [2, 4]   ← filter は関数を受け取る
numbers.map(x => x * 2);           // [2, 4, 6, 8, 10]
numbers.reduce((sum, x) => sum + x, 0); // 15

// 関数の合成
const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (a: A) => f(g(a));
const increment = (x: number) => x + 1;
const doubleAndIncrement = compose(increment, double);
doubleAndIncrement(3); // 7
```

## 命令的 vs 宣言的

FP は宣言的パラダイムの一種。両者は「計算をどうモデル化するか」の根本が違う。

| | 命令的（imperative） | 宣言的・関数型（declarative / functional） |
|---|---|---|
| 計算とは | 状態を**逐次的に書き換える**手続き | 式を**値に評価する**こと |
| 中心概念 | 文（statement）・代入・ループ | 式（expression）・関数適用・再帰 |
| 状態 | 可変（mutable）。時間で変わる | 不変（immutable）。新しい値を作る |
| 制御 | `for` / `while` / `goto` | 高階関数（`map`/`fold`）・再帰・パターンマッチ |
| 思考の単位 | 「どう（how）変えるか」 | 「何（what）であるか」 |
| 副作用 | コードに散在 | 型で隔離（[[monad\|Monad]] / [[algebraic-effects\|Effect]]） |
| 理論基盤 | チューリング機械（テープ＝状態） | [[lambda-calculus\|λ計算]]（書き換え＝簡約） |

両者は計算能力としては等価（チューリング完全）。違うのは**何が一級市民か**——命令型は「文と状態」、関数型は「式と値」。

## FP の核となる5概念

| 概念 | 意味 | コードの感触 |
|---|---|---|
| 第一級関数 | 関数を値として変数・引数・返り値に使える | `const f = x => x*2` |
| 高階関数 (HOF) | 関数を受け取る／返す関数 | `map`, `filter`, `compose` |
| 関数合成 | 小さい関数を繋いで大きい関数を作る | `compose(g, f)(x) = g(f(x))` |
| 不変性 | 値を破壊的変更せず新しい値を作る | `[...arr, x]`（push しない） |
| 参照透過性 | 式をその値で置換しても意味が変わらない | `f(2)` を常に `4` に置換可 |

**参照透過性**が FP の意味論的な要。これが成り立つと、[[equational-reasoning|等式推論]]（コードを数式のように書き換えて推論）が可能になり、メモ化・[[stream-fusion|stream fusion]] のような最適化や、並列化（順序非依存）が安全に行える。副作用はこの性質を壊すので、FP では型で隔離する。

## 関数型の中心的な考え方

```ts
// 1. イミュータビリティ（変更しない）
const bad = (arr: number[]) => { arr.push(1); return arr; }; // 元の配列を壊す
const good = (arr: number[]) => [...arr, 1];                 // 新しい配列を返す

// 2. 副作用の分離
// 副作用あり: DB読み書き、console.log、ファイルI/O、乱数
// 純粋: 同じ入力に対して常に同じ出力。副作用なし。
const pure = (x: number) => x * 2;          // 何回呼んでも同じ
const impure = () => Math.random();          // 毎回違う

// 3. 宣言的（何をするか）vs 命令的（どうやるか）
// 命令的
let sum = 0;
for (let i = 0; i < numbers.length; i++) sum += numbers[i];
// 宣言的
const total = numbers.reduce((s, x) => s + x, 0);
```

## 代表的な言語

- **Haskell** — [[pure-functional-programming|純粋関数型]]の代表。副作用を[[monad|Monad]]で管理
- **OCaml / F#** — 実用的な関数型。副作用を自由に書ける
- **Erlang / Elixir** — 並行処理に強い関数型
- **Clojure** — [[lisp|LISP]]系の現代的な関数型
- **Scala** — JVM 上の関数型 + オブジェクト指向ハイブリッド
- **Rust** — 関数型の影響が強い（イミュータブルデフォルト、パターンマッチ、Result型）

## 押さえどころ（カード化候補）

- **FP とは** → 関数を第一級の値として扱い、計算を「式を値に評価すること」としてモデル化するパラダイム。宣言的（what）。基盤は [[lambda-calculus|λ計算]]。
- **命令的 vs 宣言的** → 命令型は「文・状態の逐次書き換え（how）」、関数型は「式・値の評価（what）」。能力は等価、一級市民が違う。
- **核5概念** → 第一級関数 / 高階関数 / 関数合成 / 不変性 / 参照透過性。
- **参照透過性が要** → 式を値で置換しても意味不変。これが [[equational-reasoning|等式推論]]・最適化・並列化を安全にする。副作用はこれを壊すので型で隔離。
- **副作用の扱い** → 純粋関数型は副作用を [[monad|Monad]] や [[algebraic-effects|Algebraic Effects]] で型に持ち上げて制御する。

## 関連

- [[lambda-calculus|λ計算]] — FP の理論的基盤。「アロー関数だけ」でチューリング完全
- [[pure-functional-programming|純粋関数型言語]] — 副作用を型で制御する関数型の純粋版。Haskell が代表
- [[monad|Monad]] — 副作用・文脈を型に載せて純粋に合成する仕組み（出力側の効果）
- [[algebraic-effects|Algebraic Effects]] — Monad の代替となる効果ハンドリング。継続で効果を解釈する
- [[continuation|継続]] — 「残りの計算」を値として扱う。HOF・制御フローの抽象化の極北
- [[coeffect|Coeffect]] — effect の双対。計算が文脈・資源に**要求するもの**を型で追う
- [[adt-gadt|ADT / GADT]] — 関数型言語の型定義の中心。パターンマッチと表裏一体
- [[recursion-schemes|再帰スキーム]] — 再帰の型付き定型化（fold/unfold）。ループの宣言的置き換え
- [[stream-fusion|Stream Fusion]] — 参照透過性に支えられた関数型パイプラインの核心的最適化
- [[equational-reasoning|等式推論]] — 参照透過なコードを数式のように書き換えて正しさを示す
