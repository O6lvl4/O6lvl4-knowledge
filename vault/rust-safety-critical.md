---
title: Rust と安全臨界 (Ferrocene / RustBelt)
tags: [rust, safety-critical, formal-methods]
created_at: 2026-05-29
updated_at: 2026-05-29T23:52:08+09:00
---

[[rust|Rust]] は安全臨界(航空・自動車・医療)で使えるか。言語の素性(メモリ安全)は向いているが、[[soup|SOUP]]/認証の壁は同じく立ちはだかる。Rust を現実に投入可能にしているのは **Ferrocene(認定済みツールチェーン)+ RustBelt(証明済み型システム)** の2本柱。「WASM はランタイムが未認証でダメ」と対比すると、**Rust には認定路が既にある**点が決定的に違う。

## 3層で見る Rust の安全臨界適性

| 層 | Rust の状態 | 究極の比較対象 |
|---|---|---|
| **言語** | 借用チェッカーで GC 無しメモリ安全(設計で保証) | — |
| **ツールチェーン** | **Ferrocene** が認定済み(rustc は本来 SOUP) | CompCert(検証済み C コンパイラ) |
| **形式的基盤** | **RustBelt** が型システムの健全性を機械証明 | — |

## Ferrocene — 認定済み Rust ツールチェーン

[[ferrocene|Ferrocene]] = Ferrous Systems が rustc の下流を **TÜV SÜD で tool qualification** したもの。コンパイラ=SOUP 問題を正面から解く。

- **ISO 26262 ASIL D**(自動車・最高レベル)
- **IEC 61508 SIL 3**(産業機能安全。SIL 4 の顧客認証を支援)
- **IEC 62304 Class C**(医療)— **Rust ツールチェーン初の達成、2025/1**
- **DO-178C (DAL C)** は顧客の認証取得を支援する段階
- core ライブラリの**認定サブセット**も拡大中(IEC 61508 SIL 2 / ISO 26262 ASIL B、認定関数 2,903→5,169、最小 panic hook 等を含む / Ferrocene 26.02.0)

→ 同等に広く認定された WASM 実行系がまだ乏しいのと対照的。

## RustBelt — 型システムの健全性を機械証明

Rust の安全性主張は long らく「証明されていない仮説」だった。**RustBelt**(Jung et al., POPL 2018, MPI-SWS)が、現実的な Rust 部分集合の安全性を **Coq 上の分離論理フレームワーク Iris** で**機械証明**した初の成果。

- 手法は **semantic type soundness**(意味論的型健全性)。
- **`unsafe` を使うライブラリへの拡張が肝** — 各 unsafe ライブラリが満たすべき検証条件を与え、「安全な拡張」と認める枠組み。Rust の安全性が unsafe の上の抽象で成り立つ構造に対応。
- 後続: RustHornBelt(機能検証)、RefinedRust(高保証検証)。

## 「認定」と「証明」は別物

Rust が持つもの・持たないものを混同しない:

- **Ferrocene = qualification**(プロセス・テストを認証機関が認定)。rustc が正しいことを**証明**してはいない。
- **RustBelt = 型システムの証明**。コンパイラ実装(rustc/LLVM)の証明ではない。
- **CompCert**(Leroy/INRIA, Coq で**コンパイラ自体**が意味保存を証明された C コンパイラ)が「コンパイラが SOUP でない」唯一級の到達点。**Rust に CompCert 相当は無い**。

## 言語以外の留保

- **`unsafe`** はチェックを迂回 → 安全臨界コーディング規約で制限(MISRA 相当の Rust ガイドライン策定が進行)。
- **`panic` / `std`** の扱い(no_std 化、`panic=abort`、巻き戻し無効化)が要る。
- 検証ツール: Kani(モデル検査)、Prusti / Creusot(演繹検証)、Miri。

## まとめ — Almide / WASM との関係

[[accepted-safety-in-systems|8原則]]で言えば、Rust は **①⑤**(言語の安全)を設計で稼ぎ、Ferrocene が **⑥**(依存物=ツールの正当化)の一部を埋める。だが **③④⑦⑧(プロセス・アーキテクチャ冗長・トレーサビリティ・独立検証)は依然別物**。言語選定は土台であって認証そのものではない。

皮肉な多層構造: **[[almide|Almide]] のコンパイラは Rust 製**。Almide が Perceus を Lean4 で証明しても、それを吐く rustc/LLVM が SOUP — 証明と SOUP が層をなす。Almide にとっての現実的含意は、**自前で IR→WASM の証明連鎖を閉じる**か、**Ferrocene のような認定路に乗る**か、の二択に近い。

## Links

- [Officially Qualified — Ferrocene (Ferrous Systems)](https://ferrous-systems.com/blog/officially-qualified-ferrocene/)
- [Ferrocene Becomes First Rust Toolchain to Achieve IEC 62304 Qualification](https://www.businesswire.com/news/home/20250114192138/en/Ferrocene-Becomes-First-Rust-Toolchain-to-Achieve-IEC-62304-Qualification)
- [RustBelt (POPL 2018, MPI-SWS)](https://plv.mpi-sws.org/rustbelt/popl18/)

## 関連

- [[ferrocene]] — 認定済みツールチェーンの詳細(OSS・FLS・認定範囲)
- [[rust]] — 言語本体。借用と所有権による静的メモリ安全
- [[soup]] — rustc/LLVM も本来は SOUP。Ferrocene がそれを認定で解く
- [[safety-critical-certification]] — Almide のギャップ。Rust の認定路と対比
- [[accepted-safety-in-systems]] — 言語の安全は8原則のうち①⑤+⑥一部にすぎない
- [[perceus]] — Almide の証明済み RC。Rust の借用チェッカーと同じく「言語レベルの安全」を担う
