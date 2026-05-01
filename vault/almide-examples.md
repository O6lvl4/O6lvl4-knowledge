---
title: almide-examples
tags: [almide, examples, benchmark]
---

[[almide|Almide]] プログラミング言語のサンプル集 + ベンチマーク。`ai-coding-lang-bench` の mini-git 実装で 30/30 テスト通過を実証。

## Structure

- `examples/` — 基本サンプル
  - `sample.almd` — 基本言語機能
  - `minigit.almd` — mini-git 実装の早期版
- `minigit-bench/` — [ai-coding-lang-bench](https://github.com/mame/ai-coding-lang-bench) の mini-git を Almide で実装
  - `minigit.almd` — フル実装（v1+v2、30/30 tests pass）
  - `build.sh` — TypeScript へトランスパイル
  - `minigit` — Deno 経由実行のシェルラッパ
  - `test-v1.sh` / `test-v2.sh` — ベンチマーク用テストスクリプト
  - `SPEC-v1.txt` / `SPEC-v2.txt` — mini-git 仕様
- `minigit-test/` — レガシー minigit テストハーネス

## Mini-git ベンチマーク実行

```bash
# 必要: Almide transpiler (llm-lang-spec repo) + Deno

cd minigit-bench
bash build.sh          # .almd → .ts
bash test-v1.sh        # v1 (11 tests)
bash test-v2.sh        # v2 (30 tests)
```

## 位置づけ

[[almide]] の MSR (Modification Survival Rate) 主張を裏付ける実証コード。LLM がこのサイズの mini-git を Almide で書いた場合に、連続修正後もコンパイル + テストが通るかを検証する。

## 関連

- [[almide]] — 言語仕様
- [[animula]] — Almide で書かれた AI VTuber フレームワーク

## Links

- [GitHub](https://github.com/O6lvl4/almide-examples)
