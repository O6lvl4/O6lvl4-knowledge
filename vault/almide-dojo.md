---
title: almide-dojo
tags: [almide, llm, benchmark]
created_at: 2026-05-01
updated_at: 2026-05-18
---

[[almide|Almide]] コンパイラの MSR（Modification Survival Rate）を日次測定するベンチマークスイート。Almide で実装。

## タスク構成

| 難易度 | タスク数 | 規模 |
|---|---|---|
| Basic | 15 | < 20 LOC |
| Intermediate | 10 | 20-80 LOC |
| Advanced | 5 | > 80 LOC |

## 計測フロー

1. LLM にタスクを渡してコード生成
2. `almide check` + `almide test` で検証
3. 失敗時はエラーメッセージをフィードバックしてリトライ（最大3回）
4. 1-shot 成功率、N-shot 成功率、平均リトライ数を記録

## 結果例

- Claude Sonnet 4.6: 100% pass (30/30)、47% 1-shot
- Llama 3.3 70B: 61% pass (17/28)

## ダッシュボード

GitHub Pages で公開。失敗分類とトップエラーコードを可視化。

## 関連

- [[the-almide-doctrine]] — MSR を一次指標に置くドクトリン本体
- [[almide]] — 計測対象の言語本体
- [[asymptotic]] — MSR→1.0 は飽和漸近。日次計測は「どこで磨きを切り上げるか」の判断材料
