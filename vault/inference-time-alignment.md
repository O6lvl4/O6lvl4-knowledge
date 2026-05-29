---
title: 推論時アライメント
tags: [ai, llm, machine-learning]
created_at: 2026-05-29
updated_at: 2026-05-29T18:56:07+09:00
---

モデルの**重みを更新せず**、推論時に出力を良くするアライメント。生成済みの候補を[[reward-machine-learning|報酬]]で選別/誘導する。**best-of-N** が代表で、[[reward-machine-learning]] の「推論時最適化」軸を理論として詰める分野。2024〜2025 に急速に立ち上がった。

## なぜ推論時か

RLHF 等の重み更新は高コストで、学習後は報酬が固定される。推論時アライメントなら:

- **報酬を差し替え即反映**(再学習不要)
- **ベースモデル不変**(壊さない・共有できる)
- 学習スタックなしで [[engagement-driven-generation]] のような最適化を載せられる

代償は**推論コスト**(候補を複数出す)。

## 主な手法

| 手法 | やること | 報酬の使い方 |
|---|---|---|
| **Best-of-N (BoN)** | N 本生成して報酬最大を返す | 完成文をスコア → argmax |
| **Controlled / Guided decoding** | デコード中に報酬で確率を歪める | トークン単位で誘導 |
| **Reward-guided tree search** | 探索木を報酬で枝刈り | 部分系列をスコア(NAACL 2025) |
| **Speculative rejection / Best-of-Poisson** | BoN を高速化・近似 | 早期棄却で計算削減 |
| **InfAlign-CTRL** | 報酬較正 + KL 正則化付き最大化 | BoN の勝率を 3–8% 改善 |

## 急所: 報酬ハッキング / 過剰最適化

**N を大きくするほど良くなるとは限らない**。proxy 報酬(代理指標)に過適合し、真の質はむしろ劣化する — reward over-optimization。

- 基礎は OpenAI の **Scaling Laws for Reward Model Overoptimization**(Gao et al., 2022)。報酬最適化が破綻する地点をスケーリング則で定式化。
- 推論時に限った定式化が **Inference-Time Reward Hacking**(arXiv 2506.19248)。proxy 報酬を **hedge** する(信じすぎない)ことで緩和。
- **InfAlign**(Google DeepMind, arXiv 2412.19792)は KL 正則化で逸脱を抑え、過剰最適化を回避する。

→ best-of-N は素朴に N を上げるのではなく、**KL 正則化・報酬較正・hedging**で守るのが現代の作法。これは [[engagement-driven-generation]] の反・報酬ハッキング(`√(f·|𝒜|)` の品質項、素モデルへの KL)と同じ問題。

## 誰が研究しているか

| グループ | 代表仕事 |
|---|---|
| **Google DeepMind** | InfAlign(inference-aware alignment) |
| **Microsoft Research / MIT 系**(Foster, Block, Krishnamurthy ら) | "Is Best-of-N the Best of Them?"(ICML 2025、BoN の被覆・スケーリング・最適性の理論) |
| **Harvard**(Flavio Calmon グループ) | Inference-Time Reward Hacking |
| **OpenAI** | 報酬過剰最適化のスケーリング則(基礎) |

主会場は NeurIPS / ICML / NAACL。

## Links

- [InfAlign: Inference-aware language model alignment (arXiv 2412.19792)](https://arxiv.org/pdf/2412.19792)
- [Is Best-of-N the Best of Them? (PMLR 2025)](https://proceedings.mlr.press/v267/huang25c.html)
- [Inference-Time Reward Hacking in LLMs (arXiv 2506.19248)](https://arxiv.org/html/2506.19248v2)
- [Reward-Guided Tree Search for Inference Time Alignment (NAACL 2025)](https://aclanthology.org/2025.naacl-long.625.pdf)

## 関連

- [[reward-machine-learning]] — 本分野が最大化する「報酬」そのもの。推論時最適化はその一軸
- [[engagement-driven-generation]] — best-of-N を実運用に載せる側。反・報酬ハッキングの設計を共有
- [[viralbert]] — best-of-N の報酬モデルとして挿せる予測器
