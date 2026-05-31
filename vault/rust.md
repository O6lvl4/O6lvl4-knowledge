---
title: Rust
tags: [language, systems, programming]
created_at: 2026-05-20
updated_at: 2026-05-24
---

Mozilla Research が開発し 2015 年に 1.0 をリリースしたシステムプログラミング言語。**所有権（ownership）** と **借用（borrow）** の型システムにより、GC なしでメモリ安全性をコンパイル時に保証する。

## 核心: 所有権システム

Rust の最大の特徴は、メモリ安全性をランタイムコスト（GC）なしで実現すること。3 つのルールで成立する：

1. **各値にはただ 1 つの所有者（owner）がある**
2. **所有者がスコープを抜けると値は自動的に drop される**
3. **ある時点で、値への参照は「可変参照 1 つ」か「不変参照 複数」のどちらか一方のみ**

この 3 番目のルール（借用規則）が、data race をコンパイル時に排除する。

```rust
let mut v = vec![1, 2, 3];
let r = &v;        // 不変借用
// v.push(4);      // コンパイルエラー: 不変借用中に可変操作できない
println!("{:?}", r);
v.push(4);         // r のスコープが終わったので OK
```

## ライフタイム

参照が有効な期間をコンパイラに伝える仕組み。多くの場合は省略可能（ライフタイムエリジョン）だが、構造体に参照を持たせる場合などに明示が必要。

```rust
struct Parser<'a> {
    input: &'a str,  // Parser は input より長生きできない
}
```

ライフタイムは型の一部であり、「この参照はここまで有効」という契約をコンパイル時に検証する。

## 型システムの特徴

| 機能 | 説明 |
|---|---|
| **enum + パターンマッチ** | 代数的データ型（ADT）。`Option<T>` / `Result<T, E>` が言語の中核 |
| **トレイト** | Haskell の型クラスに近い。ポリモーフィズムの基盤 |
| **ジェネリクス + 単相化** | コンパイル時にジェネリクスを具体型に展開。ランタイムコストゼロ |
| **`!` (never 型)** | 返らない関数の戻り値型。`panic!` や無限ループ |
| **`impl Trait`** | 存在型の軽量構文。戻り値型の抽象化に使う |

## エラーハンドリング

例外を使わない。`Result<T, E>` と `?` 演算子でエラーを型として伝播する。

```rust
fn read_config(path: &str) -> Result<Config, Error> {
    let text = std::fs::read_to_string(path)?;  // エラーなら即 return
    let config = toml::from_str(&text)?;
    Ok(config)
}
```

`panic!` は回復不能エラー用。通常のエラーハンドリングには使わない。

## 非同期プログラミング

`async` / `await` 構文を言語が提供するが、ランタイム（executor）は言語に含まれず、ライブラリとして提供される。

```rust
async fn fetch(url: &str) -> Result<String, reqwest::Error> {
    let body = reqwest::get(url).await?.text().await?;
    Ok(body)
}
```

主要な非同期ランタイム：

| ランタイム | 特徴 |
|---|---|
| **tokio** | デファクトスタンダード。マルチスレッド work-stealing |
| **async-std** | std に似た API。tokio の対抗馬だったが勢い減少 |
| **smol** | 軽量。シンプルさ重視 |

## ゼロコスト抽象

Rust の設計原則。抽象化を使っても、手書きの低レベルコードと同等の性能が出ること。

- イテレータチェーン → コンパイラがループに融合
- ジェネリクス → 単相化でランタイムディスパッチなし
- `async` → ステートマシンにコンパイル（ヒープ割り当てなし）
- トレイトの静的ディスパッチ → 関数呼び出しがインライン化

## ツールチェイン

| ツール | 役割 |
|---|---|
| **rustup** | ツールチェイン管理（stable / nightly / ターゲット追加） |
| **cargo** | パッケージマネージャ + ビルドシステム。`Cargo.toml` で依存管理 |
| **rustc** | コンパイラ本体。LLVM バックエンド |
| **clippy** | lint ツール。イディオマティックでない書き方を指摘 |
| **rustfmt** | コードフォーマッタ |
| **rust-analyzer** | LSP サーバー。IDE 補完・型推論表示 |
| **miri** | undefined behavior を検出するインタプリタ |

## クレート（パッケージ）エコシステム

crates.io が中央リポジトリ。主要なクレート：

| 領域 | クレート |
|---|---|
| 非同期ランタイム | tokio, async-std |
| Web フレームワーク | [[axum]], actix-web, rocket |
| HTTP クライアント | reqwest, hyper |
| ハッシュテーブル | [[hashbrown]] (std HashMap のバックエンド) |
| データ並列 | [[rayon]] (work-stealing ベースの par_iter) |
| シリアライズ | serde (+ serde_json, toml, etc.) |
| CLI | clap, argh |
| エラーハンドリング | anyhow, thiserror |
| ORM / DB | sqlx, diesel, sea-orm |
| ロギング | tracing, log |
| WASM | wasm-bindgen, wasm-pack |

## Rust が選ばれる領域

| 領域 | 理由 | 例 |
|---|---|---|
| CLI ツール | 起動が速い、単一バイナリ配布 | ripgrep, fd, bat, delta |
| Web バックエンド | 高スループット、低レイテンシ | Cloudflare Workers, Discord |
| 組込み / OS | GC なし、メモリ制御 | Linux カーネルモジュール |
| WASM | コンパイルターゲットとして一級対応 | Figma, SWC |
| ゲームエンジン | 性能 + 安全性 | Bevy |
| 暗号通貨 / ブロックチェーン | 性能 + 正確性 | Solana, Polkadot |

## C / C++ との比較

| | C / C++ | Rust |
|---|---|---|
| メモリ安全性 | プログラマの責任 | コンパイラが保証 |
| data race | 検出困難 | コンパイル時に排除 |
| ビルドシステム | CMake / Make / 乱立 | cargo（統一） |
| パッケージ管理 | conan / vcpkg / 手動 | crates.io + cargo（統一） |
| 学習曲線 | 中（ただし安全に書くのは難） | 高（借用チェッカーの壁） |
| 性能 | 同等 | 同等（LLVM バックエンド共通） |

## 押さえどころ（カード化候補）

- Rust の所有権 3 ルール → **(1) 各値に所有者は 1 つ (2) 所有者がスコープを抜けると drop (3) ある時点で可変参照 1 つか不変参照複数のどちらか一方のみ**
- 借用規則が排除するもの → **data race。可変参照と不変参照の同時存在をコンパイル時に禁止する**
- ライフタイムの役割 → **参照が有効な期間を型の一部としてコンパイル時に検証する契約**
- Rust のエラーハンドリング → **例外なし。Result<T, E> + ? 演算子でエラーを型として伝播。panic! は回復不能エラー用**
- ゼロコスト抽象とは → **抽象化を使っても手書きの低レベルコードと同等の性能が出る設計原則。ジェネリクスの単相化、async のステートマシン化、イテレータの融合等**
- Rust の非同期モデル → **言語は async/await 構文のみ提供。ランタイム（executor）はライブラリ（tokio 等）として外部提供**
- cargo の役割 → **パッケージマネージャ + ビルドシステム + テストランナー + ベンチマーク。Cargo.toml で依存管理。crates.io が中央リポジトリ**
- Rust が C/C++ と性能同等な理由 → **LLVM バックエンド共通。ジェネリクス単相化・インライン化・GC なしでランタイムオーバーヘッドがない**

## Links

- [The Rust Programming Language (公式 book)](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [crates.io](https://crates.io/)
- [GitHub](https://github.com/rust-lang/rust)

## 関連

- [[axum]] — Rust の Web フレームワーク（tokio + tower + hyper ベース）
- [[hashbrown]] — std HashMap のバックエンド。SwissTable の Rust 実装
- [[rayon]] — work-stealing ベースのデータ並列ライブラリ
- [[almide]] — Rust で実装されたプログラミング言語（Almide コンパイラが Rust 製）
- [[rust-safety-critical]] — 安全臨界での Rust。Ferrocene(認定ツールチェーン)と RustBelt(型システムの機械証明)
- [[polymorphism|ポリモーフィズム]] — trait は単相化/動的を選べ、ad-hoc と境界付き parametric を融合
- [[build-caching]] — stdlib を `.rlib` 同梱 + cargo の `target/` インクリメンタルキャッシュ
- [[coeffect]] — 所有/move ≈ アフィン使用。使用量を型で追う coeffect の最も普及した実例
