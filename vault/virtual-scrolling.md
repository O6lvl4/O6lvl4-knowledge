---
title: 仮想スクロール
tags: [computer-science, web, mobile]
created_at: 2026-05-30
updated_at: 2026-05-30T13:34:00+09:00
---

大量リストのうち **ビューポートに見えている分だけを DOM に描く** 描画最適化（windowing とも）。データ件数が増えても DOM ノード数を一定に保ち、メモリとフレームレートを安定させる。[[tv-guide-architecture|番組表グリッド]]のように数千行×時間軸を扱う UI では事実上必須。

## 基本メカニズム

1. **全体サイズを確保** — `件数 × 行高`（可変なら総和）でスペーサ高さを設定し、スクロールバーが全長を反映するようにする
2. **可視範囲を計算** — スクロール位置から描画すべき index 範囲を出す
3. **その範囲だけ描画** — `transform: translateY(offset)` や絶対配置で正しい位置に置く
4. スクロールに応じて要素が出入りし、フレームワークが差分描画（または DOM ノードを再利用）

```js
// 固定行高の可視範囲（最も単純なケース、O(1)）
const start = Math.floor(scrollTop / rowHeight)
const end   = Math.ceil((scrollTop + viewportH) / rowHeight)
const render = [start - overscan, end + overscan]  // overscan = 先読みバッファ
```

## 固定サイズ vs 可変サイズ

- **固定サイズ**: index ↔ オフセットが単純な算術で O(1)。実装も安定
- **可変サイズ**: 各要素の実寸が要る。**推定して描画 → 測定して補正**（ResizeObserver 等）が定石。累積オフセット索引（prefix sum / Fenwick tree）で位置検索を O(log n) に。測定確定時に**スクロール位置がジャンプしやすい**のが最大の難所

## 2次元への拡張

行・列の両方を仮想化すると巨大グリッドが扱える。[[tv-guide-architecture|EPG/番組表]]は **横=時間軸（番組長でセル幅可変）× 縦=チャンネル** の典型例。横スクロール仮想化と可変幅セルが同時に効く。

## オーバースキャン（先読みバッファ）

ビューポートの上下に **5〜10 行ほど多めに**描画しておき、スクロールで滑り込む前に DOM へ存在させる。高速スクロール時の **白抜き・ポップイン**を防ぐ。広げすぎると描画コストが増えるトレードオフ。

## 落とし穴

- **スクロール位置の不安定化** — 可変高の測定確定や、可視域より上での要素追加/削除でビューが飛ぶ。CSS **scroll anchoring** や、先頭追加時（チャット等）のアンカリングで吸収
- **アクセシビリティ** — 要素が DOM に無いため支援技術が全体像を把握できない。`aria-setsize` / `aria-posinset` で総数と位置を補う。フォーカス管理も要注意
- **ブラウザ Ctrl+F / SEO** — 未描画コンテンツは **ページ内検索に当たらず、クローラにも見えない**。SEO 必須ページはサーバレンダリング等を併用
- **巨大スペーサの上限** — 行数が極端だとブラウザの最大要素高さ制限に当たる（数百万行級で顕在化）

## ライブラリ（2026, React 中心）

| ライブラリ | 形 | 位置づけ |
|---|---|---|
| **TanStack Virtual** | ヘッドレス（`useVirtualizer` フック） | 最大の自由度。コンテナ/オフセット描画は自前。React/Vue/Svelte/Solid 横断 |
| **react-virtuoso** | コンポーネント | 実用の既定解。可変高・グループ・sticky ヘッダ・無限スクロールが組込み |
| **react-window** | コンポーネント | 軽量・枯れているが固定サイズ中心で開発停滞気味 |
| **Angular CDK** | `cdk-virtual-scroll-viewport` | Angular 標準 |
| **vue-virtual-scroller** | コンポーネント | Vue 定番 |

ヘッドレス（TanStack）= 計算だけ提供し DOM は自分で持つ。コンポーネント型（virtuoso/window）= DOM 構造をライブラリが握る代わりに記述量が少ない。

## ネイティブ / Flutter — 仮想化は標準プリミティブに内蔵

最大の対比: **Web は仮想化ライブラリを後付けする**が、**ネイティブ / Flutter は標準のリストプリミティブが最初から仮想化済み**。やることは「正しいプリミティブを選ぶ」だけ。方式は2系統ある。

**(a) ビュー再利用（view recycling）** — 実際のビューオブジェクトをプールして使い回す

- **iOS UIKit** — `UITableView` / `UICollectionView`。`dequeueReusableCell` で再利用プールから取り出す（再利用は事実上必須）。iOS 10+ の **prefetching**（`UICollectionViewDataSourcePrefetching`）で出現直前のセル/データを先読み
- **Android View** — `RecyclerView`。**ViewHolder パターン**で画面分＋数個だけ作り、上に消えたビューを下の新項目へ回す（`ListView` の後継）

**(b) 遅延コンポジション（lazy composition）** — 可視分だけ生成し、画面外は破棄。古典的な「使い回し」ではなくランタイムが下層の描画オブジェクトを管理

- **SwiftUI** — `List`（内部は UITableView/UICollectionView）、`ScrollView` + `LazyVStack`/`LazyHStack`（出現時に生成、退場時にアンロード）
- **Jetpack Compose** — `LazyColumn` / `LazyRow` / `LazyVerticalGrid`。**recomposition + スロット再利用**で ViewHolder 不要。並べ替え時の無駄な再構成を防ぐため `key {}` で安定 ID を付ける
- **Flutter** — `ListView.builder` / `GridView.builder`（可視分だけ build）。低レベルは **Sliver プロトコル**（`CustomScrollView` + `SliverList` + `SliverChildBuilderDelegate`）

| プラットフォーム | プリミティブ | 方式 | 先読みバッファ |
|---|---|---|---|
| Web | TanStack / virtuoso 等（後付け） | windowing | overscan（5〜10行） |
| iOS UIKit | UITableView / UICollectionView | ビュー再利用（dequeue） | prefetching API |
| iOS SwiftUI | List / LazyVStack | 遅延コンポジション | 自動 |
| Android View | RecyclerView | ViewHolder 再利用 | LayoutManager の prefetch |
| Android Compose | LazyColumn / Row / Grid | 遅延コンポジション + スロット再利用 | 自動 |
| Flutter | ListView.builder / Sliver | 遅延 build + 要素再利用 | cacheExtent（既定 250px） |

**固定高の最適化**は共通の発想: Flutter は `itemExtent`、UIKit は固定行高、Web は固定サイズで O(1)。レイアウト計測を省ける。

**ネイティブ固有の落とし穴**:

- **再利用セルの状態リーク** — 前のデータ/画像が残る。`prepareForReuse`(UIKit) でリセット、非同期画像ロードは index ズレ（リサイクルで別セルに古い画像）に注意
- **SwiftUI のセル identity 混同** — `UIHostingConfiguration` での再利用時、同一データと誤認するエッジケース
- **Flutter の `ListView`(非 builder)** — 子を一括ビルドして**仮想化が効かない**。大量リストでは必ず `.builder`。`AutomaticKeepAlive` で状態保持するとメモリ増
- **Compose の `key` 未指定** — 並べ替えで無駄な recomposition が起きる

## CSS だけの軽量代替 — content-visibility

`content-visibility: auto` + `contain-intrinsic-size` で、画面外要素のレンダリングをブラウザに**スキップさせる**（“受動的”仮想化）。実装が極小な一方、スクロールバードラッグ時のジャンク、アンカーリンクのスムーススクロール阻害などの癖がある。中規模なら有効、巨大データは本格的な仮想化が必要。

## 使わない判断

- 要素数が小さい（数十〜百程度）なら、仮想化の複雑さ（測定・a11y・スクロール補正）に見合わない。`content-visibility` か素の描画で十分
- a11y / ページ内検索 / SEO が最優先の文書系コンテンツでは、ページネーションの方が安全なことも

## 関連

- [[tv-guide-architecture|番組表アーキテクチャ]] — 仮想スクロールが必須になる代表ユースケース（2Dグリッド）
- [[tv-guide-oss|番組表 OSS]] — Planby は独自の仮想ビューで大量データに対応
- [[copy-on-write|Copy-on-Write]] — 「必要分だけ実体化する」遅延戦略の発想として通底
- [[xcode|Xcode]] / [[android-studio|Android Studio]] — ネイティブ実装の開発環境（UITableView/RecyclerView/Compose/SwiftUI）

## Links

- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [TanStack Virtual vs react-window vs react-virtuoso (2026)](https://www.pkgpulse.com/guides/tanstack-virtual-vs-react-window-vs-react-virtuoso-2026)
- [Virtual Scrolling for High-Performance Interfaces (OpenReplay)](https://blog.openreplay.com/virtual-scrolling-high-performance-interfaces/)
- [CSS scroll anchoring (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_anchoring)
