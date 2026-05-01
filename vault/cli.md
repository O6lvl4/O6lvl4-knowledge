---
title: CLI (Command Line Interface)
tags: [concept, cli, tooling, ux]
---

キーボードから文字でコンピュータに指示を出す方式。アイコンやボタンの代わりに、文字のコマンドで操作する。

## 何ができる？／なぜ重要？

レストランで例えるとわかりやすいです。タッチパネル式の券売機（GUI）はボタンを押すだけで誰でも注文できますが、用意されたメニューしか選べません。一方、紙の注文書に「ラーメン、ネギ多め、麺固め、替え玉あり」と細かく書く方式（CLI）は慣れが必要ですが、思い通りに細かく指示できます。

これが嬉しいのは、指示を「文章」として残せることです。同じ作業を毎日繰り返したいときも、注文書を一枚コピーすれば同じ結果が得られます。なければ、毎回ボタンを順番に押し直す必要があり、自動化や共有が難しくなります。CLI なら他の人にコマンドをそのまま渡せば、まったく同じ操作を再現できます。

## 仕組み

```mermaid
flowchart LR
    User[人間] --> Keyboard[キーボード入力]
    Keyboard --> Shell[シェル<br/>例: zsh, bash]
    Shell --> Parser[コマンド解釈]
    Parser --> Tool[ツール実行]
    Tool --> Output[標準出力に文字]
    Output --> User
```

ユーザーがコマンドを打つと、シェルがそれを解釈してツールを起動します。ツールは結果を文字として出力し、ユーザーに返します。

## 用語

- **シェル**: ユーザーの入力を受け取ってコマンドを実行する基本ソフト（zsh、bash など）。
- **コマンド**: 「何をしてほしいか」を表す動詞。例: `ls`、`git`。
- **引数 (Argument)**: コマンドに渡す対象や設定値。例: `ls /tmp` の `/tmp`。
- **オプション (Flag)**: コマンドの動作を変える指定。例: `ls -l`。
- **標準入出力 (stdin/stdout)**: 文字の流れの入口と出口。
- **パイプ**: あるコマンドの出力を別のコマンドの入力に直接つなぐ仕組み（`|`）。
- **エグジットコード**: コマンド終了時の成否を表す数値。0 が成功。
- **ターミナル**: CLI を操作するための「黒い画面」。

## vault 内での使われ方

- [[claude-code]] — Anthropic の CLI 型エージェント
- [[rtk]] — コマンド出力を圧縮する CLI ツール
- [[codopsy]] — コード品質計測の CLI
- [[codopsy-ts]] — TypeScript 版 codopsy CLI
- [[famulus2]] — コード解析 CLI
- [[capto]] — キャプチャ用 CLI
- [[gulp-coach]] — コーチング CLI
- [[fractop]] — 分割処理 CLI
- [[gv]] — Graphviz 関連 CLI
- [[ccgrid]] — グリッド表示 CLI
- [[macleap]] — Mac 向け CLI
- [[image-catalog-composer]] — 画像カタログ生成 CLI
- [[premaid]] — Mermaid 図生成 CLI
- [[treesrc]] — ソースツリー表示 CLI
- [[dns-checker]] — DNS チェック CLI
- [[ClipStash]] — クリップボード CLI
- [[azprofile]] — Azure プロファイル CLI

## 関連概念

- [[api]] — プログラム同士の窓口（CLI は人間向け、API はプログラム向け）
- [[agentic-coding]] — エージェントが CLI を駆使してコードを書く

## Links

- [Wikipedia: コマンドラインインタフェース](https://ja.wikipedia.org/wiki/%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E3%83%A9%E3%82%A4%E3%83%B3%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9)
