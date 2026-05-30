---
title: Convention over Configuration
tags: [design-principle, framework, philosophy]
created_at: 2026-05-07
updated_at: 2026-05-07
---

「**設定よりも規約**」と訳される設計原則。**「妥当な既定値を規約として埋め込み、開発者は規約から外れたい場所だけを記述する」** という考え方。[[rails]] が原則として明文化し、その後の Web フレームワーク全般に広がった。

## 何を解決するための原則か

2000 年代前半、エンタープライズ Java（J2EE / Struts / Hibernate）では「設定の地獄」が常態化していた。

- クラスを書く → XML でクラスをコンポーネント登録
- DB のテーブルを使う → XML で ORM マッピング定義
- URL を作る → XML でルーティング定義
- 結果、**「Hello World」レベルのアプリでも 5–10 個の XML ファイル** が必要

この状況の根底にあった前提は「**フレームワークは何も仮定してはならない、すべて開発者が明示的に書くべき**」というもの。柔軟性は最大化されるが、立ち上げコストと精神的負荷も最大化される。

CoC は **「99% のケースで成立する妥当な仮定を規約として固定し、その規約を開発者と共有する」** ことでこの前提を反転させた。

## [[rails]] における具体例

Rails は CoC を体系的に適用した最初の主要フレームワーク。

| 規約 | 設定なしで動く理由 |
|---|---|
| クラス `Post` ⇄ テーブル `posts` | 名前から英単語の単数化／複数化で対応付ける |
| クラス `Post` ⇄ ファイル `app/models/post.rb` | snake_case 化したファイル名で自動 require |
| `PostsController#show` ⇄ `app/views/posts/show.html.erb` | コントローラ名・アクション名でテンプレートパスを推論 |
| 主キー `id`、タイムスタンプ `created_at` / `updated_at` | カラム名を予約 |
| `has_many :comments` | `comments` テーブル + `post_id` 外部キーを推論 |
| `resources :posts` | REST 7 アクションのルートを自動展開 |

これらはすべて「規約に従えば設定不要、外したい場合だけ書く」構造になっている。例えば日本語複数形の不規則な単語が必要なら `Inflector.inflections` で個別追加する、という具合。

**「規約に従う限りコードは消える」** — これが Rails の生産性の正体であり、CoC の実装的本質。

## CoC が成立するための前提

CoC は無条件に良いわけではない。次の前提が崩れると逆効果になる。

- **規約が広範囲のケースを実際にカバーしている** — 適用率が低い規約は「規約 + 例外」の二重管理になり、純粋な明示的設定より悪い
- **規約が一貫している** — 命名規則が部分ごとにバラつくと「どの規約が今ここに適用されるか」を覚えるコストが設定を書くより高くなる
- **逸脱手段が用意されている** — 規約から外れたい時の API（Rails で言う `self.table_name = "..."` 等）が常に提供されている必要がある
- **規約が文書化されている** — 暗黙の規約は新規参入者にとって「魔法」「ブラックボックス」になり、批判の的になる（実際に Rails への代表的な批判の一つ）

## CoC 後の波及

Rails 以後、CoC は Web フレームワーク設計の事実上の前提になった。

- **Django**（Python、2005）— Rails と並走で同じ思想を Python に持ち込んだ。"Don't Repeat Yourself" を強く打ち出した
- **Grails**（Groovy、2006）— 名前自体が "Groovy on Rails" の含意。CoC を Java エコシステムに移植する試み
- **CakePHP / Symfony / Laravel**（PHP）— 全て Rails の規約パターンを継承
- **Phoenix**（Elixir、2014）— Rails 出身者が多く、CoC を継承しつつイミュータブルな関数型ランタイムに適用
- **Spring Boot**（Java、2014）— 重量級だった Spring が **「auto-configuration」** という名で CoC を取り込んだ。XML 地獄に対する Java 陣営からの最終回答
- **Next.js / Nuxt / SvelteKit**（フロントエンド）— ファイルシステムベースルーティングは「ファイル配置 = 規約」の一形態として CoC の精神を継承

つまり CoC は **2004 年から 10 年で「フレームワークがそうあるべき」という業界の常識** に昇格した。Rails が達成した最大のメタな成果はここにある。

## 限界と批判

- **「魔法」批判** — 規約による自動化が暗黙すぎて、デバッグ時に「なぜ動いているか」が追えない問題。Rails の `method_missing` 連鎖や ActiveSupport の monkey-patch が代表例
- **規約からの逸脱コストが急上昇** — 既定値で 99% カバーされる代わりに、外れた 1% が劇的に難しくなる「クリフ」問題
- **静的型との相性** — メタプログラミング多用で型推論が困難になり、Sorbet / RBS のような後付け型システムを必要とする
- **規模化での詰まり** — 規約は単一プロジェクトでは効くが、大規模モノリスや複数チームでは「みんなが知っているはずの規約」が機能しなくなる場面がある

## 押さえどころ（カード化候補）

- CoC の一文要約 → **妥当な既定値を規約として埋め込み、開発者は規約から外れたい場所だけを書く設計原則**
- CoC が解決した時代問題 → **2000 年代前半のエンタープライズ Java における XML 設定地獄**
- Rails における CoC の代表例 3 つ → **テーブル名の単複変換、ファイルパスの命名規則、`resources` による REST ルート展開**
- CoC が成立するための前提 → **規約が広範囲をカバー、一貫している、逸脱手段がある、文書化されている**
- CoC を Java 陣営に取り戻した存在 → **Spring Boot（2014）の auto-configuration**
- CoC への代表的批判 → **「魔法」になりすぎてデバッグ困難、規約からの逸脱コストが急上昇、静的型との相性が悪い**

## Links

- [The Rails Doctrine — Convention over Configuration](https://rubyonrails.org/doctrine#convention-over-configuration)
- [Spring Boot Auto-configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.auto-configuration)

## 関連

- [[simple-vs-easy]] — 規約で「easy さ」を担保する CoC と、Hickey の simple 優先は対照的なアプローチ
- [[accidental-complexity]] — 設定という偶有的複雑性を規約で消すのが CoC
