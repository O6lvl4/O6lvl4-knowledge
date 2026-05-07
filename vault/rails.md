---
title: Ruby on Rails
tags: [web-framework, ruby, history, dx]
created_at: 2026-05-07
updated_at: 2026-05-07
srs_state: new
card_count: 8
reviewed_count: 0
next_due: 2026-05-07
---

David Heinemeier Hansson（DHH）が 2004 年 7 月に公開した、**[[ruby]] で書かれたフルスタック Web アプリケーションフレームワーク**。Basecamp（37signals）の社内コードから抽出された。**[[convention-over-configuration]]** と DRY を核に据え、当時の Web 開発の生産性基準を一段階押し上げた。設計哲学は後に [[the-rails-doctrine]] として 9 原則に体系化されている。

## Rails が Rails たりえた理由（テーゼ）

Rails の本質的な勝因は **機能の多寡ではなく時代との噛み合わせ** にある。同等の機能だけなら J2EE のほうが豊富だったし、PHP のほうが配布は容易だった。**「2004 年というタイミングで」「Ruby というプログラマに気持ちのいい言語の上で」「当時の標準を大きく超える利便性を提供できた」** という三つが揃ったことで Rails は Rails になった。これらが一つでも欠けていれば、Rails は単なる「もう一つの MVC フレームワーク」で終わっていた可能性が高い。

つまり Rails の歴史は、**フレームワーク単独の歴史ではなく、Ruby というランタイム選択・Web 2.0 という時代潮流・37signals という思想集団の三層が重なった現象** として読むべきもの。

## 2004 年に Rails が入った地形

Rails が登場した時、Web アプリ開発の主要選択肢は以下のような状況だった。

| 環境 | 当時の体感 | Rails が突きつけた問い |
|---|---|---|
| **Java + Struts / J2EE** | XML 設定の山、EJB の重さ、IDE 必須、エンタープライズ志向 | 「なぜ Hello World に 5 ファイル必要なのか」 |
| **PHP 4/5** | 配布は楽だが、構造を強制する仕組みが薄い。スパゲッティ化しやすい | 「規約と構造はもっと安く手に入るはず」 |
| **Perl + Mason / CGI** | 古参の現場では現役。だが新規採用は減少 | 「もう Perl で新規プロジェクトを始める時代ではない」 |
| **ASP.NET 1.x** | Microsoft 専用、Windows サーバ前提、ライセンス費用 | 「OSS のプラットフォームでも同水準のものが作れる」 |
| **Python + Zope / TurboGears** | 構成が複雑、または立ち上がり期 | （Ruby 陣営から見た）哲学の対比相手 |

Rails 以前の主流は「**設定ファイルで挙動を記述し、IDE がそれを解釈して支援する**」モデルだった。Rails はその前提を反転させた。

## Rails が持ち込んだ具体的な利便性

Rails が登場時点で提供したのは以下のような体験。**個々の機能ではなく、それらが「一つの一貫した規約の下で同梱されていた」** ことが核心。

- **scaffold** — `rails generate scaffold Post title:string body:text` で CRUD 一式（モデル・マイグレーション・コントローラ・ビュー・ルート）が生成される
- **ActiveRecord** — テーブル名から英語の単数形に推測してクラス名を一致させ、SQL を書かずに `Post.where(published: true).order(:created_at)` が動く
- **migration** — DB スキーマをコードで版管理（当時としてはまだ一般的ではなかった）
- **integrated routing** — `resources :posts` 一行で REST 7 アクションのルートが揃う
- **Ajax 同梱** — Rails 1.x は Prototype.js + script.aculo.us を同梱。`link_to_remote` で Ajax リンクが書けた（後に jQuery、現代は Hotwire）
- **環境分離** — development / test / production の 3 環境がデフォルトで分離
- **テストハーネス** — Rails 自身がテストフレームワークと fixture を内包

これらは個別には他言語にもあった。だが「**プロジェクト生成 5 秒・データベース付きの動く Web アプリが 15 分**」という体験は、当時の他のスタックにはほぼ存在しなかった。

### 「15 分でブログを作る」スクリーンキャスト

DHH が 2005 年に公開した [Creating a weblog in 15 minutes](https://www.youtube.com/watch?v=Gzj723LkRJY) スクリーンキャストは、Rails の伝播における最大の触媒。

- 当時のブログ更新で「タイトル・本文・コメント・管理画面」がついた CMS を作るのは、PHP なら数日、Java なら週単位
- それが 15 分のキー入力だけで動くという衝撃が、技術系ブロガーを通じて爆発的に広がった
- スクリーンキャストという媒体自体が当時まだ新しく、「動くものを画面で見せる」マーケティングの先駆け

## なぜ Ruby が「いけてる」言語だったか

Rails の勝因に時代背景があるとして、では「なぜ DHH は Ruby を選んだのか」「なぜそれが多くのプログラマに受けたのか」が問題になる。詳細は [[ruby]] 側に書くが、当時の文脈で重要だったのは次の点。

- **Matz の設計哲学**「プログラマの幸福」を明示的に掲げた言語は当時珍しかった。Java/C++ が「正しさ」「型安全」「規模耐性」を語っていた時代に、Ruby は「書いていて気持ちいい」を一次の価値に据えた
- **ブロックとメタプログラミング** が DSL を作りやすく、`has_many :comments` のような「コードに見えない宣言的な書き方」が自然に書けた。Rails の魔法の半分以上はこれで成立している
- **Smalltalk と Perl の良いとこ取り** という血統。学術的すぎず、しかし美しさを失わない
- **Pickaxe 本**（Programming Ruby, Pragmatic Bookshelf, 2001）が英語圏に Ruby を紹介済みだった。日本発の言語としては早期に英語ドキュメントが整っていたほう
- **Why the lucky stiff の文化的引力** —「why's (poignant) Guide to Ruby」のような奇妙で詩的なコンテンツが、技術コミュニティに「Ruby は他とは違う何かがある」という空気を作った

つまり Ruby は当時、**「他の主流言語に飽きた、書き味を重視する開発者」の受け皿** として既に文化的なポジションを獲得していた。Rails はその受け皿の上に立った。

## 時代の追い風（critical timing）

Rails が広まった 2004–2007 年は、Web 開発の地殻変動期だった。

- **Web 2.0**（Tim O'Reilly が 2004 年のカンファレンスで提唱）— ユーザー生成コンテンツ、参加型、リッチクライアント
- **Ajax**（Jesse James Garrett が 2005 年 2 月に命名）— Gmail と Google Maps が「ブラウザでデスクトップアプリ並みの体験ができる」ことを証明し、Web アプリの可能性が一気に広がった
- **dot-com bubble の傷が癒えた時期** — 2001 年崩壊から 3–4 年経ち、再び Web スタートアップが立ち上がる空気
- **Y Combinator 創設（2005 年 3 月）** — Paul Graham が始めた初期ステージ投資が「少人数で素早く Web プロダクトを作る」スタイルを定義し始めた。Rails はこのスタイルとほぼ完全に噛み合った
- **GitHub 創設（2008 年）** — Rails で書かれた最初の大規模プロダクトが、Rails コミュニティ自体のインフラになった。Rails 上に Rails の文化が再帰的に乗った

特に Y Combinator 系のスタートアップで Rails が標準採用された影響は大きい。Twitter（初期）、Shopify、Hulu、Airbnb（初期）、GitHub、Square、Basecamp 自身、Heroku — **2005–2010 年に立ち上がったメジャー Web プロダクトの相当部分が Rails で書かれた**。

## 中心人物 / 組織

### DHH（David Heinemeier Hansson）

- デンマーク出身、当時 24 歳前後
- コペンハーゲン商科大学卒、商業・経済バックグラウンド
- 2003 年から 37signals（後の Basecamp）と契約し Basecamp を Ruby で構築
- その過程で抽出されたフレームワークコードが Rails
- 強い自己主張・物議を醸す発言（"TDD is dead"、"Ruby は Lisp の方言"、"sharded vs monolith" 論争）で常に話題の中心
- **「opinionated software」**（強い意見を持ったソフトウェア）を Rails の設計理念として明文化した最初の主要 OSS 作者

### 37signals（現 Basecamp）

- Jason Fried がデザイン会社として 1999 年創業
- DHH 加入後、自社プロダクト Basecamp（プロジェクト管理 SaaS）を Ruby で開発
- **「少人数・自己資金・ノー上場」** を貫いた経営スタイルそのものが、Rails の設計思想の鏡
- 著書『Getting Real』『Rework』『Remote』が Rails 文化の伝播媒体になった
- Rails は「彼らがやりたかった働き方を可能にするための道具」という側面が強い

### The Pragmatic Programmers（Pragmatic Bookshelf）

- Dave Thomas / Andy Hunt（『達人プログラマー』著者）が立ち上げた出版社
- **Programming Ruby**（"Pickaxe" 本、初版 2001）で英語圏に Ruby を紹介
- **Agile Web Development with Rails**（2005、DHH 共著）で Rails のチュートリアル本のデファクトを確立
- 著者名と書籍ラインナップが Rails 文化の権威付けに直接寄与した

### Apple

- 2007 年の **Mac OS X 10.5 Leopard** に Ruby と Rails がプリインストールされた。これは Rails にとって権威付けとして大きく、また Mac が開発者の主流マシンになった時期と重なって普及を加速した

## 何を変えたか（影響）

Rails が変えたのは Ruby の世界だけではない。

- **後続フレームワーク**：Django（Python、Rails と並走で 2005 年公開）、CakePHP（2005）、Symfony（2005）、Grails（Groovy、2006）、Laravel（PHP、2011）、Phoenix（Elixir、2014）が、いずれも CoC・MVC・scaffold・ORM の一体化という Rails 的パターンを継承
- **Spring Boot**（Java、2014）の存在自体が、Java 陣営からの「Rails 的な軽量さがほしい」回答
- **REST が事実上の標準に**：Roy Fielding の博士論文（2000）で提唱された REST が現場の常識になったのは、Rails 1.2（2007）が `resources :posts` をデフォルトに据えたあたりが大きな分水嶺
- **DB マイグレーションの標準化**：Rails 以前、スキーマ変更を SQL ファイルで運用するのが普通だった
- **「monolith」の再評価**：マイクロサービス全盛期の 2017 年以降、DHH が「The Majestic Monolith」を主張し続けたことで、Basecamp / Shopify / GitHub の規模で「単一の Rails アプリ」が成立することが反証となり、設計潮流に影響

## テーゼの再確認

> 「Rails が Rails たりえたのは、機能性というよりあの時代にいけてる言語で基準を大きく超えて利便性を提供できたから」

この命題は概ね支持できる。ただし精度を上げるなら：

- 「いけてる言語」= Ruby は **2004 年時点で既に文化的に温まっていた**（Matz・Pickaxe・_why の蓄積があった）。Rails が Ruby を発見したのではなく、Ruby が Rails を待っていた
- 「基準を大きく超える利便性」= 個々の機能ではなく **「規約・スキャフォルド・ORM・ルーティング・テストが一つの一貫した世界観で同梱されている」** という体験全体
- 「あの時代」= Web 2.0 / Ajax / YC / 少人数スタートアップ / Mac の開発者標準化 が同時進行していた **2004–2007 年の 4 年間** を指す。これより前でも後でもほぼ同じ Rails は刺さらなかった

つまり Rails の成功は **言語選択 × 思想設計 × 時代潮流の三項の積** であって、どれか一つで説明できるものではない。

## 押さえどころ（カード化候補）

- Rails の最初の公開年と作者 → **2004 年 7 月、David Heinemeier Hansson が Basecamp のコードから抽出して公開**
- Rails の核となる二原則 → **CoC（[[convention-over-configuration]]）と DRY（Don't Repeat Yourself）**
- Rails 普及の最大の触媒となったコンテンツ → **2005 年の「15 分でブログを作る」スクリーンキャスト**
- 同梱されていた Ajax ライブラリ（Rails 1.x） → **Prototype.js + script.aculo.us**
- Rails が決定的な追い風を受けた時代潮流 4 つ → **Web 2.0、Ajax、Y Combinator 型スタートアップ、Mac の開発者標準化**
- Apple が Rails に与えた権威付け → **Mac OS X 10.5 Leopard（2007）に Ruby と Rails をプリインストール**
- Rails テーゼ → **機能ではなく「Ruby × CoC × 時代」の三項の積で勝った。同水準の機能は他言語にもあったが、一貫した世界観で同梱したのは Rails が最初**
- Rails が後続に残したパターン → **CoC・MVC・scaffold・ORM の一体化、REST の標準化、DB マイグレーションの版管理**

## Links

- [Rails 公式](https://rubyonrails.org/)
- [Creating a weblog in 15 minutes（DHH スクリーンキャスト）](https://www.youtube.com/watch?v=Gzj723LkRJY)
- [The Rails Doctrine（DHH 自身による Rails の思想宣言）](https://rubyonrails.org/doctrine)
- [Getting Real（37signals）](https://basecamp.com/gettingreal)
- [Agile Web Development with Rails（Pragmatic Bookshelf）](https://pragprog.com/categories/rails/)
- [Web 2.0 — Tim O'Reilly (2005)](https://www.oreilly.com/pub/a/web2/archive/what-is-web-20.html)
- [Ajax: A New Approach to Web Applications — Jesse James Garrett (2005)](https://web.archive.org/web/20080702075113/http://www.adaptivepath.com/ideas/essays/archives/000385.php)
