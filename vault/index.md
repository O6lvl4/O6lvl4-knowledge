---
title: Welcome
tags: [meta]
---

O6lvl4 と Aid-On の全 public リポジトリ（および private 例外: [[famulus]], [[famulus2]]）を Obsidian vault にまとめた知識ベース。

## Concept

- [[agentic-coding]] — LLM が自律的にコードを読み書き・実行する開発パラダイム

## Languages & Runtimes

- [[almide]] — LLM 生成最適化言語（Rust + WASM、MSR 指標）
- [[almide-examples]] — Almide サンプル + mini-git ベンチマーク
- [[animula]] — Almide で書く AI VTuber フレームワーク
- [[lean4-rust-backend]] — Lean 4 → Rust IR codegen
- [[lean2ts]] — Lean 4 定理 → TypeScript property test
- [[lean4-learning]] — Lean 4 学習リポジトリ集合
- [[zfp]] — Zig 用 zero-cost FP toolkit
- [[php-build-standalone]] — 静的リンク済 PHP バイナリ

## Toolchain Managers

- [[anyv-core]] — `*v` 系の共通基盤
- [[gv]] — Go バージョンマネージャ（uv 級速度）
- [[rv]] — Ruby バージョン & gem マネージャ
- [[qusp]] — 21 言語 toolchain superposition
- [[homebrew-tap]] — `brew install O6lvl4/tap/...`

## Agent / CLI Frameworks

- [[claude-code]] — Anthropic 公式 CLI エージェント
- [[famulus]] — Aid-On 製 CLI エージェント（先代）
- [[famulus2]] — ハイブリッド AI コーディングエージェント
- [[ccgrid]] — Claude Agent SDK ベースのチーム管理ツール
- [[rtk]] — LLM トークン消費を 60-90% 削減する CLI プロキシ

## Code Analysis

- [[codopsy]] — 25 言語対応 Rust 製 AST 品質アナライザ
- [[codopsy-ts]] — TS/JS 用品質アナライザ（A〜F スコア）
- [[codopsy-ts-skill]] — Claude Code plugin 版
- [[treesrc]] — ディレクトリ構造とファイル内容の出力 CLI

## LLM Infrastructure

- [[unillm]] — エッジ向け統一 LLM インターフェース（48 モデル）
- [[nagare]] — Web Streams API + reactive operators
- [[fractop]] — フラクタル分割で長文を LLM 処理
- [[iteratop]] — 収束ループ（Scrum / OODA）
- [[templex]] — 記事から抽象テンプレ抽出
- [[whenm]] — 時間認識メモリシステム
- [[memory-rag]] — RAG ベースのメモリ
- [[fuzztok]] — CJK 対応 fuzzy トークン推定
- [[llm-throttle]] — RPM/TPM レートリミッタ
- [[llm-queue-dispatcher]] — LLM リクエスト最適化キュー

## Knowledge / Docs

- [[graph-garden]] — Markdown vault → Astro 静的サイト
- [[premaid]] — Mermaid CLI レンダラ
- [[outline-api-client-ts]] — Outline KB API TypeScript クライアント

## Observability

- [[sashiko]] — Ruby concurrency-boundary observability (OTel)

## DevOps / CLI Utilities

- [[syncenv]] — `.env` をクラウドストレージで版管理
- [[igloc]] — gitignore 対象スキャン（.env, secrets）
- [[azprofile]] — Azure CLI プロファイル切替
- [[dns-checker]] — MoonBit 製 DNS レコードチェッカー
- [[resepy]] — CSV/TSV 可逆区切り変換
- [[pdf-burger]] — 複数 PDF を 1 ファイルに重ねる
- [[image-catalog-composer]] — 画像をラベル付きグリッドに合成
- [[capto]] — キャプチャ・スクリーンショット系 CLI
- [[llmine]] — LLM 関連 CLI 実験

## macOS Apps

- [[ClipStash]] — メニューバー型クリップボード履歴（Obj-C 200 行）
- [[macleap]] — 現 Mac の同等機種検出と買い替えコスト試算
- [[memre]] — AI フラッシュカード（Native macOS、DDD）

## Wellness

- [[gulp-coach]] — 水分摂取コーチ（完全ローカル）
- [[environment-health-viewer]] — 気圧/UV/大気質/花粉ビューア

## Aid-On Business Tools

- [[aid-on-contract-generator]] — 契約書ジェネレータ
- [[aid-on-invoice-generator]] — 請求書ジェネレータ
- [[aid-on-tax-calculator]] — 税額計算（端数誤差ゼロ）
- [[reporting-page-by-calendar-days]] — カレンダー日ベースレポート
- [[reporting-page-by-working-days]] — 営業日ベースレポート

## Aid-On UI

- [[aid-on-draft-ui]] — UI 試作版
- [[aid-on-ui-system]] — UI システム本流

## Auth

- [[next-auth-providers]] — NextAuth.js プロバイダ
- [[auth-providers-ts]] — framework-agnostic OAuth クライアント

## Personal Setup

- [[dotfiles]] — シェル・エディタ設定

## Collective Notes

- [[sandboxes-o6lvl4]] — sandbox / experiment 群（30+ リポジトリ）
- [[training-repos]] — 学習・演習用リポジトリ群

---

> 注: graph-garden は `astro build` / `astro dev` 時に index.md を自動再生成する。手動で書いたこの MOC を残したい場合は、build 直後に commit するか、別ファイル（例 `home.md`）に置き換えるとよい。
