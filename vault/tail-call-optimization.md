---
title: 末尾呼び出し最適化 (TCO)
tags: [computer-science, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:29:00+09:00
---

**末尾呼び出し（tail call）**＝関数の最後の動作が別の関数呼び出しで、その結果をそのまま返すもの。**TCO** は末尾呼び出しを「現在のスタックフレームを再利用したジャンプ」に変換し、スタックを消費しない最適化。末尾再帰を実質ループに変える。

## なぜ関数型で重要か

関数型は反復をループ構文でなく**再帰**で書く。TCO が無いと深い再帰でスタックオーバーフローする。Scheme は言語仕様で **proper tail calls** を必須とし、再帰だけで無限ループを書ける。

```haskell
-- 非末尾再帰: 呼び出し後に「* n」が残る → フレームが積もる
fac n = if n == 0 then 1 else n * fac (n - 1)

-- 末尾再帰: 呼び出しが最後 → フレーム再利用でループ化できる
facAcc n acc = if n == 0 then acc else facAcc (n - 1) (n * acc)
```

## 言語別の対応

| 環境 | TCO | 備考 |
|---|---|---|
| Scheme / Lua / Elixir・Erlang | あり（仕様/標準） | proper tail calls |
| Scala / Kotlin | 自己末尾再帰のみ | `@tailrec`。JVM に TCO 命令が無いため相互再帰は trampoline |
| Haskell | 遅延評価で事情が異なる | サンクの積み上がりに注意（`foldl'` 等） |
| JavaScript | 仕様にはあるが実質 Safari のみ | ES6 PTC はほぼ未実装 |
| WebAssembly | あり | tail call 命令（[[wasm-core\|Wasm 3.0]] で標準化） |

JVM など TCO の無い基盤では **trampoline**（呼び出しを値として返し、ループで駆動）で代替する。

## 継続との関係

**CPS（継続渡しスタイル）変換**を施すと、プログラム中の**すべての呼び出しが末尾呼び出し**になる。[[continuation|継続]]・[[abstract-machine|抽象機械]]がコールスタックを明示化する話と表裏。

## 関連

- [[continuation|継続 / 限定継続]] — CPS 変換で全呼び出しが末尾化する
- [[abstract-machine|抽象機械]] — スタック/継続を状態として明示化する実行モデル
- [[stack-oriented-programming|スタック指向]] — コールスタックとフレームの話の土台
- [[wasm-core|WebAssembly Core]] — tail call 命令を持つ実行環境
