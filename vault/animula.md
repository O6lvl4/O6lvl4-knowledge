---
title: animula
tags: [aituber, vtuber]
created_at: 2026-05-31
updated_at: 2026-05-31T21:45:51+09:00
---

AI VTuber プロジェクト。[[live2d|Live2D]] のアバターを AI で駆動する。

> このノートは [[live2d]] からの参照を埋めるための最小スタブ。具体的な構成・技術スタック・現状は要追記(分かる範囲で書いてください)。

## 中核ループ

[[live2d]] ノートが描く AI VTuber の中核は **音声合成 → 表情パラメータ生成 → Cubism SDK へ送信**。Live2D 自体は「絵を動かす部分」だけで、AI(対話生成・感情推定・口パク同期)は外側に積む。

```
入力(チャット/イベント) → 応答生成(LLM) → 音声合成(TTS) → 表情/口パクパラメータ
                                                          → Cubism SDK でアバター描画
```

## 関連

- [[live2d]] — アバター描画基盤(2D)。本プロジェクトの「絵を動かす部分」
- [[aituber-cost]] — AITuber 配信のコスト構造(LLM + TTS)
- [[aituber-engagement-response]] — 応答をエンゲージメントで最適化する設計
- [[style-bert-vits2]] / [[voicevox]] — 音声合成の選択肢
- [[aitube-studio]] — Almide 版 AITuber 配信基盤(隣接プロジェクト)
