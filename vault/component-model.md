---
title: Component Model
tags: [webassembly, wasm, component-model, standard]
created_at: 2026-05-24
updated_at: 2026-05-24
srs_state: new
card_count: 14
reviewed_count: 0
next_due: 2026-05-24
---

WebAssembly モジュールを型安全に結合するための仕様。Core Module が数値型しか扱えない制約を、WIT (型安全な IDL) + Canonical ABI (標準バイナリ表現) + メモリ隔離 (Share-Nothing) で解決する。[[wasi|WASI]] はこの上に構築された API 群であり、Component Model はその基盤レイヤー。[[bytecode-alliance|Bytecode Alliance]] が [[wasmtime|Wasmtime]] でリファレンス実装を提供。

## なぜ必要か: Core Module の限界

| 問題 | Core Module | Component Model |
|---|---|---|
| 型システム | i32/i64/f32/f64 のみ | string, list, record, variant, resource 等 |
| データ交換 | 線形メモリ共有 + 手動エンコード | Canonical ABI で自動マーシャリング |
| メモリ | export して共有可能 | export 不可 (Share-Nothing) |
| 言語間結合 | 言語ごとに glue code | WIT を共通契約に自動バインディング生成 |

## WIT (WebAssembly Interface Types)

Component Model の IDL。パッケージ、インターフェース、ワールドでコンポーネントの契約を定義する。

### 基本構造

```wit
package my-company:my-api@1.0.0;

interface greeter {
    record person {
        name: string,
        age: u32,
    }
    greet: func(who: person) -> string;
}

world my-service {
    import wasi:http/types@0.2.0;
    export greeter;
}
```

- **package**: `namespace:name@version`。同一ディレクトリの全 `.wit` が1パッケージ
- **interface**: 型と関数の名前付きコレクション
- **world**: コンポーネントの契約。import (必要なもの) と export (提供するもの)

### 型システム

| 分類 | 型 |
|---|---|
| プリミティブ | `bool`, `u8`-`u64`, `s8`-`s64`, `f32`, `f64`, `char`, `string` |
| 複合 | `list<T>`, `option<T>`, `result<T, E>`, `tuple<T1, T2>` |
| ユーザー定義 | `record`, `variant`, `enum`, `flags` |
| ハンドル | `resource` (`own<T>`, `borrow<T>`) |

### resource

コンポーネント外部のエンティティへの偽造不可能なハンドル。WASI の capability モデルの基盤。

```wit
resource blob {
    constructor(init: list<u8>);
    write: func(bytes: list<u8>);      // メソッド (暗黙 self)
    read: func(n: u32) -> list<u8>;
    merge: static func(a: blob, b: blob) -> blob;  // static
}
```

- `own<T>`: 排他的所有権。所有コンポーネントがクリーンアップ責務
- `borrow<T>`: 一時的アクセス。関数返却後は参照保持不可

## Canonical ABI

WIT の高水準型と Core Wasm の低水準表現 (i32 等 + 線形メモリ) との変換規則。

- **lift**: 低水準 → 高水準 (Core Wasm 関数 → Component 関数)
- **lower**: 高水準 → 低水準 (Component 関数 → Core Wasm 関数)

### 主要な型の ABI レイアウト

| 型 | alignment | size | Core Wasm flat |
|---|---|---|---|
| `bool` | 1 | 1 | i32 |
| `u32` / `s32` | 4 | 4 | i32 |
| `u64` / `s64` | 8 | 8 | i64 |
| `string` | ptr_size | 2 × ptr_size | [ptr, len] |
| `list<T>` | ptr_size | 2 × ptr_size | [ptr, len] |
| `own<T>` / `borrow<T>` | 4 | 4 | i32 (ハンドルテーブルインデックス) |

flat 化の上限: パラメータ 16個、結果 1個。超過時は `cabi_realloc` で線形メモリに書き込みポインタのみ渡す。

### WASI 0.3 での拡張

| 追加型 | 説明 |
|---|---|
| `stream<T>` | ジェネリック非同期ストリーム (0.2 の u8 のみから進化) |
| `future<T>` | ジェネリック Future (0.2 では Resource パターンで模倣) |
| `error-context` | コンポーネント境界を跨ぐ構造化エラー |

WIT 関数に `async` キーワードを付与可能に。

## Share-Nothing Linking

コンポーネントはメモリを export できない。各コンポーネントインスタンスは独立した線形メモリを持ち、データ交換は Canonical ABI を通じた値のコピーのみ。

利点:
- GC 言語と線形メモリ言語の安全な相互運用
- 悪意あるコンポーネントによるメモリアクセス防止
- 推論が容易 (振る舞いはインターフェースのみで決まる)

## コンポーネントの合成

### WAC (WebAssembly Composition)

```bash
# plug: 主コンポーネントの未解決 import を依存の export で充足
wac plug calculator.wasm --plug adder.wasm -o composed.wasm

# WAC 言語による高度な合成
wac compose --dep docs:adder=adder.wasm -o final.wasm composition.wac
```

### wasm-tools

```bash
wasm-tools component wit component.wasm    # WIT を検査
wasm-tools component new guest.wasm -o component.wasm  # Core → Component
```

## コンポーネントの配布

OCI レジストリ (ghcr.io, DockerHub) で OCI Artifacts として配布:

```bash
wkg oci push ghcr.io/user/component:0.1.0 component.wasm
wkg oci pull ghcr.io/user/component:0.1.0
```

## ツールチェーン

| 言語 | ツール | 成熟度 |
|---|---|---|
| [[rust\|Rust]] | cargo-component, wit-bindgen | 最も成熟。First-class |
| JavaScript | jco 1.0, ComponentizeJS | 安定 |
| Python | componentize-py | 機能するが成熟途上 |
| C# | componentize-dotnet | プレビュー (Windows のみ) |
| Go | TinyGo + wit-bindgen-go | 標準 Go は未対応 |
| Java | なし | 公式ターゲットなし |

## Rust での実践

```rust
// wit/world.wit:
// package docs:adder@0.1.0;
// interface add { add: func(x: u32, y: u32) -> u32; }
// world adder { export add; }

mod bindings {
    wit_bindgen::generate!({
        path: "wit/world.wit",
    });
    use super::AdderComponent;
    export!(AdderComponent);
}

struct AdderComponent;

impl bindings::exports::docs::adder::add::Guest for AdderComponent {
    fn add(x: u32, y: u32) -> u32 {
        x + y
    }
}
```

```bash
cargo build --target=wasm32-wasip2 --release
# → ~16KB の Component
```

## ユースケース

| 分野 | 例 |
|---|---|
| プラグインシステム | Figma, Shopify Functions, Envoy Proxy, Zed Editor |
| [[edge-computing\|Edge Computing]] | Fastly Compute, Fermyon Spin (Akamai), Cloudflare Workers |
| 多言語ライブラリ共有 | Rust ロジックを JS/Python/Go/C# から WIT 経由で呼び出し |
| AI 推論 | Cloudflare が Llama-3-8b を 330拠点に展開 |

## 現在の状態と課題

| 項目 | 状態 |
|---|---|
| Wasmtime | 完全対応 (リファレンス実装) |
| ブラウザ | 未対応。jco トランスパイルが必要 |
| W3C 標準化 | 提案段階。WASI 1.0 後に正式フェーズ進行予定 |
| スレッド | 未対応 (WASI 0.3 ポイントリリースで追加予定) |

課題:
- Rust 以外のツールチェーンが二級市民
- 仕様の変動 (P1 → P2 → P3 RC が2年で推移)
- デバッグの困難さ (スタックトレース不透明)
- ブラウザ未対応

## 押さえどころ（カード化候補）

- Component Model の存在理由 → Core Module は i32/i64/f32/f64 しか扱えず、文字列や構造体の受け渡しに手動エンコードと共有メモリが必要。Component Model が WIT + Canonical ABI + メモリ隔離で解決
- Component Model と WASI の関係 → Component Model はコンポーネント合成の型システム (基盤レイヤー)。WASI はその上に構築されたシステム API 群。WASI は Component Model の「ユーザー」
- WIT の3つの概念 → package (namespace:name@version)、interface (型と関数のコレクション)、world (コンポーネントの契約: import + export)
- resource 型の意味 → コンポーネント外部エンティティへの偽造不可能なハンドル。own (排他的所有権) と borrow (一時的アクセス) の2種。WASI capability モデルの基盤
- Canonical ABI の lift と lower → lift: Core Wasm の i32 等を string/record に変換 (低→高)。lower: その逆 (高→低)。最適化で lift+lower を融合して直接コピー1回に削減可能
- Share-Nothing Linking → コンポーネントはメモリを export できない。独立した線形メモリ + Canonical ABI でのデータコピーのみ。GC 言語と線形メモリ言語の安全な相互運用を実現
- flat 化の上限 → パラメータ16個、結果1個。超過時は cabi_realloc で線形メモリに書き込みポインタのみ渡す。非同期の場合はパラメータ上限4個
- WASI 0.3 で追加される async 型 → stream<T> (ジェネリックストリーム)、future<T> (ジェネリック Future)、error-context。Canonical ABI レベルでネイティブ非同期
- WAC によるコンポーネント合成 → wac plug で主コンポーネントの未解決 import を依存の export で充足。インターフェースレベルの宣言的合成
- OCI レジストリでの配布 → wkg CLI で ghcr.io 等に push/pull。Docker コンテナと同じインフラでコンポーネントを配布。Warg → OCI に移行中
- ツールチェーン成熟度の格差 → Rust は first-class (cargo-component + wit-bindgen)。JS は jco 1.0 で安定。Go は TinyGo のみ。Java は公式ターゲットなし。Rust 以外は二級市民
- ブラウザ未対応の意味 → Component Model はブラウザでネイティブ動作しない。jco でトランスパイル (JS グルーコード + .wasm 生成) が必要。サーバーサイド/エッジが先行
- Component Model のユースケース → プラグインシステム (Figma, Shopify)、Edge Computing (Fastly, Spin)、多言語ライブラリ共有、AI 推論。「LEGO ブロック」のように言語を超えてコンポーネントを結合
- cargo-component vs wasm32-wasip2 → WASI インターフェースのみなら cargo build --target=wasm32-wasip2 で十分。カスタム WIT や多言語結合が必要なら cargo-component

## Links

- [Component Model Book](https://component-model.bytecodealliance.org/)
- [Component Model Spec (GitHub)](https://github.com/WebAssembly/component-model)
- [WIT Reference](https://component-model.bytecodealliance.org/design/wit.html)
- [Canonical ABI](https://component-model.bytecodealliance.org/advanced/canonical-abi.html)
- [cargo-component](https://github.com/bytecodealliance/cargo-component)
- [wit-bindgen](https://github.com/bytecodealliance/wit-bindgen)
- [jco](https://github.com/bytecodealliance/jco)

## 関連

- [[wasi]] — Component Model の上に構築されたシステム API 群
- [[wasmtime]] — Component Model のリファレンス実装
- [[bytecode-alliance]] — Component Model の実装を主導する組織
- [[wasm-at-the-edge]] — Edge での Component Model 活用 (Fastly, Fermyon Spin)
