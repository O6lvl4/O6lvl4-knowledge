---
title: almide-lsp
tags: [almide, lsp, editor, tooling]
created_at: 2026-05-20
updated_at: 2026-05-20
srs_state: new
card_count: 5
reviewed_count: 0
next_due: 2026-05-20
---

[[almide|Almide]] の Language Server Protocol サーバー。`almide lsp` で起動する。v0.19.0 で Phase 1 を実装。

## アーキテクチャ

- stdio ベースの LSP（lsp-server 0.7 / lsp-types 0.97）
- ファイル単位のインクリメンタルチェック（ワークスペース単位のキャッシュは未実装）
- `textDocument/didOpen` と `textDocument/didChange` をトリガーに Diagnostics を publish

## Phase 1 機能（v0.19.0）

### Diagnostics

ファイルが開かれた時・変更された時にコンパイルパイプラインを走らせ、エラー/警告を LSP Diagnostic として publish。

```
Lexer → Parser → Canonicalization → Type Checker
    ↓         ↓              ↓              ↓
    エラーがあればその時点で Diagnostic を収集
```

- Almide の `Diagnostic` を LSP の `DiagnosticSeverity`（Error / Warning）にマッピング
- ヒントがある場合はメッセージに `"\nhint: hint_text"` として付加
- エラーコード（E001, E005 等）を preserveして programmatic consumption 可能

### Hover

2 パターンのホバー情報を提供：

| パターン | トリガー | 表示内容 |
|---|---|---|
| `Module.func` | stdlib 関数上 | 関数シグネチャ（`crate::stdlib::lookup_sig()` で参照） |
| キーワード | 言語キーワード上 | キーワードの説明 |

対応キーワード: `fn`, `let`, `var`, `type`, `match`, `effect`, `test`, `import`, `mut`, `true`, `false`, `none`, `some`, `ok`, `err`

レスポンスは Markdown フォーマット。

### Completion

| トリガー | 入力例 | 補完内容 |
|---|---|---|
| モジュール補完 | `list.` | モジュール内の関数一覧（シグネチャ付き） |
| キーワード補完 | `ef` | `effect` 等のマッチするキーワード |

トリガー文字: `"."`（ドット入力で発火）

## Phase 2-3（未実装）

- Go-to-definition / Find references
- Rename across file
- Document symbols / Outline
- Code actions
- Cross-file project support

## エディタ統合

[[vscode-almide]] が LSP クライアントとして `almide lsp` を起動する。Neovim 等の LSP 対応エディタでも利用可能。

## 押さえどころ（カード化候補）

- LSP Phase 1 の 3 機能 → **Diagnostics（リアルタイムエラー表示）、Hover（stdlib 関数シグネチャ + キーワード説明）、Completion（モジュール関数 + キーワード）**
- Diagnostics のパイプライン → **Lexer → Parser → Canonicalization → Type Checker。各段階でエラーを収集し LSP Diagnostic に変換**
- Hover の仕組み → **Module.func パターンは stdlib::lookup_sig() でシグネチャ参照。キーワードは静的な説明テキスト**
- Completion のトリガー → **ドット (.) 入力でモジュール関数一覧。キーワードはコンテキスト非依存で候補提示**
- 未実装の Phase 2-3 → **Go-to-definition, Find references, Rename, Document symbols, Code actions, Cross-file support**

## 関連

- [[almide]] — 言語本体
- [[vscode-almide]] — VS Code 拡張（LSP クライアント）
- [[almide-repl]] — REPL（同じく v0.19.0 で追加）
- [[almide-compiler-errors]] — Diagnostics が表示するエラーの品質
