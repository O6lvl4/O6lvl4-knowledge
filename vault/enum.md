---
title: 列挙型 (Enum)
tags: [type-theory, programming-language, computer-science]
created_at: 2026-05-20
updated_at: 2026-05-20
---

値が有限個のバリアントのいずれかであることを表す型。言語ごとに表現力が大きく異なり、単なる名前付き整数定数から、データ付きバリアント（= tagged union = [[adt-gadt|直和型]]）まで連続的なスペクトラムを持つ。

## 進化のスペクトラム

```
C enum              → 名前付き整数定数。型安全性なし
    ↓
Java enum           → クラスベース。フィールド・メソッド付き
    ↓
Swift enum          → Associated Value（データ付きバリアント）
    ↓
Rust enum           → データ付きバリアント + パターンマッチ + ジェネリクス = 完全な tagged union
Haskell data        → 同上（ADT の直和部分）
Almide type ... |   → 同上
```

## 言語別比較

### C enum — 名前付き整数

```c
enum Color { RED, GREEN, BLUE };  // RED=0, GREEN=1, BLUE=2

enum Color c = RED;
c = 42;  // コンパイル通る。型安全性なし
```

- 実体はただの `int`。任意の整数値を代入できる
- バリアントにデータを持たせられない
- switch での網羅性チェックなし（警告は出る場合あり）

### C++ enum class — スコープ付き整数

```cpp
enum class Color { Red, Green, Blue };

Color c = Color::Red;
// c = 42;  // コンパイルエラー（型安全）
// int n = c;  // 暗黙変換も禁止
```

- C enum の型安全性を改善。暗黙の整数変換を禁止
- ただしバリアントにデータは持てない

### Java enum — クラスベース

```java
enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);

    private final double mass;
    private final double radius;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }

    double surfaceGravity() {
        return 6.67300E-11 * mass / (radius * radius);
    }
}
```

- 各バリアントがクラスのインスタンス。フィールドとメソッドを持てる
- バリアントごとに**異なる型のデータ**を持つことはできない
- シリアライズ可能、switch で使える

### TypeScript enum — コンパイル時定数

```typescript
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

// const enum なら完全にインライン化（ランタイムコストゼロ）
const enum Status { Active, Inactive }
```

- 文字列 enum と数値 enum がある
- `const enum` はコンパイル時にインライン化される
- ただし TypeScript では discriminated union（後述）のほうが好まれる傾向

### Python Enum — クラスベース

```python
from enum import Enum, auto

class Color(Enum):
    RED = auto()
    GREEN = auto()
    BLUE = auto()

# イテレーション可能
for c in Color:
    print(c)
```

- `Enum` クラスを継承。イテレーション・比較・シリアライズ可能
- バリアントにデータは持てない（持たせたければ `NamedTuple` 等と組み合わせる）

### Rust enum — 完全な tagged union

```rust
enum Shape {
    Circle(f64),                      // タプルバリアント
    Rect { width: f64, height: f64 }, // 構造体バリアント
    Point,                            // ユニットバリアント
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rect { width, height } => width * height,
        Shape::Point => 0.0,
    }
}
```

- バリアントごとに**異なる型・異なる個数のデータ**を持てる
- `match` でパターンマッチ。網羅性チェックあり（全バリアントを処理しないとコンパイルエラー）
- ジェネリクス対応: `Option<T>`, `Result<T, E>`
- メモリレイアウト: タグ（判別子）+ 最大バリアントのサイズ

### Haskell data — ADT の直和

```haskell
data Shape
    = Circle Double
    | Rect Double Double
    | Point

area :: Shape -> Double
area (Circle r)   = pi * r * r
area (Rect w h)   = w * h
area Point        = 0
```

- Rust enum と同等の表現力。ADT の教科書的な形
- パターンマッチが言語の中核

### Almide type — One Canonical Form

```almd
type Shape =
  | Circle(Float)
  | Rect{ w: Float, h: Float }
  | Point

fn area(s: Shape) -> Float =
  match s {
    Circle(r) => 3.14159 * r * r
    Rect{ w, h } => w * h
    Point => 0.0
  }
```

- Rust / Haskell と同等の tagged union
- LLM が生成しやすい構文設計（One Canonical Form: 書き方が 1 通り）

### Swift enum — Associated Value

```swift
enum Barcode {
    case upc(Int, Int, Int, Int)
    case qrCode(String)
}

let code = Barcode.qrCode("ABCDEF")
switch code {
    case .upc(let ns, let m, let p, let c):
        print("UPC: \(ns)-\(m)-\(p)-\(c)")
    case .qrCode(let value):
        print("QR: \(value)")
}
```

- Rust enum と同等。Associated Value でバリアントごとにデータを持つ
- プロトコル（インターフェース）の実装も可能

## 表現力の比較表

| 言語 | データ付き | バリアント別データ型 | パターンマッチ | 網羅性チェック | ジェネリクス |
|---|---|---|---|---|---|
| C enum | x | x | x | 警告のみ | x |
| C++ enum class | x | x | x | 警告のみ | x |
| Java enum | 共通フィールドのみ | x | switch | 非網羅でも可 | x |
| Python Enum | x | x | match (3.10+) | x | x |
| TypeScript enum | x | x | switch | x | x |
| **Swift enum** | o | o | switch | o | o |
| **Rust enum** | o | o | match | o | o |
| **Haskell data** | o | o | パターンマッチ | o | o |
| **Almide type** | o | o | match | o | o |

下段の 4 言語は **tagged union（= 直和型）** として完全な表現力を持つ。上段は本質的に名前付き定数。

## 標準ライブラリにおける活用

Rust / Haskell / Almide で enum（直和型）は言語の中核的パターンとして多用される：

| 型 | 役割 | 言語 |
|---|---|---|
| `Option<T>` / `Maybe a` / `Option[T]` | 値の有無（null の型安全な代替） | Rust / Haskell / Almide |
| `Result<T, E>` / `Either a b` / `Result[T, E]` | 成功/失敗（例外の型安全な代替） | Rust / Haskell / Almide |
| `Ordering` | 比較結果（Less / Equal / Greater） | Rust / Haskell / Almide |
| `Cow<'a, T>` | 借用 or 所有の遅延決定 | Rust |

これらはすべて enum（直和型）で定義されている。

## C enum との断絶

C enum と Rust/Haskell/Almide の enum は**名前が同じだけの別概念**と考えたほうが正確：

- C enum: **名前付き整数定数**。型安全性なし。データなし
- Rust enum: **tagged union（直和型）**。型安全。バリアントごとに異なるデータ。パターンマッチ

多くの言語はこの 2 つの中間のどこかに位置する。

## 押さえどころ（カード化候補）

- 列挙型のスペクトラム → **C enum（名前付き整数）→ Java enum（クラスベース）→ Rust/Haskell/Almide enum（データ付きバリアント = tagged union = 直和型）。名前は同じだが別概念に近い**
- C enum と Rust enum の本質的な違い → **C: 名前付き整数定数、型安全性なし。Rust: tagged union（直和型）、バリアントごとに異なる型のデータ、パターンマッチ、網羅性チェック**
- tagged union として完全な表現力を持つ言語 → **Rust, Haskell, Almide, Swift。バリアント別データ型 + パターンマッチ + 網羅性チェック + ジェネリクス**
- enum が言語中核パターンとなる例 → **Option（null 代替）、Result（例外代替）、Ordering（比較結果）。すべて enum（直和型）で定義**
- TypeScript での enum の立ち位置 → **enum キーワードは存在するがデータなし。実質は discriminated union（タグ付きオブジェクトの union 型）のほうが好まれる**
- Almide の enum 構文の設計 → **type Name = | Variant1 | Variant2。Rust/Haskell と同等の tagged union。One Canonical Form（書き方が1通り）で LLM 生成に最適化**

## 関連

- [[union-type]] — 共用型（C union / TypeScript union / tagged union の関係）
- [[adt-gadt]] — ADT / GADT（直和型 + 直積型の理論的基盤）
- [[rust|Rust]] — Rust enum は tagged union の代表的実装
- [[almide|Almide]] — `type ... | ...` 構文
- [[duality|双対]] — 直積型と直和型は双対
