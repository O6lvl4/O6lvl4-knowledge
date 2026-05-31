---
title: Emacs
tags: [editor, lisp, tools]
created_at: 2026-05-31
updated_at: 2026-05-31T23:01:18+09:00
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

## 2026年の Emacs

半世紀目に入っても現役で、コアの近代化が続く一方、AI エディタ時代に「立ち位置」を問われている。

**バージョン**
- **Emacs 30.1**(2025-02 リリース)— **Android ネイティブ対応**(タッチ/スワイプにコマンド束縛可)、tree-sitter モード(`*-ts-mode`)が非 ts モードの**サブモード化**(従来設定が継承される)、`use-package :vc`(VCS から直接パッケージ導入)、native-comp が事実上の既定路線(byte-compile 比 2–5倍)。
- **Emacs 31**(2026 にブランチ作成・feature freeze 入り)— ウィンドウ操作の拡充ほか。注目の**新 GC は 31 には入らない**。
- **IGC(incremental / concurrent GC)** — Ravenbrook の **MPS** ライブラリを使い「固まらない Emacs」を狙う開発ブランチ。大きなバッファや LSP で顕著な **GC ポーズの解消**が目的。ただし ARM Linux / Raspberry Pi では MPS 未対応で当面使えない。

**AI 統合** — 「環境を自分で組む」思想が LLM 時代に効いている。
- **gptel** — 定番の LLM クライアント。任意のバッファから対話でき、**tool-use(エージェント化)・MCP(`mcp.el`)・マルチモーダル・reasoning** に対応。
- **Ellama** — 要約/リファクタ/翻訳などタスク特化コマンド群。`copilot.el` / `codeium.el` は常時インライン補完。
- 「単一ツールでなく**合成可能なレイヤ**(常時補完 + on-demand チャット + エージェント)として積む」のが 2026 の実践。拡張性がそのまま AI ワークフローの自由度になる。

**競合の中での立ち位置** — AI ネイティブ編集の波。
- **Zed**(Rust、入力遅延 <1ms、AI 内蔵=Zeta/Copilot)が「速さ + 無設定で効く AI」で台頭。
- **Neovim**(Lua、非同期、LSP/tree-sitter 内蔵、CodeCompanion/ACP/MCP)がモーダル派の IDE 化を担う。
- Emacs は依然「**エディタ = OS**(メール・git・シェル・AI クライアントまで内側)」のニッチ。速さや既定の手軽さでは劣るが、**全部を1つの Lisp 空間で再構成できる**唯一性で生き残っている。

## Links

- [Emacs 30.1 released (gnu.org)](https://lists.gnu.org/archive/html/emacs-devel/2025-02/msg00997.html)
- [What's New in Emacs 30.1 (Mastering Emacs)](https://www.masteringemacs.org/article/whats-new-in-emacs-301)
- [gptel — LLM client for Emacs](https://github.com/karthink/gptel)
- [Emacs news (Sacha Chua)](https://sachachua.com/blog/)

## 押さえどころ（カード化候補）

- **Emacs とは** → テキストを編集する Elisp インタプリタ環境。エディタの大半が Elisp 製で、動作中に再定義してエディタ自体を作り替えられる。
- **自己文書化** → `C-h f`/`C-h k` で任意の機能の定義・ソースへ即ジャンプ。エディタ自身がリファレンス。
- **構成** → buffer / major・minor mode / keymap / minibuffer。すべてがバッファで、機能はコマンド(Elisp 関数)。
- **Vim との対比** → Emacs=モードレス+Elisp で深く再定義、Vim=モーダルで編集高速化。拡張の深さと編集モデルが対照的。
- **現代の核** → org-mode(アウトライン/文芸的)、Magit(git)、eglot(LSP)、tree-sitter・native-comp(Emacs 28/29)。
- **2026年の状況** → Emacs 30.1(2025-02、Android 対応・ts モードのサブモード化)、31 はブランチ作成済み(新 GC は見送り)、IGC(MPS)で GC ポーズ解消を開発中。AI は gptel/Ellama/MCP を合成レイヤで。Zed/Neovim の AI ネイティブ化の中で「エディタ=OS」のニッチで生存。

## 関連

- [[lisp]] — Emacs Lisp の母体。コード=データの自己反映性がライブ改造を可能にする
- [[almide-lsp]] — eglot/lsp-mode 経由で言語サーバに接続し IDE 機能を得る
- [[convention-over-configuration]] — 対極の思想。Emacs は「規約より全部自分で構成」寄り
