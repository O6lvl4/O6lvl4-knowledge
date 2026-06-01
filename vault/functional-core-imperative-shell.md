---
title: Functional Core, Imperative Shell
tags: [design-principle, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-31T09:47:03+09:00
---

アプリを**純粋な決定ロジック**（functional core）と、副作用を担う**薄い殻**（imperative shell）に分ける設計。Gary Bernhardt 提唱。コアは入力→出力の純関数、殻が IO・DB・ネットワークを集約してコアを呼ぶ。

## 構造

| | Functional Core | Imperative Shell |
|---|---|---|
| 中身 | ドメインの**決定（decide）** | IO の**実行（perform）** |
| 純粋性 | 純粋（[[pure-functional-programming\|参照透過]]） | 副作用を持つ |
| テスト | 値 in → 値 out で**単体テスト容易**（モック不要） | 薄く保ち統合テストだけ |
| 量 | ロジックの大半 | できるだけ薄く |

殻が外界から値を集め → コアが次にすべきことを**値として**返し → 殻がそれを実行する、という往復。

## 殻 ↔ コアの往復（擬似コード）

肝は **コアが「次にすべき副作用」を実行せず、データとして返す**こと。判断（decide）と実行（perform）を物理的に分ける:

```python
# ---- functional core: 純粋。IO を一切しない ----
def decide(order, current_stock):
    """入力(値) -> 出力(値)。同じ入力なら必ず同じ出力。"""
    if order.qty > current_stock:
        return Reject(reason="out_of_stock")          # 副作用ではなく「指示」を値で返す
    new_stock = current_stock - order.qty
    return Accept(new_stock=new_stock,
                  email=Email(to=order.user, body="confirmed"))

# ---- imperative shell: 薄い。集める→コアを呼ぶ→返り値を実行する ----
def handle_order(order_id):
    order  = db.load_order(order_id)        # 1. 外界から値を集める（IO）
    stock  = db.load_stock(order.sku)       #    （ここまでは決定しない）

    result = decide(order, stock)           # 2. 純粋コアに判断を委ねる

    match result:                           # 3. 返ってきた「指示」を実行する（IO）
        case Accept(new_stock, email):
            db.save_stock(order.sku, new_stock)
            mailer.send(email)
        case Reject(reason):
            log.warn(reason)
```

`decide` には DB も SMTP も登場しない。分岐（在庫切れ / 受理）の全パターンは `decide` を値で叩くだけで網羅でき、`handle_order` は「集める・実行する」だけの直線的な配管に痩せる。

## テストの比率

設計が直接テスト戦略に効く。**ロジックの大半を占めるコアは速い単体テストで網羅し、薄い殻は少数の結合テストで配管だけ確認する**:

| | 対象 | テスト種別 | 量 | 速度 |
|---|---|---|---|---|
| Functional Core | 分岐・計算・ドメイン規則 | 単体（値 in → 値 out、モック不要） | 多い・網羅的 | 速い（ms 以下） |
| Imperative Shell | DB/IO/ネットワークの配線 | 結合（実 DB やコンテナ） | 少数・代表ケースのみ | 遅い |

テストピラミッドが自然に成立する: 多数の速い単体テストが土台、少数の遅い結合テストが頂点。「コアに押し込めたロジック量」がそのまま「モックなしで網羅できる範囲」になり、**モックだらけの脆いテスト**を避けられる。

## なぜ効くか

- **テスト容易性** — 分岐の網羅は純粋なコアを値で叩くだけ。副作用のモックが要らない
- **[[accidental-complexity|偶有的複雑性]]の削減** — 副作用と決定を混ぜないことで関心が分離する
- 関数型でない言語（TypeScript / Python）でも適用できる**移植可能な設計**

## 類縁

Hexagonal / Ports & Adapters、Elm Architecture、[[algebraic-effects|effect system]]（殻でハンドラが作用を解釈）。トレードオフは「本質的に IO に絡むロジックをどこまでコアに押し込めるか」の線引き。

## 押さえどころ（カード化候補）

- **decide / perform の分離** → コアは「次にすべき副作用」を実行せず**値（指示）として返す**。殻がそれを解釈して IO を行う。これが全ての肝
- **コアは純粋** → 同じ入力で同じ出力・副作用ゼロ。だからモックなしで値 in → 値 out の単体テストができる
- **殻は薄く** → 「集める → コアを呼ぶ → 返り値を実行する」だけの直線的配管。分岐ロジックを殻に漏らさない
- **テスト比率** → 多数の速い単体テスト（コア）＋ 少数の遅い結合テスト（殻）。テストピラミッドが自然に成立し、脆いモックを避けられる
- **線引きの難所** → 本質的に IO に絡む判断をどこまでコアに押し込むか。押し込めるほど単体テストで守れる範囲が広がる

## 関連

- [[pure-functional-programming|純粋関数型言語]] — コアの純粋性の土台
- [[accidental-complexity|偶有的複雑性]] — 副作用と決定の分離で複雑性を下げる
- [[algebraic-effects|Algebraic Effects]] — 殻で作用を解釈する別構造
