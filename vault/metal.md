---
title: Metal
tags: [graphics, gpu, apple]
created_at: 2026-05-19
updated_at: 2026-05-19
---

Apple の低レベル[[gpu|GPU]] API。2014年発表。macOS / iOS / visionOS で動作。

## 特徴

- [[opengl|OpenGL]] を置き換える Apple プラットフォーム専用 API
- グラフィックスと計算シェーダの両方をサポート
- Metal Shading Language (MSL) — C++ ベースのシェーダ言語
- ドライバオーバーヘッドが低い（[[vulkan|Vulkan]] / [[directx|DirectX]] 12 と同世代の設計）

## Apple Silicon との統合

Apple Silicon（M1〜）はユニファイドメモリアーキテクチャで CPU と GPU がメモリを共有。Metal はこれを活かしてゼロコピーのデータ受け渡しが可能。

## 関連

- [[vulkan|Vulkan]] — クロスプラットフォームの低レベル API。Metal と同世代
- [[directx|DirectX]] — Windows/Xbox の低レベル API
- [[webgpu|WebGPU]] — macOS では Metal がバックエンドとして使われる
- [[wgpu]] — Rust 製の WebGPU 実装。Metal バックエンドを持つ
- [[gpu|GPU]]
- [[xcode|Xcode]] — Apple 純正 IDE。Metal アプリのビルド・デバッグ・シェーダ編集環境
