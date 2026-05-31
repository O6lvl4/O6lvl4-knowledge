---
title: 多段階計算
tags: [programming-paradigm, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-31T09:46:52+09:00
---

プログラムの実行を複数の**ステージ**に分け、あるステージで次ステージの**コードを生成・合成・実行**する技法（multi-stage programming, MSP）。「コード値」を第一級に扱い、quasiquote で囲んで生成・`run` で実行する。MetaOCaml が代表。

## 3つの基本演算子（MetaOCaml）

| 演算子 | 名前 | 意味 | 型 |
|---|---|---|---|
| `.< e >.` | bracket / quote | `e` を**今は評価せず**コード値にする | `e : t` なら `.<e>. : t code` |
| `.~e` | escape / splice | bracket の**中で**、別のコード値を埋め込む | `e : t code` を bracket 内に挿入 |
| `Runcode.run e` | run | コード値を**コンパイル＋実行**して値にする | `t code -> t` |

`.<>.` がコードを1段上に持ち上げ、`.~` がその中に開けた穴へ既存コードを縫い込み、`run` が降ろして走らせる。`.~` は必ず `.<>.` の内側にしか書けない（level の整合）。

## 実コード: べき乗の段階的特化

指数 `n` を**生成時**に固定し、`x` のかけ算だけが残る特化コードを作る古典例（MetaOCaml）：

```ocaml
(* power : int -> int code -> int code
   n は今のステージで既知、x は次ステージの値（コード値）*)
let rec power n x =
  if n = 0 then .< 1 >.
  else .< .~x * .~(power (n - 1) x) >.

(* 指数 5 で特化したコードを生成する *)
let power5_code : (int -> int) code =
  .< fun x -> .~(power 5 .< x >.) >.
(* 生成されるコード: .< fun x -> x * (x * (x * (x * (x * 1)))) >. *)

(* run で実機関数にコンパイル → ループも再帰も消えた直線コード *)
let power5 : int -> int = Runcode.run power5_code
let _ = power5 2   (* = 32 *)
```

`power` 自体の再帰（`n` に対する）は**生成時**に完全に展開され尽くし、残るコードには `n` も再帰も `if` も現れない。これが「汎用の `power` を指数で特化して高速化する」MSP の核心。重要なのは生成コードが**型付き**（`int code`）であること — 不正なコードは生成段階で型エラーになる（cf. Template Haskell の `Q Exp` は型が弱い）。

## [[partial-evaluation|部分評価]]との違い

| | 部分評価（自動） | 多段階計算（手動） |
|---|---|---|
| 制御 | 処理系が static/dynamic を判定 | プログラマが bracket/escape/run で**明示** |
| 生成コードの型安全 | 保証は実装依存 | **型安全なコード生成**（生成物も型付け） |
| 狙い | 既知入力での特化 | 段階的な特化・コード生成全般 |

両者は「汎用に書いて使用時に特化する」動機を共有する。

## 用途

- **特化による高速化** — 汎用カーネルを次元・形状で特化（コンパイル時テンソル形状検査）
- **DSL のコンパイル** — 高レベル記述から効率コードを生成
- 音楽 DSL（mimium の多段階計算）など、ドメイン特化言語の実行効率化

近縁: Template Haskell、Scala LMS、Terra、staging 全般。

## 押さえどころ（カード化候補）

- **多段階計算とは** → 実行を複数ステージに分け、あるステージで次ステージのコードを生成・合成・実行する技法 (MSP)。コード値を第一級に扱う。MetaOCaml が代表。
- **3演算子** → `.<e>.` (bracket: 評価せずコード値化)、`.~e` (escape: bracket 内へコード値を埋め込む)、`Runcode.run` (コード値をコンパイル＋実行)。`.~` は必ず `.<>.` の内側。
- **べき乗特化** → `power n x` の `n` 上の再帰は生成時に展開され尽くし、残るコードに `n`・再帰・`if` は現れず `x` のかけ算だけが直線化される。
- **部分評価との違い** → 部分評価は処理系が static/dynamic を自動判定。MSP はプログラマが bracket/escape/run で**明示制御**し、生成コードも**型付き**で安全。
- **型安全がポイント** → 生成物が `t code` として型付くため不正コードは生成段階で弾かれる。Template Haskell の `Q Exp` より型保証が強い。

## 関連

- [[partial-evaluation|部分評価]] — その自動版。MSP は明示制御版
- [[tagless-final|Tagless Final]] — 解釈を特化して高速化する設計と動機が重なる
- [[abstract-machine|抽象機械]] — インタプリタ／コンパイラの境界を扱う点で隣接
