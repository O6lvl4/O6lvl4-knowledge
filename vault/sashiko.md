---
title: Sashiko
tags: [ruby, observability, opentelemetry, library]
---

Ruby on top of OpenTelemetry のための concurrency-boundary observability。Thread / Fiber / queue / Ractor を超えてもトレースを縫い合わせる。

## Core Idea

OTel context は fiber-local。`Thread.new` / `Fiber.new` / `parallel_map` / `Ractor` を跨いだ瞬間に vanilla OTel Ruby はトレースを失い、spawn 先のスパンが **root span として孤立** する。Sashiko はこの「境界での切れ目」を縫合する。

```
Without Sashiko:                 With Sashiko:

[trace A]                        [trace A]
└─ POST /orders                  └─ POST /orders
                                    ├─ external_call
[trace B]  ← orphan 😢              ├─ external_call
└─ external_call                    └─ external_call
[trace C]  ← orphan 😢
└─ external_call
```

名は刺し子（小さい縫い目で布を補強する技法）から。SIG の `opentelemetry-instrumentation-*` の **補完** として使う想定。

## What it gives you

- **Boundary-aware Context helpers** — `Sashiko::Context.thread`, `.fiber`, `.parallel_map` が OTel Context を保持。`Sashiko::Context.carrier` は deep-frozen / Ractor-shareable な W3C Trace Context Hash で、Sidekiq job args、Kafka attribute、HTTP header、`Ractor.new` 引数のいずれにも乗せて運べる。受信側で `attach` で繋ぎ直す
- **Declarative span DSL** — `extend Sashiko::Traced; trace :method`。例外と error status を自動記録
- **Spans from inside a Ractor** — vanilla OTel は `Ractor::IsolationError`。Sashiko は Ractor 内では `SpanEvent` を frozen 値として記録、main Ractor 側で OTel span として **replay**（タイムスタンプと parent linkage 込みで）
- **Per-Box instrumentation** — Ruby 4 の `RUBY_BOX=1` で各 `Sashiko::Box` ごとに独立した OTel SDK
- **Tracer DI** — 全エントリ点に `tracer:` キーワード。Box / 別 backend / テスト用への迂回口
- **Typed** — RBS + Steep で CI 型検査

## Core API

### `Sashiko::Traced` — declarative spans

```ruby
class OrderService
  extend Sashiko::Traced

  trace :checkout, attributes: ->(order) { { "order.id" => order.id } }
  trace :charge
  trace :notify
  def checkout(order); charge(order); notify(order); end
end
```

実装は target class に anonymous module を `prepend` するだけ。`super` チェーンを保ったまま再 trace 可能。

### `Sashiko::Context` — Thread / Fiber 跨ぎ

```ruby
Sashiko::Context.thread { do_work }.join
Sashiko::Context.fiber  { do_work }.resume
results = Sashiko::Context.parallel_map(jobs) { |j| process(j) }
```

### `Sashiko::Context.carrier` — process / queue / Ractor 跨ぎ

```ruby
queue.push(payload: "...", trace_context: Sashiko::Context.carrier)

job = queue.pop
Sashiko::Context.attach(job[:trace_context]) { process(job) }
```

### `Sashiko::Ractor` — 真の並列 + span replay

各 Ractor で `SpanEvent` を frozen で記録 → `Ractor::Port` で main 側へ送る → `Sink` が `tracer.start_span(start_timestamp:)` / `span.finish(end_timestamp:)` で event を OTel span として再構築。`trace_id` / `span_id` は main 側で割り当てられる（Ractor 内では真の `SpanContext` を持たない）。

caveats:

- `OpenTelemetry::Baggage` の Ractor 越え伝播は **しない**（`carrier` に入れたものだけ）
- サンプリング判定は replay 時、main 側で実行
- `via:` は `Method` で receiver が Ractor-shareable（Module / frozen class）

### `Sashiko::Box` — 多テナント分離（Ruby 4 experimental）

```ruby
# RUBY_BOX=1 で実行
tenant_a = Sashiko::Box.new
tenant_a.eval(<<~RUBY)
  OpenTelemetry::SDK.configure { |c| c.service_name = "tenant-a" }
RUBY
```

Box 内では `tracer:` を **明示的に渡す** こと（global tracer は main の参照を握ったままになる既知挙動）。

## Adapters

- **Rails** — `Sashiko::Rails.async`、`TracedJob` mixin、`bridge_notifications(/regex/)`。SIG の Rails instrumentation を補完
- **Faraday** — middleware で client-kind span を発行（`http.request.method`, `url.full`, `server.address`, `http.response.status_code`, `error.type`）
- **Anthropic** — GenAI semantic-convention span。token 数 / cache hit ratio / 推定 USD コストを記録。コア外のリファレンス実装で、`sashiko-anthropic` への切り出し可能性あり

## Requirements

- Ruby 4.0+ — `Ractor::Port` と `Ruby::Box` を使う部位の floor
- `opentelemetry-api` `~> 1.4`
- `opentelemetry-sdk` `~> 1.5`

Class-load-time `Module#prepend` のみで instrument し、`method_added` / 動的 `define_method` は使わない（inline cache が温まる）。

## Links

- [GitHub](https://github.com/O6lvl4/sashiko)
- [API docs](https://o6lvl4.github.io/sashiko/)
