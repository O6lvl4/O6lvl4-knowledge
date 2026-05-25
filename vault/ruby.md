---
title: Ruby
tags: [language, dynamic, scripting]
created_at: 2026-05-07
updated_at: 2026-05-07
---

まつもとゆきひろ（Matz）が 1993 年に開発を始め、1995 年に最初のパブリックリリースを出した **動的型・オブジェクト指向の汎用プログラミング言語**。**「プログラマの幸福（programmer happiness）」を一次価値に据えた稀な言語**で、後に [[rails]] のランタイムとして英語圏で爆発的に普及した。

## 何のために作られたか

Matz が設計時に明示した目標は「**Perl より高機能でオブジェクト指向、Smalltalk より実用的、Lisp より読みやすい**」言語。

- 当時（1990 年代前半）の選択肢は Perl（書きやすいが大規模で破綻）、Python（オブジェクト指向だが哲学が違う）、Smalltalk（純度が高すぎる）、Java（重い、登場直後）
- Matz は **「言語そのものが書き手の気分を左右する」** という前提を強く持っており、構文の自然さ・読みやすさ・書き手のリズムを言語仕様の判断基準に据えた
- これは「機能の網羅性」「型安全性」「性能」を優先する当時の主流の言語設計とは根本的に違う立ち位置

## 言語特徴（[[rails]] にとって本質的なもの）

[[rails]] が成立する上で Ruby のどの特徴が効いたかという観点で整理する。

| 特徴 | Rails での使われ方 |
|---|---|
| **すべてがオブジェクト**（プリミティブも含めて） | `5.times do ... end` のような自然な記法 |
| **ブロック**（クロージャ） | `posts.each { |p| ... }` 等。DSL の基本ピース |
| **メタプログラミング**（`define_method`, `method_missing`, `class_eval`） | `has_many :comments` 一行でアクセサ・関連メソッド群が動的生成される魔法の正体 |
| **オープンクラス**（既存クラスを開いて拡張可能） | Rails の `2.weeks.ago` のような ActiveSupport 拡張 |
| **シンボル** `:name` と Hash リテラル | 設定オプションを自然に書ける（`render :json => @post`）|
| **括弧省略可能なメソッド呼び出し** | `validates :title, presence: true` が宣言文に見える |
| **暗黙の `self`** | DSL 内で context が自然 |
| **mixin / module** | 多重継承の代替として薄く機能を混ぜ込める |

これらが揃って初めて、`class Post < ActiveRecord::Base; has_many :comments; end` が「**コードに見えない設定**」になる。同じ機能を Java で書こうとすると注釈と XML と setter が並んで宣言の見通しが消える。

## 「書いていて気持ちいい」を価値にした稀さ

Ruby の差別化は機能ではなく **態度** にある。

- 公式ドキュメントや Matz の発言で **「programmer happiness」「principle of least surprise」** が一次目標として繰り返し言及される
- これは「Java は正しさ、C++ は速度、Haskell は型」のような言語の自己定義の中で、極めて珍しい立ち位置
- 現実には POLS（最小驚き原則）は Matz 自身の感覚であって、ユーザーの感覚とは必ずしも一致しないが、**「設計者がそれを目標として明言している」** という事実が言語の文化を作った

この態度が、当時 Java や C++ に疲れたプログラマの受け皿になった。Ruby が「カッコいい言語」だったのは、機能ではなくこの態度の故。

## Ruby を温めた人々（Rails 普及前夜）

Rails が 2004 年に登場するまでに、Ruby は英語圏で既に文化的な土台ができていた。

- **Matz** — 言語と公式コミュニティの中心。日本人作者ながら、英語圏のカンファレンスにも登壇し、文化的な顔として機能した
- **Dave Thomas / Andy Hunt（Pragmatic Programmers）** — 『達人プログラマー』の著者であり、**Programming Ruby**（"Pickaxe" 本、2001 初版）で英語圏に Ruby を紹介。日本発の言語としては破格に早く英語ドキュメントが整った
- **Why the lucky stiff（_why）** — 詩的・奇妙・芸術的なチュートリアル「why's (poignant) Guide to Ruby」と、Hpricot や Camping などの実用ライブラリで「Ruby は他とは違う何か」という空気を作った文化的アイコン。2009 年に突如インターネットから姿を消したエピソード自体が伝説化している

つまり 2004 年時点で Ruby は **「機能で勝負する小規模言語」ではなく「文化的に温まったオルタナティブ」** として既にポジションを取っていた。[[rails]] はこの土壌の上で芽吹いた。

## 現在の立ち位置

- 2026 年現在も **[[rails]] が事実上のキラーアプリ**。Web 以外の用途は限定的
- 性能面は MRI（CRuby）が依然として GIL 持ちで、並列処理は弱い。JRuby / TruffleRuby のような代替実装で補う場面がある
- Ruby 3.0（2020）で **Ractor**（並列実行単位）と **型シグネチャ RBS** が導入され、現代化が進んだ
- 採用企業の重心は Shopify / GitHub / Stripe / Airbnb / Cookpad など「Rails で立ち上がり、規模化しても Rails を捨てなかった」企業群
- 新規言語としての勢いは TypeScript / Go / Rust / Kotlin に譲っているが、**「Web プロダクトを少人数で立ち上げる」用途では今も第一候補**

## 押さえどころ（カード化候補）

- Ruby の作者と最初の公開年 → **まつもとゆきひろ（Matz）、1995 年**
- Ruby が一次価値に据える設計目標 → **プログラマの幸福（programmer happiness）と最小驚き原則（POLS）**
- Rails の魔法を支える Ruby の言語特徴 3 つ → **ブロック、メタプログラミング、オープンクラス**
- Rails 登場前に Ruby を英語圏で温めた本 → **Pragmatic Programmers の Programming Ruby（"Pickaxe" 本、2001）**
- _why the lucky stiff とは → **詩的なチュートリアル「why's (poignant) Guide to Ruby」と多数の OSS で Ruby 文化を作った匿名作者。2009 年に消失**
- Ruby 3.0 の主要な現代化 → **Ractor（並列実行単位）と RBS（型シグネチャ）**

## Links

- [Ruby 公式](https://www.ruby-lang.org/ja/)
- [Programming Ruby (Pickaxe)](https://pragprog.com/titles/ruby5/programming-ruby-3-3-5th-edition/)
- [why's (poignant) Guide to Ruby（アーカイブ）](https://poignant.guide/)
- [Matz の言語設計に関する講演アーカイブ](https://www.ruby-lang.org/en/news/)
