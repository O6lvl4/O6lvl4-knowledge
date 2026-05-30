---
title: パーサコンビネータ
tags: [programming-paradigm, computer-science]
created_at: 2026-05-30
updated_at: 2026-05-30T20:44:00+09:00
---

小さなパーサを**高階関数（combinator）で合成**して、大きな文法のパーサを組み立てる技法。`Parser a` ＝「入力を消費して `a` を生む（失敗・残り入力を扱う）」関数の抽象。文法を**ホスト言語の値**として書く点が、外部のパーサジェネレータと対照的。

## 構成

```haskell
satisfy :: (Char -> Bool) -> Parser Char   -- 原子
(<|>)   :: Parser a -> Parser a -> Parser a -- 順序付き選択
many    :: Parser a -> Parser [a]           -- 繰り返し
```

- `map`/`<*>` … アプリカティブ合成、`>>=` … モナド合成（文脈依存の文法）
- 実体は**再帰下降**パーサ。[[pushdown-automaton|PDA]]／[[chomsky-hierarchy|文脈自由文法]]に対応
- **左再帰は直接扱えない**（変換が要る）。パックラットで線形時間化する実装も

## 位置づけ

- **[[decoder-pattern|デコーダパターン]]と同型** — `Parser ≈ Decoder`（未知入力→型付き値＋失敗）。テキスト相手か構造化データ相手かの違い
- パーサジェネレータ（yacc）や [[tree-sitter-almide|tree-sitter]] のような生成系と対比される。コンビネータは「ライブラリとして言語内で完結」する手軽さが利点、性能・エラー回復は生成系が有利なことも
- 代表: Haskell の parsec/megaparsec、Scala の FastParse、Rust の nom

## なぜ重要か

文法を第一級の値として**部品から組み立て**られる。型で結果が保証され、[[make-illegal-states-unrepresentable|パースの段階で型付き値に落とす]]「parse, don't validate」の実装手段になる。

## 関連

- [[decoder-pattern|デコーダパターン]] — 構造化データ版の同型パターン
- [[chomsky-hierarchy|チョムスキー階層]] / [[pushdown-automaton|PDA]] — 再帰下降＝文脈自由の認識
- [[polymorphism|ポリモーフィズム]] — combinator はアプリカティブ/モナド構造
