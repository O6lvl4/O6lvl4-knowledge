---
title: API (Application Programming Interface)
tags: [concept, api, integration, contract]
---

プログラム同士が会話するための「窓口」と「契約」。決まった手順でリクエストを送ると、決まった形でレスポンスが返ってくる。

## 何ができる？／なぜ重要？

コンビニの ATM を思い浮かべてください。中で銀行のシステムが何をしているかは知らなくても、画面の指示通りにカードを入れて金額を打てば、お金が出てきます。「裏側の仕組みは隠して、表の手順だけ決めておく」これが API の発想です。プログラムから見ると、API は「この URL にこの形のデータを送れば、この形の答えが返ってくる」という約束ごとです。

これが嬉しいのは、相手の中身を理解しなくても機能を借りられることです。地図サービスの API を使えば自分で地図を作らずに済み、決済 API を使えば自分で銀行と契約しなくて済みます。なければ、何をするにも一から作る必要があり、現代のソフトウェアは成り立ちません。

## 仕組み

```mermaid
sequenceDiagram
    participant ク as クライアント
    participant API as API サーバー
    participant DB as データベース

    ク->>API: リクエスト<br/>GET /users/123
    API->>DB: ユーザー 123 を検索
    DB-->>API: データを返す
    API-->>ク: レスポンス<br/>JSON で返却
```

クライアントは決まった形式でリクエストを送り、API サーバーが内部処理をして決まった形式のレスポンスを返します。中身の実装は隠されています。

## 用語

- **エンドポイント**: API の窓口の URL。例: `https://api.example.com/users`。
- **リクエスト / レスポンス**: 送る情報と返ってくる情報。
- **REST**: 代表的な API スタイル。HTTP メソッド（GET/POST 等）で操作を表す。
- **GraphQL**: 必要なデータだけを問い合わせて取得する API スタイル。
- **JSON**: API でよく使われるデータ形式。`{ "key": "value" }` の形。
- **認証 (Authentication)**: 誰がアクセスしているかを確認する仕組み。
- **APIキー / トークン**: 認証に使う「鍵」のような文字列。
- **レートリミット**: 一定時間あたりの呼び出し回数の上限。
- **SDK**: 特定の言語から API を使いやすくしたライブラリ。

## vault 内での使われ方

- [[unillm]] — Anthropic / OpenAI / Groq / Gemini など複数の LLM API を統一インターフェースで扱う
- [[llm-throttle]] — LLM API 向け RPM/TPM デュアルレート制限ライブラリ
- [[llm-queue-dispatcher]] — LLM API リクエストのスコアリング型キューイングシステム
- [[outline-api-client-ts]] — Outline 知識ベース API の TypeScript 型付きクライアント
- [[next-auth-providers]] — NextAuth.js 用 OAuth プロバイダ集（LINE 等）
- [[auth-providers-ts]] — フレームワーク非依存の OAuth 2.0 プロバイダライブラリ

## 関連概念

- [[cli]] — 人間向けのインターフェース。API はプログラム向け
- [[llm]] — LLM サービスは API として提供される
- [[token]] — API 利用は通常トークン量で課金

## Links

- [Wikipedia: API](https://ja.wikipedia.org/wiki/%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%9F%E3%83%B3%E3%82%B0%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%95%E3%82%A7%E3%83%BC%E3%82%B9)
