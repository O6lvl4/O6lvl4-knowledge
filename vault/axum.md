---
title: axum
tags: [rust, web-framework, async, tokio]
created_at: 2026-05-20
updated_at: 2026-05-20
---

[[rust|Rust]] の Web フレームワーク。tokio チームが開発。**tower の Service トレイトをそのまま基盤に使う** 設計により、ミドルウェアやエコシステムを tower / hyper / tonic 等と共有できるのが最大の特徴。

## ポジショニング

| フレームワーク | 設計思想 | tower 統合 |
|---|---|---|
| **axum** | tower ネイティブ。エコシステム共有を最優先 | 完全 |
| **actix-web** | 独自ランタイム（actix-rt）。性能ベンチマーク志向 | なし |
| **rocket** | 人間工学重視。マクロで宣言的 API | なし |

axum は「独自のものを作らない」設計。リクエスト処理は tower の `Service`、抽出は `FromRequest` トレイト、ランタイムは tokio、HTTP は hyper。フレームワーク固有のプリミティブが少ないため、ロックインが小さい。

## アーキテクチャ: tower スタック

```
クライアント → [tower ミドルウェア層] → [axum Router] → [ハンドラ]
                 │                          │              │
                 ├─ tower-http              ├─ ルーティング  ├─ FromRequest で抽出
                 ├─ tower::timeout          │               ├─ IntoResponse で変換
                 ├─ tower::limit            │               └─ 業務ロジック
                 └─ カスタム Service         │
                                            └─ ネストとマージが可能
```

axum の Router 自体が `tower::Service` を実装している。つまり axum アプリ全体が 1 つの Service であり、他の tower Service と自由に合成できる。

## 基本的な構造

```rust
use axum::{Router, routing::get, Json, extract::Path};
use serde::Serialize;

#[derive(Serialize)]
struct User { id: u64, name: String }

async fn get_user(Path(id): Path<u64>) -> Json<User> {
    Json(User { id, name: "Alice".into() })
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/users/{id}", get(get_user));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

## Extractor（抽出）

リクエストから値を取り出す仕組み。ハンドラの引数に型を書くだけで自動的に抽出される。`FromRequest` / `FromRequestParts` トレイトの実装。

| Extractor | 抽出元 | 例 |
|---|---|---|
| `Path<T>` | URL パスパラメータ | `/users/{id}` → `Path(id): Path<u64>` |
| `Query<T>` | クエリ文字列 | `?page=1` → `Query(params): Query<Pagination>` |
| `Json<T>` | JSON リクエストボディ | `Json(body): Json<CreateUser>` |
| `Form<T>` | フォームデータ | `Form(data): Form<LoginForm>` |
| `State<T>` | アプリケーション状態 | `State(db): State<DbPool>` |
| `Extension<T>` | ミドルウェアが注入した値 | `Extension(user): Extension<CurrentUser>` |
| `TypedHeader<T>` | 型付きヘッダ | `TypedHeader(auth): TypedHeader<Authorization<Bearer>>` |
| `Request` | 生リクエスト全体 | フォールバック用 |

カスタム Extractor は `FromRequest` / `FromRequestParts` を実装するだけで作れる。

```rust
// カスタム Extractor の例
#[async_trait]
impl<S> FromRequestParts<S> for CurrentUser
where S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        // ヘッダから JWT を取り出して検証
    }
}

// ハンドラで使う
async fn dashboard(user: CurrentUser) -> impl IntoResponse { ... }
```

## State 管理

アプリケーション共有状態は `Router::with_state()` で注入し、`State<T>` Extractor で取り出す。

```rust
#[derive(Clone)]
struct AppState {
    db: PgPool,
    redis: RedisPool,
}

let app = Router::new()
    .route("/users", get(list_users))
    .with_state(AppState { db, redis });

async fn list_users(State(state): State<AppState>) -> Json<Vec<User>> {
    let users = sqlx::query_as("SELECT * FROM users")
        .fetch_all(&state.db).await.unwrap();
    Json(users)
}
```

`State` は `Clone` を要求する。DB プールや設定など共有可能なものを入れる。ミュータブルな共有状態が必要なら `Arc<Mutex<T>>` や `Arc<RwLock<T>>`。

## ミドルウェア

tower / tower-http のミドルウェアをそのまま使える。axum 固有のミドルウェア層は持たない。

```rust
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tower::limit::RateLimitLayer;

let app = Router::new()
    .route("/api/users", get(list_users))
    .layer(CorsLayer::permissive())
    .layer(TraceLayer::new_for_http())
    .layer(RateLimitLayer::new(100, Duration::from_secs(60)));
```

主要な tower-http ミドルウェア：

| ミドルウェア | 機能 |
|---|---|
| `CorsLayer` | CORS ヘッダ制御 |
| `TraceLayer` | リクエスト/レスポンスのトレーシング |
| `CompressionLayer` | gzip / br / zstd 圧縮 |
| `TimeoutLayer` | リクエストタイムアウト |
| `SetRequestHeaderLayer` | ヘッダ追加 |
| `CatchPanicLayer` | panic をキャッチして 500 に変換 |

## Router の合成

Router はネスト（nest）とマージ（merge）で構成できる。大規模アプリではモジュールごとに Router を作り、最後にマージする。

```rust
fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(list_users).post(create_user))
        .route("/{id}", get(get_user).put(update_user).delete(delete_user))
}

fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/stats", get(stats))
        .layer(admin_auth_layer())  // このルートグループだけにミドルウェア適用
}

let app = Router::new()
    .nest("/api/users", user_routes())
    .nest("/admin", admin_routes())
    .with_state(state);
```

## エラーハンドリング

ハンドラは `IntoResponse` を実装する任意の型を返せる。`Result<T, E>` も `E: IntoResponse` なら返せる。

```rust
enum AppError {
    NotFound,
    Internal(anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        match self {
            AppError::NotFound => StatusCode::NOT_FOUND.into_response(),
            AppError::Internal(e) => {
                tracing::error!("{:?}", e);
                StatusCode::INTERNAL_SERVER_ERROR.into_response()
            }
        }
    }
}

async fn get_user(Path(id): Path<u64>) -> Result<Json<User>, AppError> {
    let user = db.find(id).await.map_err(AppError::Internal)?;
    user.ok_or(AppError::NotFound).map(Json)
}
```

## WebSocket

axum は WebSocket をネイティブサポート。

```rust
use axum::extract::ws::{WebSocket, WebSocketUpgrade};

async fn ws_handler(ws: WebSocketUpgrade) -> impl IntoResponse {
    ws.on_upgrade(handle_socket)
}

async fn handle_socket(mut socket: WebSocket) {
    while let Some(Ok(msg)) = socket.recv().await {
        socket.send(msg).await.ok();
    }
}
```

## 依存スタック

```
axum
├── tokio       … 非同期ランタイム（マルチスレッド work-stealing executor）
├── hyper       … HTTP 1/2 実装
├── tower       … Service トレイト + ミドルウェアフレームワーク
└── tower-http  … HTTP 固有のミドルウェア集（CORS, 圧縮, トレース等）
```

各層が独立したクレート。axum はこれらを糊付けする薄いレイヤーに過ぎない。

| クレート | 役割 | axum との関係 |
|---|---|---|
| **tokio** | 非同期ランタイム。タスクスケジューリング、I/O、タイマー | axum のランタイム。`#[tokio::main]` で起動 |
| **hyper** | HTTP プロトコル実装。低レベル | axum が内部で使用。ユーザーは通常意識しない |
| **tower** | `Service` トレイト定義。リクエスト→レスポンスの抽象 | axum の設計基盤。Router 自体が Service |
| **tower-http** | HTTP 向けミドルウェア集 | axum の `.layer()` でそのまま使う |

## tower::Service トレイト

axum を理解する鍵。tower の `Service` はリクエストを受けてレスポンスを返す非同期関数の抽象：

```rust
pub trait Service<Request> {
    type Response;
    type Error;
    type Future: Future<Output = Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>>;
    fn call(&mut self, req: Request) -> Self::Future;
}
```

axum の Router、ミドルウェア、ハンドラがすべてこの `Service` を実装する。これにより：

- ミドルウェアは `Service` を包む `Service`（デコレータパターン）
- Router は複数の `Service` をルーティングする `Service`
- アプリ全体が 1 つの `Service` として、テストや合成が容易

## 他の Rust Web フレームワークとの詳細比較

| | axum | actix-web | rocket |
|---|---|---|---|
| ランタイム | tokio | actix-rt (tokio ベース) | tokio |
| ミドルウェア | tower 標準 | 独自 (Transform トレイト) | 独自 (Fairing) |
| 抽出 | FromRequest トレイト | FromRequest トレイト | マクロベース |
| 型安全ルーティング | コンパイル時チェック | コンパイル時チェック | マクロで宣言 |
| WebSocket | ネイティブ | ネイティブ | 外部クレート |
| エコシステム共有 | tower / hyper / tonic | 独自エコシステム | 独自エコシステム |
| gRPC 共存 | tonic と Router をマージ可能 | 別プロセスが一般的 | 別プロセスが一般的 |
| 学習曲線 | 中（tower の理解が深めると有利） | 中 | 低（マクロが隠蔽） |

axum の最大の利点は **gRPC (tonic) と HTTP を同一プロセスで共存** できること。両方とも tower::Service なので Router をマージするだけ。

## 押さえどころ（カード化候補）

- axum の設計思想 → **tower の Service トレイトをそのまま基盤に使い、独自プリミティブを最小化する。ミドルウェアやエコシステムを tower/hyper/tonic と共有できるのが最大の特徴**
- axum の Extractor → **ハンドラの引数に型を書くだけでリクエストから値を自動抽出。FromRequest / FromRequestParts トレイトの実装。Path, Query, Json, State 等**
- axum のミドルウェア → **tower / tower-http のミドルウェアをそのまま使う。axum 固有のミドルウェア層を持たない。.layer() で適用**
- tower::Service の本質 → **リクエストを受けてレスポンスを返す非同期関数の抽象。axum の Router、ミドルウェア、ハンドラがすべて Service を実装。アプリ全体が 1 つの Service**
- axum の依存スタック → **tokio（ランタイム）+ hyper（HTTP）+ tower（Service 抽象）+ tower-http（ミドルウェア集）。axum はこれらを糊付けする薄いレイヤー**
- axum と tonic の共存 → **gRPC (tonic) と HTTP を同一プロセスで共存可能。両方 tower::Service なので Router をマージするだけ**
- State 管理 → **Router::with_state() で注入、State<T> Extractor で取り出す。T は Clone 必須。ミュータブル共有状態は Arc<Mutex<T>>**

## Links

- [axum (GitHub)](https://github.com/tokio-rs/axum)
- [axum docs](https://docs.rs/axum/latest/axum/)
- [tower (GitHub)](https://github.com/tower-rs/tower)
- [tower-http (GitHub)](https://github.com/tower-rs/tower-http)

## 関連

- [[rust|Rust]] — axum の実装言語
