---
title: 共用型 / Union 型
tags: [type-theory, programming-language, computer-science]
created_at: 2026-05-20
updated_at: 2026-05-20
srs_state: new
card_count: 6
reviewed_count: 0
next_due: 2026-05-20
---

「複数の型のいずれかである」ことを表す型。実装形態によって安全性と表現力が大きく異なる。

## 3 つの実装形態

```
C union（untagged）     → 同一メモリを複数の型で解釈。タグなし。unsafe
    ↓ 安全化
Tagged union           → タグ（判別子）で現在の型を識別。パターンマッチで安全にアクセス
    ↓ 構造的
TypeScript union       → 構造的部分型。ランタイムタグ不要。型の合成
```

## Untagged Union（C union）

```c
union Value {
    int i;
    float f;
    char *s;
};

union Value v;
v.i = 42;
printf("%f\n", v.f);  // 未定義動作！int として書いたメモリを float として読む
```

- **同一メモリ領域**を複数の型で共有する。サイズは最大メンバのサイズ
- どのメンバが有効かの情報（タグ）を持たない
- 不正なメンバアクセスは**未定義動作**。コンパイラは検出しない
- 用途: メモリ節約、低レベルデータ変換、ハードウェアレジスタのビットフィールドアクセス

### C の tagged union パターン（手動）

```c
typedef enum { INT, FLOAT, STRING } ValueTag;

typedef struct {
    ValueTag tag;
    union {
        int i;
        float f;
        char *s;
    } data;
} TaggedValue;

void print_value(TaggedValue v) {
    switch (v.tag) {
        case INT:    printf("%d\n", v.data.i); break;
        case FLOAT:  printf("%f\n", v.data.f); break;
        case STRING: printf("%s\n", v.data.s); break;
    }
}
```

C では tagged union を struct + enum + union で**手動で**構成する。タグとデータの整合性はプログラマの責任。Rust enum はこのパターンをコンパイラが保証する形で言語に組み込んだもの。

## Tagged Union（Rust enum / Haskell data / Almide type）

```rust
enum Value {
    Int(i64),
    Float(f64),
    Str(String),
}

fn print_value(v: &Value) {
    match v {
        Value::Int(i)   => println!("{}", i),
        Value::Float(f) => println!("{}", f),
        Value::Str(s)   => println!("{}", s),
    }
}
```

- タグ（判別子）がコンパイラによって自動管理される
- `match` でパターンマッチ。**網羅性チェック**あり（バリアントの漏れがコンパイルエラー）
- 不正なメンバアクセスは**コンパイル時に排除**
- メモリレイアウト: タグ（通常 1〜8 バイト）+ 最大バリアントのサイズ

→ 詳細は [[enum|列挙型]] を参照

## TypeScript Union（構造的 Union）

```typescript
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "rect"; width: number; height: number }
    | { kind: "point" };

function area(s: Shape): number {
    switch (s.kind) {
        case "circle":  return Math.PI * s.radius ** 2;
        case "rect":    return s.width * s.height;
        case "point":   return 0;
    }
}

// プリミティブの union も可能
type StringOrNumber = string | number;
```

- **構造的部分型**に基づく。ランタイムにタグを持つ必要がない
- `kind` プロパティ等の **discriminant（判別プロパティ）** で絞り込む（discriminated union）
- プリミティブ型の union も可能（`string | number`）。tagged union 言語にはない柔軟性
- 網羅性チェックは `never` 型 + exhaustive check で実現

### TypeScript Union の特異性

TypeScript の union は他の言語の union とは本質的に異なる：

```typescript
// 1. 型の合成: 任意の型を | で合成できる
type Result = Success | Failure | Loading;

// 2. 型の絞り込み (narrowing): 制御フローで型が自動的に絞られる
function process(x: string | number) {
    if (typeof x === "string") {
        x.toUpperCase();  // ここでは x: string
    } else {
        x.toFixed(2);     // ここでは x: number
    }
}

// 3. ユーティリティ型との組み合わせ
type NonNullable<T> = T extends null | undefined ? never : T;
```

- Rust/Haskell の tagged union は**宣言時に全バリアントを定義**する（閉じた型）
- TypeScript の union は**任意の型を後から合成**できる（開いた型）
- この柔軟性は JavaScript のダックタイピングとの互換性から来ている

## 3 形態の比較

| | C union | Tagged union (Rust等) | TS union |
|---|---|---|---|
| タグ | なし | コンパイラ管理 | 構造的判別 |
| メモリ | 最大メンバのサイズ | タグ + 最大バリアントのサイズ | JS オブジェクト |
| 安全性 | unsafe（未定義動作） | safe（コンパイル時保証） | safe（型チェッカー保証） |
| 網羅性チェック | なし | match で強制 | never 型で可能 |
| バリアント別データ | 不可（全メンバ同一メモリ） | 可（バリアントごとに異なる型） | 可（構造的に異なるオブジェクト） |
| 型の開閉 | — | 閉じた型（宣言時に確定） | 開いた型（後から合成可能） |
| 主な用途 | メモリ節約、低レベル操作 | ドメインモデル、エラー処理 | API 型定義、柔軟なモデリング |

## メモリレイアウト

```
C union Value { int i; float f; char *s; }
┌─────────────────────┐
│  i / f / s (共有)    │  ← 最大メンバのサイズ（ここでは 8 バイト: char*）
└─────────────────────┘

Rust enum Value { Int(i64), Float(f64), Str(String) }
┌──────┬──────────────────────────┐
│ tag  │  Int / Float / Str       │  ← タグ + 最大バリアントのサイズ
│ (1B) │  (24B: String が最大)     │
└──────┴──────────────────────────┘
```

Rust は niche optimization により、`Option<&T>` のような場合にタグのオーバーヘッドをゼロにする（null ポインタをタグとして再利用）。

## 他の言語での Union

| 言語 | キーワード / 構文 | 分類 |
|---|---|---|
| C | `union` | Untagged |
| C++ | `union` / `std::variant` | Untagged / Tagged |
| Rust | `enum` | Tagged |
| Haskell | `data` | Tagged |
| Almide | `type ... \| ...` | Tagged |
| Swift | `enum` (Associated Value) | Tagged |
| TypeScript | `A \| B` | 構造的 |
| Python | `Union[A, B]` / `A \| B` (3.10+) | 型ヒント（ランタイムは動的） |
| Scala | `sealed trait` + `case class` | Tagged |
| OCaml | `type t = A \| B of int` | Tagged |
| Zig | `union(enum)` | Tagged（明示的にタグ付き union を宣言） |
| Go | なし（interface で模倣） | — |

## 押さえどころ（カード化候補）

- Union の 3 形態 → **Untagged（C union: 同一メモリ、unsafe）、Tagged（Rust enum: タグ自動管理、safe）、構造的（TS union: 構造的判別、開いた型）**
- C union が unsafe な理由 → **どのメンバが有効かの情報（タグ）を持たない。不正なメンバアクセスが未定義動作**
- Tagged union の本質 → **C の struct + enum + union パターンをコンパイラが保証する形で言語に組み込んだもの。タグの整合性がコンパイル時に保証される**
- TypeScript union の特異性 → **任意の型を後から合成できる（開いた型）。Rust/Haskell の tagged union は宣言時に全バリアントを定義（閉じた型）**
- Rust の niche optimization → **Option<&T> でタグのメモリオーバーヘッドがゼロ。null ポインタをタグとして再利用**
- Go に Union がない理由 → **interface で模倣する設計。型の直和を直接表現する手段がなく、ランタイムの型アサーションに依存**

## 関連

- [[enum|列挙型]] — 列挙型の進化（C enum → tagged union）
- [[adt-gadt]] — ADT / GADT（直和型 + 直積型の理論的基盤）
- [[rust|Rust]] — `enum` が tagged union の代表的実装
- [[almide|Almide]] — `type ... | ...` 構文
- [[duality|双対]] — 直積型と直和型は双対
