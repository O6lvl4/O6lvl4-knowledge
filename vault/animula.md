---
title: animula
tags: [almide, ai-vtuber, wasm, rust, framework]
---

[[almide|Almide]] で書く AI VTuber フレームワーク。レンダリング・オーディオ・ネットワーク・LLM・TTS をネイティブ Rust ホストで束ね、キャラクターロジックは Almide で記述する。

## Vision

> *Animula, vagula, blandula, / Hospes comesque corporis…*
> — Hadrian (117–138 CE)

`animula` はラテン語で "little soul"。Hadrian の臨終の詩で「離れゆく自身の魂」に呼びかける言葉に由来し、キャラクターに宿る "魂" を意味する。

賭け: **小さなバイナリ + LLM が書きやすいコードベース** が、次世代の AI 駆動バーチャルプレゼンスの正しい形。

## Layout

```
src/        Almide application (main.almd)
host/       Rust native host — obsid + (将来) audio / http / ai を合成
almide.toml almide ビルド設定
build/      ビルド出力（almide.wasm）
```

## Build + run

```bash
# 1. Almide → wasm
mkdir -p build
almide build src/main.almd --target wasm -o build/animula.wasm

# 2. Rust host で実行
cd host && cargo run --release -- ../build/animula.wasm
```

## Roadmap

1. **Programmatic head**（Milestone 1、現状）— face + eyes + mouth を別メッシュとして orbit camera + ambient idle motion で描画
2. **Audio host extension** — `audio.play_pcm`, `audio.get_amplitude`、wav 再生 e2e
3. **HTTP host extension** — synchronous wasm → async Rust 側 `reqwest` クライアント、live LLM endpoint でテスト
4. **TTS glue** — VOICEVOX 等。テキスト in、PCM out、(2) 経由で再生
5. **Lip sync** — (2) の amplitude が mouth Y scale を駆動、obsid が morph target を獲得後は morph weight 駆動に
6. **LLM loop** — user prompt → chat → TTS → animated speech

各マイルストーンで `host/` の `HostState` にフィールドを追加し、wasmtime linker に obsid renderer の隣に import を登録する。

## Status

**Milestone 1** — wasmtime + wgpu + winit のネイティブホスト上で、obsid renderer 経由のプログラマティックヘッド（face + eyes + mouth）描画。後のマイルストーンで独立アニメーションさせるためメッシュは分割済み。

## 関連 (Almide ecosystem)

- [[almide]] — 言語そのもの
- [obsid](https://github.com/almide/obsid) — 3D rendering runtime（このプロジェクトの `host/native/` で再利用）
- [lumen](https://github.com/almide/lumen) — math primitives
- [[almide-examples]] — Almide サンプル + ベンチマーク

## Links

- [GitHub](https://github.com/Aid-On/animula)
