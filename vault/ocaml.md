---
title: OCaml
tags: [language, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:03+09:00
---

ML 系の実用関数型言語（1996〜, INRIA）。**強力な型推論・[[adt-gadt|代数的データ型]]・パターンマッチ・モジュールシステム**が核。関数型＋命令型＋OOP のマルチパラダイムで、ネイティブコンパイルにより高速・予測可能。

## 型システム

- **[[hindley-milner|Hindley–Milner]] ＋拡張** — GADT、多相ヴァリアント、行多相（拡張可能レコード）
- **モジュールシステム** — `functor`（モジュールを取りモジュールを返す）で大規模な抽象・パラメータ化を実現。OCaml の最大の特徴のひとつ

## バリアントとパターンマッチの最小例

型を「とりうる形の列挙」として定義し、`match` で分岐する。コンパイラが**網羅性検査**（漏れたケースを警告）する:

```ocaml
type shape =
  | Circle of float            (* 半径 *)
  | Rect   of float * float    (* 幅・高さ *)

let area s =
  match s with
  | Circle r      -> Float.pi *. r *. r
  | Rect (w, h)   -> w *. h

let () = Printf.printf "%f\n" (area (Rect (3., 4.)))  (* 12.0 *)
```

`Circle` のケースを消すと「`Rect` を扱っていない」と警告が出る。これが [[make-illegal-states-unrepresentable|不正な状態を表現不能にする]]の足場。

## module / functor の最小例

OCaml 最大の特徴。`module type`（シグネチャ）でインタフェースを定義し、**functor = モジュールを引数に取りモジュールを返す関数**でパラメータ化する。Java のジェネリクスより強力で、型と実装の両方を抽象化できる:

```ocaml
(* 比較できる要素のインタフェース *)
module type ORDERED = sig
  type t
  val compare : t -> t -> int
end

(* ORDERED を渡すと、その型用の Set 実装を返す functor *)
module MakeSet (E : ORDERED) = struct
  type elt = E.t
  type t = elt list
  let empty = []
  let add x s = if List.exists (fun y -> E.compare x y = 0) s then s else x :: s
  let mem x s = List.exists (fun y -> E.compare x y = 0) s
end

(* int 用に具体化（apply）する *)
module IntSet = MakeSet (struct type t = int let compare = compare end)

let s = IntSet.add 1 (IntSet.add 2 IntSet.empty)
let () = assert (IntSet.mem 1 s)
```

標準ライブラリの `Map.Make` / `Set.Make` がまさにこの形。1つの functor で「int 用 / string 用 / 任意の比較可能型用」の実装を**型安全に量産**できる。

## Multicore OCaml (5.0〜)

並列実行（domains）を入れると同時に、**[[algebraic-effects|代数的エフェクト]]／エフェクトハンドラを言語機能として導入**。協調的並行・独自の制御構造をライブラリで書ける。研究言語の機能を実用言語が取り込んだ象徴的な例。

## 性能と実行モデル

ネイティブコンパイラに加え、バイトコードは [[abstract-machine|ZAM]]（Zinc Abstract Machine）で実行。GC は低レイテンシ寄り。

## 用途

コンパイラ・言語処理系（Rust の初代実装、Flow、Hack、Facebook Infer）、**金融（Jane Street）**、形式手法（Coq は OCaml 実装）。[[make-illegal-states-unrepresentable|不正な状態を表現不能にする]]の標語は Jane Street（Yaron Minsky）由来。

## 押さえどころ（カード化候補）

- **バリアント＋網羅性検査** → 型を「とりうる形の列挙」で定義。`match` の漏れをコンパイラが警告し、不正状態を型で排除する足場になる
- **functor** → モジュールを引数に取りモジュールを返す関数。型と実装を同時に抽象化し、`Set.Make`/`Map.Make` のように実装を型安全に量産できる
- **`module type`（シグネチャ）** → モジュールのインタフェース。functor の引数仕様を定義し、実装を差し替え可能にする
- **代数的エフェクト（5.0〜）** → domains（並列）と同時に導入。協調的並行や独自の制御構造をライブラリで書ける（研究機能の実用化）
- **実行モデル** → ネイティブコンパイル＋低レイテンシ GC。バイトコードは [[abstract-machine|ZAM]] で実行

## 関連

- [[fsharp|F#]] — OCaml を .NET に持ち込んだ子孫
- [[hindley-milner|Hindley–Milner 型推論]] — 型推論の土台
- [[algebraic-effects|Algebraic Effects]] — 5.0 で言語機能化
- [[abstract-machine|抽象機械]] — ZAM がバイトコード実行モデル
