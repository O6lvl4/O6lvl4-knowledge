---
title: Stream Fusion
tags: [computer-science, compiler, optimization, functional-programming]
created_at: 2026-05-27
updated_at: 2026-05-27
---

リスト操作のパイプライン (`map → filter → fold` 等) から中間データ構造を除去し、単一ループに融合するコンパイラ最適化。Deforestation (森林伐採) の一形態。

## 問題: 中間リストの爆発

```ts
// 素朴なパイプライン: 中間リストが2本生成される
const result = [1,2,3,4,5]
  .map(x => x * 2)       // 中間リスト [2,4,6,8,10] を alloc
  .filter(x => x > 4)    // 中間リスト [6,8,10] を alloc
  .reduce((a,b) => a+b)  // 最終値 24

// 融合後: 中間リストゼロ、単一ループ
let acc = 0
for (const x of [1,2,3,4,5]) {
  const y = x * 2
  if (y > 4) acc += y
}
// acc = 24
```

要素数 N に対して中間リストが O(N) のメモリを消費する。パイプラインが長いほど深刻になる。

## 融合の基本アイデア

リストを「生産者 (producer)」と「消費者 (consumer)」の対として表現し、中間リストを経由せず直接接続する。

### Pull ベース (Iterator / Unfold)

消費者が生産者から要素を1つずつ引き出す。Rust の Iterator、Haskell の Stream Fusion (Coutts et al. 2007) がこの方式。

```rust
// Rust の Iterator は pull ベースの stream fusion
let result = vec![1,2,3,4,5].iter()
    .map(|x| x * 2)
    .filter(|x| *x > 4)
    .fold(0, |a, b| a + b);
// コンパイラが単一ループに最適化可能
```

### Push ベース (Fold / Church encoding)

生産者が消費者に要素を1つずつ押し込む。GHC の `build`/`foldr` fusion、Almide の WASM stream fusion がこの方式。

```
// 概念: fold ベースの表現
list.fold(list.filter(list.map(xs, f), p), init, g)
// → 単一ループ: for x in xs { let y = f(x); if p(y) { acc = g(acc, y) } }
```

## 融合の代数的規則

```
// Functor law (map の融合)
map(map(xs, f), g)  →  map(xs, compose(g, f))

// Filter の融合
filter(filter(xs, p), q)  →  filter(xs, and_pred(p, q))

// Map-Fold 融合
fold(map(xs, f), init, g)  →  fold(xs, init, λ(acc, x). g(acc, f(x)))

// Filter-Fold 融合
fold(filter(xs, p), init, g)  →  fold(xs, init, λ(acc, x). if p(x) then g(acc, x) else acc)

// Map-Filter-Fold 融合 (上記の合成)
fold(filter(map(xs, f), p), init, g)
  →  fold(xs, init, λ(acc, x). let y = f(x) in if p(y) then g(acc, y) else acc)
```

## Haskell の GHC における実装

GHC は `build`/`foldr` 方式 (Gill, Launchbury, Peyton Jones, 1993) と Stream Fusion (Coutts, Lippmeier, Stewart, 2007) の2つを使用。

### build/foldr fusion (shortcut deforestation)

```haskell
-- build はリストの Church encoding
build :: (forall b. (a -> b -> b) -> b -> b) -> [a]
build g = g (:) []

-- GHC のリライトルール
{-# RULES "fold/build" forall f z g. foldr f z (build g) = g f z #-}
```

`build` でリストを「cons と nil を受け取る関数」として表現し、`foldr` と直接結合して中間リストを消去する。GHC の base ライブラリの `map`, `filter`, `++` 等はすべてこの形式で定義されている。

### Stream Fusion

```haskell
data Step s a = Done | Skip s | Yield a s
data Stream a = forall s. Stream (s -> Step s a) s

-- Stream のステップ関数同士を合成
-- GHC のインライン展開 + ケース分析で単一ループに
```

`build`/`foldr` では融合できないケース (zip, concatMap 等) に対応。ステップ関数の合成がインライン展開で消滅することに依存する。

## Almide での実装

### WASM コードゲン直接融合

`list.fold(list.map(xs, f), p)` や `list.fold(list.filter(list.map(xs, f), p), init, g)` のパイプラインパターンを検出し、中間リストなしの単一ループ WASM コードを直接 emit する。

```
// パイプラインステージの検出
PipelineStage::Map    → インラインラムダの body を展開
PipelineStage::Filter → 条件分岐として挿入
// ポインタベースイテレーション (ptr += elem_size)、乗算排除
```

効果: `map → filter → fold 1M 要素` で 7.1ms → 1.2ms (Rust 1.3ms と同等)。

### Equality Saturation による代数的融合 (実験)

`almide-egg-lab` で [[equality-saturation|Equality Saturation]] (egg クレート) を使い、上記の代数的規則を自動適用する PoC。命令型のパターンマッチよりも網羅性が高く、`flat_map`/`filter_map` 融合や matrix 融合にも拡張可能。

## 融合が効かないケース

| ケース | 理由 |
|---|---|
| リストを複数回消費 | 一方の消費者が先に進むと他方が要素を取得できない |
| zip (複数入力) | Pull ベースでは交互に要素を引く必要があり融合困難 |
| 副作用のある操作 | 実行順序が変わると意味が変わる |
| 非インラインクロージャ | インライン展開できないと fusion が破壊される |

## 関連する最適化手法

| 手法 | 概要 |
|---|---|
| Deforestation (Wadler, 1988) | 中間データ構造除去の一般理論。stream fusion はその具体的実装 |
| Shortcut deforestation | GHC の build/foldr 方式。代数的規則で中間リストを消去 |
| Loop fusion | 命令型の文脈での同等最適化。LLVM の loop fusion pass |
| Polyhedral optimization | 多重ループの依存解析と変換。数値計算向け |

## 押さえどころ（カード化候補）

- Stream Fusion とは → リスト操作パイプライン (map→filter→fold) から中間データ構造を除去し単一ループに融合する最適化。Deforestation の一形態
- Pull vs Push → Pull: 消費者が生産者から要素を引く (Rust Iterator, Haskell Stream)。Push: 生産者が消費者に押す (build/foldr, Almide WASM)。どちらも中間リストを消去する
- 代数的融合規則 → map(map(xs,f),g) → map(xs,compose(g,f)) (functor law)、fold(map(xs,f),init,g) → fold(xs,init,λ(acc,x).g(acc,f(x)))。これらの等式が融合の正当性を保証
- GHC の build/foldr → リストを Church encoding (cons と nil を受け取る関数) で表現し、foldr と直接結合。GHC のリライトルールで自動適用
- 融合が効かないケース → リストの複数回消費、zip、副作用、非インラインクロージャ。特にクロージャがインライン展開されないと融合が破壊される
- Almide の WASM stream fusion → パイプラインパターンを検出し中間リストなしの単一ループ WASM を直接 emit。1M 要素 map→filter→fold で 7.1ms→1.2ms

## Links

- [Stream Fusion: From Lists to Streams to Nothing at All (Coutts et al., 2007)](https://doi.org/10.1145/1291151.1291199)
- [A Short Cut to Deforestation (Gill et al., 1993)](https://doi.org/10.1145/165180.165214)
- [Deforestation: Transforming Programs to Eliminate Trees (Wadler, 1988)](https://doi.org/10.1016/0304-3975(90)90147-A)

## 関連

- [[equality-saturation]] — 代数的融合規則の自動適用に使える最適化フレームワーク
- [[functional-programming]] — stream fusion は関数型パイプラインの核心的最適化
- [[dead-code-elimination]] — 融合後に不要になった中間関数を DCE で除去
- [[hof-inline-fusion]] — Almide での HOF インライン融合。ラムダ本体をループに展開する前段の最適化
