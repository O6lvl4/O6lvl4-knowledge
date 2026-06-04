---
title: sweep（差分テスト / 生成ベースのバグ発見）
tags: [testing, verification, computer-science]
created_at: 2026-06-03
updated_at: 2026-06-03T13:39:35+09:00
---

「sweep」は俗称で、世の中では **差分テスト(differential testing)+ ランダム/系統的なプログラム生成(コンパイラ fuzzing)** として確立した手法。**多数のプログラムを生成し、同値であるべき2つの実装の出力を突き合わせて発散(divergence)を炙り出す**。McKeeman (1998) が「差分テスト」として定式化したのが起点。

## 中心アイデア: オラクル問題の回避

テストの難所は「正解(オラクル)を別途どう用意するか」。差分テストはこれを回避する — **正解を決めずとも、同値なはずの2実装が食い違えば、どちらかが必ずバグ**。生成器が入力を量産し、照合が穴を炙り出す。

## 世の中の確立した手法・ツール

| 名前 | 対象 | オラクルの作り方 |
|---|---|---|
| **Csmith**(Yang+ PLDI'11) | C コンパイラ | ランダム C 生成 → 複数コンパイラ(GCC/Clang…)の出力を**差分**。3年で 325+ バグ |
| **EMI / Equivalence Modulo Inputs**(Le+ PLDI'14) | 最適化コンパイラ | 実行されない分岐を刈って**同値変種**を作る(メタモルフィック)。GCC/LLVM で 147 バグ |
| **YARPGen**(OOPSLA'20) | C/C++ | スコープ/UB を制御したランダム生成 |
| **QuickCheck**(Claessen & Hughes 2000) | 任意の関数 | **性質(プロパティ)**を生成入力で反証。Hypothesis(Py)/fast-check(JS) |
| **SQLancer**(M. Rigger) | DBMS の論理バグ | 同値変換オラクル **PQS / NoREC / TLP**(メタモルフィック+差分) |
| **jsfunfuzz / AFL / libFuzzer / OSS-Fuzz** | JS エンジン・任意プログラム | カバレッジ誘導 fuzzing |

→ 「sweep」が指すのは、この系統の **クロス実装/クロスターゲットの差分テスト**。

## オラクルの3類型

正解を用意できない所で「食い違い」を判定する作り方は、ほぼ3つ:

1. **クロス実装/ターゲット** — 同一仕様の別実装を互いの基準に(Csmith: 複数コンパイラ、native vs WASM の照合)
2. **メタモルフィック** — 入力/プログラムを**意味を変えない変換**にかけ、出力が変わったらバグ(EMI、SQLancer の TLP/NoREC、[[deterministic-codegen|決定性]]前提)
3. **参照実装 vs 最適化版** — 素朴で正しい実装 vs 速い実装

## なぜ spec テストより穴を見つけるか

人手の spec テストは限られたケース + 部分観測(例: 長さや勝者だけ)で、想定外の**組み合わせ・境界**を踏まない。生成ベースは**広く薄く**当てて穴を突くので「やればやるだけ出てくる」。[[model-checking|モデル検査]]の全探索とは対照的に、確率的・系統的に網羅の隙間を埋める。

## 発見した後: 縮める

生成された発散プログラムは巨大で読めないことが多い。**test-case reduction**(C-Reduce / delta debugging)で、発散を保ったまま最小の再現例へ機械的に縮めるのが定石。

## 身近な実例: Almide の closure cross-target sweep

クロスターゲット差分テストの一例。closure プログラムを **native(Rust 経由)== WASM** で照合し、カテゴリ別(スカラ/フラット配列/ネスト/variant payload/HOF)に振る。初回で 15 発散 → 修正、再走で 2 バグ(Unit-param closure variant の trap、`group_by` Int-key の invalid module)。→ vault では [[almide-differential-gate|差分ゲート]](新旧照合)と対。

## 押さえどころ（カード化候補）

- **正体** → 俗称 sweep ＝ 世の差分テスト(McKeeman 1998)+ ランダムプログラム生成(コンパイラ fuzzing)。
- **中心アイデア** → オラクル問題の回避。「正解を決めずとも、同値な2実装が食い違えばどちらかがバグ」。
- **代表ツール** → Csmith(C生成→複数コンパイラ差分)、EMI(同値変種=メタモルフィック)、QuickCheck(性質ベース生成)、SQLancer(DBMS の PQS/NoREC/TLP)。
- **オラクル3類型** → クロス実装/ターゲット・メタモルフィック・参照vs最適化。
- **後処理** → test-case reduction(C-Reduce/delta debugging)で最小再現に縮める。

## Links

- [Csmith — Finding and Understanding Bugs in C Compilers (PLDI 2011)](https://doi.org/10.1145/1993498.1993532)
- [EMI — Compiler Validation via Equivalence Modulo Inputs (PLDI 2014)](https://doi.org/10.1145/2594291.2594334)
- [YARPGen — Random Testing for C and C++ Compilers (OOPSLA 2020)](https://users.cs.utah.edu/~regehr/yarpgen-oopsla20.pdf)
- [SQLancer / Manuel Rigger](https://github.com/sqlancer/sqlancer)

## 関連

- [[almide-differential-gate]] — 新旧を照合する差分テスト(sweep のクロスターゲット版に対し同一ターゲット版)
- [[deterministic-codegen]] — 出力が決定的でないと発散判定が成立しない前提(メタモルフィックの土台)
- [[model-checking]] — 全探索で網羅する対極。sweep は生成で広く当てる
- [[anf-closure-lifting-bug]] — 事後検証が本物のバグを炙り出した別事例(postcondition 版)
- [[error-messages-for-ai-agents]] — テスト(症状信号)で穴を炙り出す側。型エラー(因果信号)との対比
- [[traversal-totality|走査網羅性]] — sweep は乖離を事後に炙り出す。totality はその源流(走査の取りこぼし)を静的に断つ
