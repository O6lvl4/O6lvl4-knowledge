---
title: パラメトリシティ / 自由定理
tags: [type-theory, programming-paradigm]
created_at: 2026-05-30
updated_at: 2026-05-30T20:41:00+09:00
---

[[polymorphism|parametric 多相]]な関数は、型変数の中身に**関わらず一様に**振る舞う、という性質（Reynolds の abstraction theorem, 1983）。型シグネチャ**だけ**から成り立つ定理「**自由定理（free theorems）**」が導ける（Wadler "Theorems for Free!", 1989）。

## 直感

型変数に対して関数は何も操作できないので、取りうる実装が極端に縛られる。

- `forall a. a -> a` は **id しかありえない**
- `forall a. [a] -> [a]` は要素を**並べ替え・複製・間引きするだけ**。要素を発明も検査もできない
- このことから `map f . g = g . map f`（任意の `g :: forall a. [a]->[a]`）のような等式が**証明なしに**従う

## 根拠

型を**関係（logical relation）**で解釈し、「項は関係を保つ」ことを示す。型抽象が表現独立性（representation independence）＝**情報隠蔽の正当化**になる。

## 用途と破れ

- **用途**: 最適化の正当化（fusion 則）、API の振る舞い推論、抽象の安全性、[[equational-reasoning|等式推論]]の補強
- **破れ**: `seq`・例外・型による分岐（typecase）・`unsafe` があると一様性が崩れ、自由定理は成立しない

## 関連

- [[polymorphism|ポリモーフィズム]] — parametric 多相の性質がパラメトリシティ
- [[category-theory|圏論]] — 自然変換はパラメトリシティの圏論版
- [[equational-reasoning|等式推論]] — 自由定理は等式推論の強力な道具
- [[stream-fusion|Stream Fusion]] — fusion 則の正当化に使える
