---
title: HOF インライン融合とクロージャ変換
tags: [almide, compiler, optimization]
created_at: 2026-05-29
updated_at: 2026-05-29T23:20:06+09:00
---

[[almide|Almide]] の ClosureConversion パスが、**capture を持たないラムダを `ClosureCreate` に変換せず生の `Lambda` ノードのまま残す**最適化。後段の WASM エンジンが [[stream-fusion|HOF をインライン融合]]できるようにするためで、その代償が「生 Lambda を値として使うと詰む」制約になっている。

## HOF と2つのコードジェネ戦略

HOF = Higher-Order Function(高階関数)。`list.map` / `list.filter` / `list.fold` など**関数を引数に取る** stdlib 関数。`list.map(xs, (x) => x * 2)` を WASM に落とすとき2通りある:

| 戦略 | やること | オーバーヘッド |
|---|---|---|
| **call_indirect 経由** | ラムダをトップレベル関数に lift → 関数テーブル登録。各要素ごとに間接呼び出し | 環境ポインタ受け渡し + 間接ジャンプ |
| **インライン融合** | ラムダ本体(`x * 2`)を map のループ本体に直接展開。呼び出しそのものが消える | **ゼロ** |

融合は、エンジンの `inline_lambda` がラムダの params と body を取り出してループに埋め込む。

## なぜ生 Lambda を残すのか

インライン融合には、エンジンが**ラムダ本体(IR)に直接アクセスできる**必要がある。`ClosureCreate` に変換すると本体はトップレベル関数に lift され、呼び出し側からは `func_name` しか見えず、本体を取り出してループ展開できない。

だから ClosureConversion は **capture が無いラムダ = 環境不要でインライン展開できるラムダ**を、あえて `ClosureCreate` に変換せず生の `Lambda` のまま残す。後段が HOF 引数として見たとき「これは生 Lambda だからループに融合できる」と判断し、オーバーヘッドゼロのコードを出せる。

```
list.map(xs, (x) => x * 2)
  非capturing ラムダ → 生 Lambda のまま温存 → ループ本体に x*2 を展開
                                              (call_indirect も関数テーブルも不要)
```

## capturing は call_indirect 一択

逆に**外側の変数を capture するラムダ**は環境が要るので、生 Lambda のまま展開できない。`ClosureCreate` に変換 → トップレベル関数へ lift + 関数テーブル登録 → HOF からは `call_indirect` で呼ぶ。これが「closures-as-values」で実装される2経路:

| ラムダ | 表現 | HOF での呼び出し |
|---|---|---|
| 非capturing | 生 Lambda 温存 | ループ本体に**インライン融合**(オーバーヘッド0) |
| capturing | `ClosureCreate`(lift + テーブル) | **call_indirect**(環境ポインタ付き) |

## 代償(設計の裏返し)

生 Lambda は lift されない = **関数テーブルにエントリが無い**。そのため、その非capturing ラムダが **HOF 以外の場所で値として使われる**と詰む:

```
let double = (x) => x * 2
apply(double, 5)   // ラムダを値として渡す/返す → テーブルエントリが無く call_indirect できない
```

融合のための「lift しない」判断が、値としての一般的な取り回しを壊す。**最適化と一様な値表現のトレードオフ**であり、[[anf-closure-lifting-bug|クロージャまわりの別のバグ]]と同じく、クロージャ表現の場合分けが生む制約の一例。

## 関連

- [[stream-fusion]] — HOF チェーンの中間データを消す融合最適化。インライン融合はその下地
- [[anf-closure-lifting-bug]] — 同じくクロージャ表現の場合分けに起因する制約/バグ
- [[almide]] — ClosureConversion はコンパイラパイプラインの一段
- [[functional-programming]] — map/filter/fold という HOF の出自
- [[almide-list-mutation]] — 同じ WASM バックエンドの、closures の次に来る mutation 側の設計
- [[almide-differential-gate]] — closures 各 step の正しさを保証したレガシー照合の仕組み
