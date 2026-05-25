---
title: ceangal-anime
tags: [almide, graphics, animation]
created_at: 2026-05-18
updated_at: 2026-05-19
---

anime.js インスパイアの [[almide|Almide]] 用アニメーションエンジン。純 WASM、DOM/JS ランタイム依存なし。

## 何をするものか

UI 要素やグラフィックスオブジェクトのプロパティ（位置、サイズ、色、透明度など）を時間経過で滑らかに変化させる。Web の CSS アニメーションや anime.js と同じ役割だが、DOM に依存せず WASM 上で動くため [[ceangal]] の GPU レンダリングパイプラインと直接統合できる。

## 機能

- **イージング関数** — 31種類（Robert Penner's: ease-in, ease-out, bounce, elastic 等）。動きの加減速を制御する
- **トゥイーン** — 開始値から終了値への補間アニメーション
- **タイムライン** — 複数アニメーションの順次・並列実行
- **スタガー** — 複数要素にずらしてアニメーション適用（リスト表示のウェーブ効果など）
- **制御** — ループ、反転、遅延、一時停止、再開

## 関連

- [[ceangal]] — このアニメーションエンジンを利用する UI フレームワーク
- [[almide|Almide]] — 言語本体
