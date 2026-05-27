---
title: Equality Saturation
tags: [computer-science, compiler, optimization, algorithm]
created_at: 2026-05-27
updated_at: 2026-05-27
---

プログラムの等価な表現をすべて同時に探索し、最適なものを選択するコンパイラ最適化手法。従来のリライトルール適用が「1つの表現を別の1つに書き換える」のに対し、equality saturation は「等価な表現を E-graph に蓄積し、最後にコスト最小のものを抽出する」。

## 従来のリライト最適化の問題

```
// リライトルール: a * 2 → a << 1
// リライトルール: (a << 1) + a → a * 3

// 入力: (a * 2) + a
// ルール1 を適用: (a << 1) + a
// ルール2 を適用: a * 3  ✓ 最適

// しかし...
// 入力: (a * 2) + a
// 別の順序でルール適用すると、a * 3 に到達できないことがある
```

従来のリライト最適化はルールの **適用順序** に依存する。あるルールを適用すると別のルールが適用不能になる「phase ordering problem」が発生する。

## E-graph: 等価クラスのグラフ

E-graph (equivalence graph) はプログラムの等価な表現を **すべて同時に** コンパクトに保持するデータ構造。

```
// E-graph のイメージ
// {a * 2, a << 1} はひとつの等価クラス (e-class)
// 元の式と書き換え後の式が同じクラスに属する

e-class 1: { a }
e-class 2: { 2 }
e-class 3: { 1 }
e-class 4: { a * 2,  a << 1 }    // ルール a*2 → a<<1 で統合
e-class 5: { (a * 2) + a,  (a << 1) + a,  a * 3 }
           //  ↑ 元の式      ↑ ルール1適用   ↑ ルール2適用
           //  3つとも等価として共存
```

E-graph では書き換えが **破壊的でない**: 元の式を消さずに新しい等価表現を追加するだけ。全ルールを飽和 (saturation) するまで適用し続けても、表現が失われない。

## Equality Saturation のアルゴリズム

```
1. 入力プログラムを E-graph に変換

2. repeat (飽和するまで):
     for rule in rewrite_rules:
       E-graph 内でルールの左辺にマッチする部分を検索
       マッチした箇所の右辺を E-graph に追加
       左辺と右辺の E-class を統合 (union)
     rebuild(E-graph)  // 不変条件を修復

3. E-graph からコスト最小の表現を抽出 (extraction)
```

### 飽和 (Saturation)

新しい等価表現が追加されなくなるまでルールを適用し続ける。実用上はノード数や反復回数に上限を設けて打ち切る。

### 抽出 (Extraction)

コスト関数 (命令コスト、レイテンシ、コードサイズ等) に基づいて、各 E-class から最適な E-node を選択し、最適な具体プログラムを復元する。

## egg: Rust の E-graph ライブラリ

Willsey et al. (2021) "egg: Fast and Extensible Equality Saturation" (POPL)。E-graph と equality saturation を汎用的に実装した Rust クレート。

```rust
use egg::*;

// 言語の定義 (算術式)
define_language! {
    enum SimpleLanguage {
        Num(i32),
        "+" = Add([Id; 2]),
        "*" = Mul([Id; 2]),
        "<<" = Shl([Id; 2]),
        Symbol(Symbol),
    }
}

// リライトルールの定義
let rules: &[Rewrite<SimpleLanguage, ()>] = &[
    rewrite!("mul-2-to-shl"; "(* ?a 2)" => "(<< ?a 1)"),
    rewrite!("shl-1-add-to-mul-3"; "(+ (<< ?a 1) ?a)" => "(* ?a 3)"),
    // ... 他のルール
];

// Equality saturation の実行
let runner = Runner::default()
    .with_expr(&"(+ (* a 2) a)".parse().unwrap())
    .run(rules);

// コスト最小の表現を抽出
let extractor = Extractor::new(&runner.egraph, AstSize);
let (cost, best) = extractor.find_best(runner.roots[0]);
// best = (* a 3)
```

### egg の技術的貢献

| 技術 | 効果 |
|---|---|
| Rebuilding | union 後の不変条件修復をバッチ化。従来の即時修復より大幅高速 |
| E-class analysis | 各 E-class に抽象値 (定数畳み込み等) を付与。ルールの条件付き適用に使用 |
| パターンマッチ | E-graph 上の効率的なパターンマッチ。リライトルールの左辺を高速検索 |

## Cranelift の Acyclic E-graph (aegraph)

Wasmtime の [[wasmtime|Cranelift]] コンパイラバックエンドが採用する、E-graph ベースの最適化パス。業界初の E-graph ベース本番コンパイラ。

従来の E-graph との違い:
- **非巡回制約**: SSA の支配木構造を利用し、循環を許さない
- **GVN + LICM + DCE を統合**: 単一フレームワークで複数の最適化を同時実行
- **ISLE DSL**: リライトルールを宣言的に記述し、検証可能性を確保

## Almide での実験 (almide-egg-lab)

egg クレートを使って [[stream-fusion|stream fusion]] の代数的規則を equality saturation で適用する PoC。

```
// 適用されるルール
map(map(xs, f), g)            → map(xs, compose(g, f))
filter(filter(xs, p), q)      → filter(xs, and_pred(p, q))
fold(map(xs, f), init, g)     → fold(xs, init, compose_fold(g, f))
flat_map(flat_map(xs, f), g)  → flat_map(xs, compose_flat(f, g))
```

命令型のパターンマッチでは見落とすパターンも、equality saturation なら網羅的に発見できる。matrix 融合ルールも `@rewrite` アノテーションから自動生成される。

## 他の適用領域

| 領域 | 用途 |
|---|---|
| コンパイラ最適化 | ピープホール最適化、強度削減、定数畳み込み (egg, Cranelift) |
| プログラム合成 | 等価な候補プログラムの探索空間を E-graph で表現 |
| 自動定理証明 | 等式推論の自動化 |
| ハードウェア設計 | RTL 最適化、FPGA 合成 |
| 数学的最適化 | 数式簡約、テンソル演算の最適化 (Tensat) |

## Phase Ordering Problem との関係

従来コンパイラの最適化パイプラインは固定順序:

```
定数伝播 → 強度削減 → DCE → インライン化 → 定数伝播 → ...
```

各パスの実行順序が最終結果を左右する (phase ordering problem)。Equality saturation はこの問題を原理的に回避する: 全ルールを同時に試し、最後に最適な表現を選ぶため、順序への依存がない。

ただし実用上は:
- E-graph の成長を制御する必要がある (ノード数爆発)
- コスト関数の設計が最適性に直結する
- 飽和しない場合の打ち切り基準が必要

## 押さえどころ（カード化候補）

- Equality Saturation とは → リライトルールを飽和するまで E-graph に適用し、等価な表現をすべて同時に保持してからコスト最小のものを抽出する。適用順序への依存 (phase ordering problem) を原理的に回避
- E-graph の核心 → 書き換えが破壊的でない。元の式を消さずに新しい等価表現を追加するだけ。E-class (等価クラス) が複数の E-node (等価な部分式) を保持
- 飽和と抽出 → 飽和: 新しい等価表現が追加されなくなるまでルール適用。抽出: コスト関数に基づいて各 E-class から最適な E-node を選択し具体プログラムを復元
- egg の技術的貢献 → Rebuilding (バッチ化された不変条件修復)、E-class analysis (各クラスへの抽象値付与)。POPL 2021
- Phase Ordering Problem → 従来のリライト最適化はルール適用順序で結果が変わる。equality saturation は全ルールを同時に試すため順序非依存。ただし E-graph の成長制御が必要
- Cranelift の aegraph → 業界初の E-graph ベース本番コンパイラ。非巡回制約 + SSA 支配木で GVN/LICM/DCE を統合。ISLE DSL でリライトルール記述
- stream fusion への応用 → map(map(xs,f),g) → map(xs,compose(g,f)) 等の代数的規則を equality saturation で網羅的に適用。命令型パターンマッチでは見落とすパターンも発見

## Links

- [egg: Fast and Extensible Equality Saturation (Willsey et al., POPL 2021)](https://doi.org/10.1145/3434304)
- [egg (GitHub)](https://github.com/egraphs-good/egg)
- [Cranelift's E-graph Based Optimization (Wasmtime RFC)](https://github.com/bytecodealliance/rfcs/blob/main/accepted/cranelift-egraph.md)
- [E-Graphs Good (community site)](https://egraphs-good.github.io/)

## 関連

- [[stream-fusion]] — equality saturation で代数的融合規則を自動適用 (Almide の almide-egg-lab)
- [[wasmtime]] — Cranelift の aegraph が E-graph ベース最適化を本番採用
- [[dead-code-elimination]] — E-graph からの抽出で不要ノードが自然に除去される
