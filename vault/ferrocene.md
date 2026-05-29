---
title: Ferrocene
tags: [rust, safety-critical]
created_at: 2026-05-29
updated_at: 2026-05-29T23:59:19+09:00
---

**安全臨界向けに認定された [[rust|Rust]] ツールチェーン**。Ferrous Systems(+ 当初 AdaCore)開発。上流 rustc を**フォークせず**、同じコンパイラを**認定されたビルド/テスト/リリースプロセス**で出す点が肝。[[rust-safety-critical|Rust を安全臨界に投入する話]]の中核で、rustc が本来 [[soup|SOUP]] である問題を tool qualification で解く実例。

## 何が "Ferrocene" なのか — コンパイラでなくプロセス

中身の rustc は上流とほぼ同一(フォークして別物を作るのではない)。Ferrocene が付加するのは:

- **認定の証跡**(qualification evidence) — どう作り・テストし・リリースしたかの文書一式
- **長期サポート**(LTS)と固定されたリリースチャネル
- **[[rust|Rust]] 言語仕様(FLS)** — 認定に必須(後述)

→ 価値は「別の安全なコンパイラ」ではなく「**普通の rustc を認証に通せる形にした**」こと。

## 認定範囲(TÜV SÜD)

| 標準 | レベル |
|---|---|
| ISO 26262(自動車) | **ASIL D** |
| IEC 61508(産業) | **SIL 3**(SIL 4 の顧客認証を支援) |
| IEC 62304(医療) | **Class C**(Rust ツールチェーン初、2025/1) |
| DO-178C(航空) | DAL C の顧客認証を支援する段階 |

加えて **core ライブラリの認定サブセット**も拡大中(IEC 61508 SIL 2 / ISO 26262 ASIL B、認定関数 2,903→5,169、最小 panic hook 等 / Ferrocene 26.02.0)。

## 完全オープンソース(認証文書ごと)

ツールチェーンは **MIT OR Apache-2.0** で、**認定文書まで含めて公開**。安全臨界の認証成果物は通常クローズド・高額なので、これは異例。ビジネスは**有償サポート/サブスクと証明書の提供**で成立させる。

## FLS — Ferrocene 言語仕様

ツールチェーン認定には「**コンパイラがソースをどう扱うべきか=言語仕様**」が要る。だが当時 Rust に公式仕様が無かった → Ferrous Systems と AdaCore が **2022/7 に FLS を作成**。

- のちに **FLS を Rust Project に寄贈** → 公式 Rust 仕様策定の土台に。
- 「認証要件が、言語そのものの仕様整備を前に進めた」という波及効果。

## 開発体制

当初 **AdaCore + Ferrous Systems の共同開発**(ISO 26262 / IEC 61508 認定を TÜV SÜD で推進)。その後**両社は提携を解消**し、各々が高インテグリティ Rust 市場を独立して支援する形に。Ferrocene は Ferrous Systems が継続。

## Links

- [Officially Qualified — Ferrocene (Ferrous Systems)](https://ferrous-systems.com/blog/officially-qualified-ferrocene/)
- [Ferrous Systems Donates FLS to Rust Project (Rust Foundation)](https://rustfoundation.org/media/ferrous-systems-donates-ferrocene-language-specification-to-rust-project/)
- [First Rust Toolchain to Achieve IEC 62304 Qualification](https://www.businesswire.com/news/home/20250114192138/en/Ferrocene-Becomes-First-Rust-Toolchain-to-Achieve-IEC-62304-Qualification)

## 関連

- [[rust-safety-critical]] — Ferrocene を含む「Rust と安全臨界」の全体像
- [[rust]] — 上流の言語/コンパイラ。Ferrocene はその認定ディストリビューション
- [[soup]] — rustc は本来 SOUP。Ferrocene の tool qualification がそれを正当化する
- [[iso-26262]] / [[iec-62304]] / [[do-178c]] — 認定先の各標準
- [[safety-critical-certification-bodies]] — TÜV SÜD が担う「第三者評価機関」の位置づけ
