---
title: Comonad
tags: [programming-paradigm, type-theory]
created_at: 2026-05-30
updated_at: 2026-05-31T09:46:45+09:00
---

[[monad|Monad]] の圏論的双対。Monad が「値を文脈に**入れて**作用を積む」なら、Comonad は「**文脈付き値**から値を取り出し、文脈全体を使って計算する」。`extract` と `extend`（または `duplicate`）が中核。

## 定義（Monad との対）

| | [[monad\|Monad]] `m` | Comonad `w` |
|---|---|---|
| 入口/出口 | `return :: a -> m a` | `extract :: w a -> a` |
| 連結 | `bind :: m a -> (a -> m b) -> m b` | `extend :: w a -> (w a -> b) -> w b` |
| 入れ子 | `join :: m (m a) -> m a` | `duplicate :: w a -> w (w a)` |
| 直感 | **出力に作用**（producer of effects） | **入力に文脈**（context-dependent computation） |

`extend f` は「フォーカスを動かしながら、各位置で**周囲の文脈ごと** `f` を適用する」操作。

### クラス定義（Haskell 風）

```haskell
class Functor w => Comonad w where
  extract   :: w a -> a               -- counit。文脈から「今の値」を取り出す
  duplicate :: w a -> w (w a)         -- comultiplication。各位置に「そこを焦点にした文脈」を詰める
  extend    :: (w a -> b) -> w a -> w b

  -- duplicate と extend は相互定義可能（どちらか一方で済む）
  extend f = fmap f . duplicate
  duplicate = extend id
```

### Comonad 則（Monad 則の双対）

```haskell
extract      . duplicate         = id            -- 左単位（return-bind の双対）
fmap extract . duplicate         = id            -- 右単位
duplicate    . duplicate         = fmap duplicate . duplicate   -- 結合律
-- extend 形: extract . extend f = f,  extend extract = id,  extend f . extend g = extend (f . extend g)
```

## 代表例

- **Stream / 無限リスト** — 各位置で隣接要素を見る計算（移動平均など）
- **Zipper** — フォーカス付きデータ構造。セルオートマトンは「近傍を見て次状態を決める」＝ `extend` そのもの
- **Store comonad** `(s -> a, s)` — 関数＋現在位置。画像のたたみ込み、スプレッドシート（セル＝周囲参照）
- **Env / CoReader** `(e, a)` — 環境付き値（Reader モナドの双対）

### Store comonad

「現在位置 `s`」と「位置から値を引く関数 `s -> a`」の対。スプレッドシートのセルや画像のピクセルのように、周囲を参照して計算するものを表す。

```haskell
data Store s a = Store (s -> a) s    -- (引く関数, 焦点)

instance Comonad (Store s) where
  extract     (Store f s)   = f s                      -- 焦点の値
  duplicate   (Store f s)   = Store (Store f) s        -- 各位置 s' に「s' を焦点とした Store」を詰める
  extend g    (Store f s)   = Store (\s' -> g (Store f s')) s

-- 1次元の「移動平均」フィルタ: 焦点の左右を見る
peek :: s -> Store s a -> a
peek s' (Store f _) = f s'

blur :: Store Int Double -> Double
blur w = (peek (pos-1) w + extract w + peek (pos+1) w) / 3
  where Store _ pos = w
-- avg = extend blur w で、全位置に一括適用（各位置の文脈ごと blur）
```

### Zipper（リストの焦点付き表現）

```haskell
data Zipper a = Zipper [a] a [a]   -- (左を逆順, 焦点, 右)

instance Comonad Zipper where
  extract   (Zipper _ x _) = x
  duplicate z = Zipper (iterateMaybe left z) z (iterateMaybe right z)
    -- 各位置に「そこを焦点にした Zipper 全体」が入る
  -- extend f = fmap f . duplicate ⇒ 各位置で近傍を見た f を一括適用

-- Conway のライフゲーム / 1次元 CA は extend rule そのもの:
--   next = extend rule grid   （rule :: Zipper Cell -> Cell が近傍を読む）
```

## なぜ重要か

「周囲の文脈に依存する計算」を一様に扱える。セルオートマトン、画像処理（畳み込み）、スプレッドシート、ストリーム処理、リアクティブ UI が同じ `extend` の形に乗る。Monad が副作用（[[algebraic-effects|effect]]）のモデルなら、**Comonad は文脈・資源要求（[[coeffect|coeffect]]）のモデル**になる。

## 押さえどころ（カード化候補）

- Comonad とは → Monad の圏論的双対。`return/bind/join` の矢印を全部逆にしたもの（`extract/extend/duplicate`）。「文脈付き値から値と周辺計算を取り出す」
- 三演算 → `extract :: w a -> a`（焦点を取る）、`duplicate :: w a -> w (w a)`（各位置にそこを焦点とした文脈を詰める）、`extend :: (w a -> b) -> w a -> w b`（全位置に近傍依存の計算を一括適用）。`extend f = fmap f . duplicate`
- Store comonad → `(s -> a, s)` = 引く関数＋焦点。`extend` で「各位置の近傍を見る計算」を一括適用＝畳み込み・移動平均・スプレッドシート再計算
- セルオートマトン → 次世代 = `extend rule grid`。`rule` が Zipper/Store で近傍を読む。CA・畳み込み・ステンシル計算がすべて同じ `extend` 形に乗る
- effect ↔ coeffect → Monad は「出力に作用を積む」（effect）、Comonad は「入力に文脈を要求する」（[[coeffect|coeffect]]）。双対の対比

## 関連

- [[monad|Monad]] — 双対の相手。bind↔extend、return↔extract
- [[coeffect|Coeffect]] — comonad でモデル化される「文脈・資源の要求」
- [[duality|双対]] — Monad/Comonad は圏論的双対の一例
- [[algebraic-effects|Algebraic Effects]] — effect（出力側）に対する coeffect（入力側）の対比
