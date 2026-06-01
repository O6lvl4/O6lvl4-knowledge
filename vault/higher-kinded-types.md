---
title: 高階型 (HKT)
tags: [type-theory, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:50:00+09:00
---

型コンストラクタ（`* -> *` のような**種**(kind)を持つもの）を**型パラメータに取れる**多相。`F[_]` 自体を抽象でき、Functor / Monad / Traversable のような「コンテナによらない抽象」を書ける。

## 種（kind）— 「型の型」

| 例 | kind |
|---|---|
| `Int`, `Bool` | `*` |
| `List`, `Maybe` | `* -> *` |
| `Either`, `Map` | `* -> * -> *` |

HKT は「kind が `* -> *` の引数」を許す多相。普通のジェネリクスは `*`（具体型）しか抽象できない。

```haskell
class Functor (f :: * -> *) where
  fmap :: (a -> b) -> f a -> f b   -- f は List でも Maybe でも IO でもよい
```

## 型コンストラクタの部分適用

HKT があると型コンストラクタを**部分適用**できる。`Either e` は `Either :: * -> * -> *` を1つ適用した `* -> *` で、`Functor (Either e)` のインスタンスにできる。Scala 3 は **type lambda** `[X] =>> Either[E, X]` で無名の部分適用を書く。この型レベルの部分適用が無いと、2引数以上のコンストラクタを Functor 等に載せられない。

## なぜ多くの言語が非対応か

kind 体系が要り、型推論・実装（辞書渡し/単相化）が複雑化する。とくに「型コンストラクタを推論する」高階単一化は一般に決定不能で、注釈・制約が増える。

- **一級で持つ**: Haskell、Scala、PureScript、Idris、Lean
- **部分的**: Rust（GAT＝Generic Associated Types。`type Item<'a>`）、Kotlin（限定的）
- **持たない**: Java、Go、TypeScript、C#

## HKT が無い言語でのエミュレーション

| 手法 | 言語/例 | 仕組み |
|---|---|---|
| defunctionalization | OCaml "Lightweight HKP"（Yallop & White） | コンストラクタを型タグ `('a, 'f) app` に符号化し適用を関数化 |
| URI/ブランド + レジストリ | TypeScript の fp-ts | 文字列リテラル型でコンストラクタを索引し `Kind<URI, A>` を引く |
| マクロ/コード生成 | 各種 | インスタンスを機械生成して冗長さを隠す |

いずれも「型コンストラクタを第一級にできない」言語で間接層を噛ませて Functor/Monad 抽象を近似する。冗長さ・エラーの読みにくさが代償。

## 高ランク多相（rank-N）との違い

混同しやすいが別物。**HKT** は「型コンストラクタ（`* -> *`）を型引数に取る」＝**種の高階性**。**高ランク多相**は「`forall` を引数の内側に置く」＝ `(forall a. a -> a) -> ...` のような**量化子の位置**の話。直交する2つの型システム拡張。

## なぜ重要か

`F[_]` を抽象できて初めて [[monad|Monad]] / [[comonad|Comonad]] / [[tagless-final|tagless-final]] の `F[_]: Monad` のような「作用や文脈の型を差し替え可能にする」設計が書ける。HKT が無い言語では、これらの抽象が言語イディオムでしか近似できない。

## 関連

- [[polymorphism|ポリモーフィズム]] — HKT は多相の対象を型構築子まで広げたもの
- [[monad|Monad]] / [[comonad|Comonad]] — HKT が無いと一般的に書けない抽象
- [[tagless-final|Tagless Final]] — `F[_]` 抽象の土台
- [[polymorphism|ポリモーフィズム]] の「高階多相」節を独立・深掘りしたノート
