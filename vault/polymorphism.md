---
title: ポリモーフィズム
tags: [type-theory, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-30T20:10:00+09:00
---

一つのコード/インターフェースが複数の型に対して動作する性質（「多くの形」）。OOP では普通**部分型多相（動的ディスパッチ）**を指すが、プログラミング言語論ではより広い分類がある。Cardelli & Wegner (1985) の整理が定番。

## 分類

```
ポリモーフィズム
├─ universal（無限個の型に一様に効く）
│   ├─ parametric  … パラメトリック多相 / ジェネリクス
│   └─ subtype     … 部分型多相 / 包含多相
└─ ad-hoc（有限個の型ごとに別実装）
    ├─ overloading … オーバーロード（型クラス/trait で規律化）
    └─ coercion    … 型強制（暗黙変換）
```

| 種類 | 別名 | 例 | 解決時点 |
|---|---|---|---|
| parametric | ジェネリクス・総称型 | `List<T>`, `id : a -> a` | 型に依らず単一コード |
| subtype | 部分型・包含 | OOP の継承・interface（[[adt-gadt\|GADT]]とは別軸） | 主に実行時（動的ディスパッチ） |
| overloading | アドホック・型クラス | `+` の多重定義, Haskell type class, Rust trait | コンパイル時 |
| coercion | 型強制 | `int → double` 暗黙変換 | コンパイル時 |

## parametric — 「型に何もできない」がゆえに安全

型をパラメータ化し、**中身の型に依存しない同一コード**を書く。

```haskell
id   :: a -> a          -- a に対して何もできない＝ id を返すしかない
fst  :: (a, b) -> a
length :: [a] -> Int    -- 要素の型を見られないので、数えることしかできない
```

型変数に対して操作できないため、**取りうる実装が型シグネチャで強く縛られる**（parametricity、"theorems for free"）。これが parametric の安全性の源。

## ad-hoc — 型ごとに分岐、型クラスで規律化

オーバーロードは「同名・型ごとに別実装」。素朴には無秩序だが、**型クラス（Haskell）/ trait（Rust）** が型システム上で整理した形。

```haskell
class Show a where show :: a -> String   -- 型ごとに show の実装を与える
instance Show Int  where show = ...
instance Show Bool where show = ...
```

これは [[tagless-final|Tagless Final]] の土台でもある（操作を型クラスで宣言し、解釈をインスタンスで与える）。

## 実装メカニズム（同じ多相でもコストが違う）

| 方式 | 中身 | コスト | 代表 |
|---|---|---|---|
| 動的ディスパッチ | vtable / 仮想メソッドで実行時に解決 | 間接呼び出し・インライン化困難 | OOP の継承, Rust `dyn Trait` |
| 単相化（monomorphization） | 型ごとに特化コードを生成 | ゼロコスト、ただしコード膨張・コンパイル増 | C++ template, Rust ジェネリクス |
| 辞書渡し（dictionary passing） | 型クラスのメソッド表を暗黙引数で渡す | 間接化あり | Haskell type class |
| 型消去（type erasure） | 実行時に型情報を捨て一様表現 | 実行時に型が見えない | Java generics |

Rust の trait は **単相化（速い）と `dyn`（動的）を選べる**点で、ad-hoc と境界付き parametric を融合している。

## なぜ重要か

コード再利用と抽象化の中核。同じロジックを型をまたいで一度だけ書く。**parametric は「振る舞いが型で決まらない」ことで安全**、**ad-hoc は「型ごとに振る舞いを変える」柔軟さ**を与える — 目的が逆で、両方要る。

## その他の多相

- **行多相（row polymorphism）** — 「少なくともこのフィールドを持つレコード」に多相
- **高階多相（higher-kinded）** — `F[_]` のような型コンストラクタに対する多相（Functor/Monad）
- **境界付き/F-bounded** — 型パラメータに制約（`T: Ord`）を課す

## 関連

- [[tagless-final|Tagless Final]] — ad-hoc 多相（型クラス）を DSL 解釈に使う技法
- [[adt-gadt|ADT / GADT]] — 直和型は subtype 多相と並ぶ「場合分け」の別手段
- [[rust|Rust]] — trait による単相化/動的の選択、境界付き多相
- [[tapl|TAPL]] — System F（parametric 多相の理論）を扱う型理論の教科書
- [[dependent-type|依存型]] — 型が値に依存する、多相のさらに先
- [[hindley-milner|Hindley–Milner 型推論]] — parametric＋let 多相の型推論
- [[parametricity|パラメトリシティ]] — parametric 多相が持つ一様性の性質
- [[higher-kinded-types|高階型 (HKT)]] — 型構築子 `F[_]` まで広げた多相

## Links

- Cardelli & Wegner, "On Understanding Types, Data Abstraction, and Polymorphism" (1985)
