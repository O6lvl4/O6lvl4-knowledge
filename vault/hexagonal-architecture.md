---
title: ヘキサゴナルアーキテクチャ
tags: [concept, architecture, design, ports-adapters]
---

中心の業務ロジックを、外側の枝葉（DB・UI・API）から守るための六角形の構造設計。

## 何ができる？／なぜ重要？

人間の体を思い浮かべてください。心臓は外気に直接さらされていません。血管・肺・皮膚という何層もの仕組みが間に入って、必要な酸素や栄養だけが心臓に届くようになっています。もし心臓が外気に直接触れていたら、ちょっとした変化で止まってしまいます。ヘキサゴナルアーキテクチャは、この「中心を外気から守る血管系」をソフトウェアでやる設計です。

ソフトウェアの「心臓」は業務ロジック（ドメイン）です。一方、外側にはデータベース、Web UI、外部 API、メールサービスといった「外気」があります。これらは流行や事情で頻繁に変わります。SQL データベースから NoSQL に移ったり、Web UI からモバイルアプリに広がったり。中心と外気を直接つなぐと、外が変わるたびに心臓に手術が必要になります。そこで「ポート」という穴と「アダプタ」という栓で、中心と外を緩やかに切り離します。これにより、外側を別物に差し替えても中心は無傷で済みます。テストも「外を全部ニセ物に差し替えれば中心だけテストできる」という形になります。

## 仕組み

```mermaid
flowchart TB
    UI[Web UI] -->|アダプタ| ポートIn[入力ポート]
    CLI[CLI] -->|アダプタ| ポートIn
    ポートIn --> ドメイン[ドメイン / 業務ロジック]
    ドメイン --> ポートOut[出力ポート]
    ポートOut -->|アダプタ| DB[(DB)]
    ポートOut -->|アダプタ| API[外部 API]
    ポートOut -->|アダプタ| Mail[メール]
```

中心の六角形がドメイン、その辺一つ一つがポート、ポートの先に各種アダプタが付きます。アダプタを差し替えれば、UI を変えても DB を替えても、中心はまったく書き換えずに済みます。

## 用語

- **ヘキサゴナル**: 「六角形の」。各辺がポートを意味する図示の比喩。
- **ポート**: 中心が外と話すための「決められた穴（インターフェース）」。
- **アダプタ**: ポートに差し込む具体的実装（DB ドライバ、HTTP ハンドラ等）。
- **Ports and Adapters**: ヘキサゴナルの別名。
- **ドメイン層**: 業務ロジックの本体。外に依存しない。
- **アプリケーション層**: ドメインを呼び出して使い方を組み立てる層。
- **インフラ層**: アダプタの集まる外側の層。
- **依存性逆転**: 外側が中心の決めたインターフェースに従う原則。

## vault 内での使われ方

- [[environment-health-viewer]] — README で "Hexagonal / Ports & Adapters" を明記し `domain/` 配下に純粋ドメイン層を置く
- [[gulp-coach]] — README で「`environment-health-viewer` と同じ Hexagonal 構成」と明記、`dependency-cruiser` で層境界を CI 強制
- [[macleap]] — `domain` (pure) ← `application` (use cases + ports) ← `infrastructure` (adapters) の Hexagonal レイヤを README に明示

## 関連概念

- [[ddd]] — ドメインを中心に据えるという思想の双子
- [[dependency-injection]] — ポートに具体実装を差し込むための手段

## Links

- [Wikipedia: Hexagonal architecture](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software))
- [Alistair Cockburn - Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
