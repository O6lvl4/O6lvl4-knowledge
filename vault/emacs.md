---
title: Emacs
tags: [editor, lisp, tools]
created_at: 2026-05-31
updated_at: 2026-05-31T22:53:02+09:00
---

拡張可能・自己文書化されたテキストエディタ。実体は **[[lisp|Emacs Lisp]] (Elisp) のインタプリタ環境**で、「テキストを編集する Lisp マシン」と言った方が正確。1976年 RMS(Richard Stallman)らに由来、GNU Emacs が本流。

## 核心: 編集機能そのものが Lisp で書かれている

小さな C コア(Elisp インタプリタ + 低レベル描画)の上に、**エディタの大半が Elisp で実装**されている。だから動作中にその場で関数を再定義でき、エディタを**実行時に作り替えられる**。[[lisp]] の「コード = データ」が、ライブに改造可能な環境として現れた形。

```elisp
;; 選択範囲を行ソートするコマンドをその場で定義し、キーに割り当てる
(defun my/sort-region (beg end)
  (interactive "r")          ; 選択範囲を引数に
  (sort-lines nil beg end))
(global-set-key (kbd "C-c s") #'my/sort-region)
```

`C-h f`(関数)/`C-h k`(キー)で**任意の機能の定義・ソースに即ジャンプできる**=自己文書化。エディタ自身が最良のリファレンス。

## 構成概念

| 概念 | 役割 |
|---|---|
| buffer | 編集対象(ファイル・出力・REPL すべてバッファ) |
| major mode | バッファの主たる編集モード(言語ごと等、排他) |
| minor mode | 直交して足す機能(行番号・補完等、複数可) |
| keymap | キー → コマンド(Elisp 関数)の対応。階層的に上書き |
| minibuffer | コマンド入力・補完の対話領域 |

## エディタ哲学の対比

| | Emacs | Vim / Neovim | VSCode |
|---|---|---|---|
| 拡張言語 | **Elisp**(エディタ内蔵の汎用 Lisp) | Vimscript / Lua | JS/TS(拡張は別プロセス) |
| 編集モデル | モードレス(修飾キー和音) | **モーダル**(挿入/ノーマル) | モードレス |
| 拡張の深さ | コアまで再定義可(同一 Lisp 空間) | 設定+プラグイン | API 越し(サンドボックス) |
| 思想 | 「環境を自分で作る」 | 「編集を高速化する」 | 「すぐ使える既定」 |

「最高の OS だが、まともなエディタが足りない」という古いジョークは、Emacs が事実上の実行環境(メール・git・シェル・RSS まで Elisp アプリで動く)であることを言い当てている。

## エコシステム(現代)

- **org-mode** — アウトライン/タスク/文芸的プログラミング(コードブロック実行)。Emacs 最大のキラーアプリ
- **Magit** — git の対話 UI。「Magit のために Emacs を使う」人がいるほど完成度が高い
- **パッケージ** — MELPA がデファクトのリポジトリ
- **LSP** — `lsp-mode` / 軽量な `eglot`(Emacs 29 で同梱)→ [[almide-lsp|LSP]] で他言語の IDE 機能
- **tree-sitter** — Emacs 29 でコア統合(`*-ts-mode`)。構文解析ベースのハイライト/構造編集
- **native-comp**(gccemacs, Emacs 28) — Elisp を libgccjit でネイティブコンパイルし高速化

## なぜ重要か

「**道具を使う側が道具そのものを書き換えられる**」設計の極北。設定とプラグインの境界が無く、ユーザーのカスタムも組み込み機能も同じ Elisp 空間に同居する。拡張性をコアに置く思想は [[lisp]] の自己反映性(reflection)とマクロ文化の直系で、半世紀使われ続ける耐久性の源でもある。

## 押さえどころ（カード化候補）

- **Emacs とは** → テキストを編集する Elisp インタプリタ環境。エディタの大半が Elisp 製で、動作中に再定義してエディタ自体を作り替えられる。
- **自己文書化** → `C-h f`/`C-h k` で任意の機能の定義・ソースへ即ジャンプ。エディタ自身がリファレンス。
- **構成** → buffer / major・minor mode / keymap / minibuffer。すべてがバッファで、機能はコマンド(Elisp 関数)。
- **Vim との対比** → Emacs=モードレス+Elisp で深く再定義、Vim=モーダルで編集高速化。拡張の深さと編集モデルが対照的。
- **現代の核** → org-mode(アウトライン/文芸的)、Magit(git)、eglot(LSP)、tree-sitter・native-comp(Emacs 28/29)。

## 関連

- [[lisp]] — Emacs Lisp の母体。コード=データの自己反映性がライブ改造を可能にする
- [[almide-lsp]] — eglot/lsp-mode 経由で言語サーバに接続し IDE 機能を得る
- [[convention-over-configuration]] — 対極の思想。Emacs は「規約より全部自分で構成」寄り
