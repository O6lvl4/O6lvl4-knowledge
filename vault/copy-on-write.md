---
title: Copy-on-Write (COW)
tags: [computer-science, memory-management, optimization]
---

「コピーが必要になるまでコピーしない」最適化戦略。

## プログラマ向けの一言

**データを共有しておいて、誰かが書き換えようとした瞬間にはじめてコピーを作る。** 読むだけなら共有のまま。書くときだけコストを払う。

## コードで理解する

```ts
// COW なし: コピーするたびにメモリを使う
const original = [1, 2, 3, 4, 5];
const copy = [...original]; // ← この時点で全要素コピー（読むだけでもコスト発生）

// COW あり（概念）: 共有しておいて、書き換え時にだけコピー
class CowArray<T> {
  private data: T[];
  private shared: boolean;

  constructor(data: T[]) {
    this.data = data;
    this.shared = false;
  }

  clone(): CowArray<T> {
    // コピーしない。同じデータを共有するだけ
    const cow = new CowArray(this.data);
    this.shared = true;
    cow.shared = true;
    return cow;
  }

  read(index: number): T {
    return this.data[index]; // 共有のまま読める。コストゼロ
  }

  write(index: number, value: T): void {
    if (this.shared) {
      // 書き換えが必要になった瞬間にコピーを作る
      this.data = [...this.data];
      this.shared = false;
    }
    this.data[index] = value;
  }
}
```

## 言語ごとの実装の違い

### Rust: 所有権ベース

```rust
use std::borrow::Cow;

// Cow<str> は「借用（参照）か所有か」を実行時に切り替える
fn process(input: &str) -> Cow<str> {
    if input.contains("bad") {
        // 書き換えが必要 → 所有権を持つ String を作る（コピー発生）
        Cow::Owned(input.replace("bad", "good"))
    } else {
        // そのまま返す → 参照のまま（コピーなし）
        Cow::Borrowed(input)
    }
}
```

Rust の `Cow<T>` は標準ライブラリに用意されている enum で、`Borrowed`（参照）と `Owned`（所有）の2状態を持つ。所有権システムの上に構築されている。

### Swift: 参照カウントベース

```swift
var a = [1, 2, 3]
var b = a  // この時点ではコピーしない。内部で同じバッファを共有

b.append(4)  // b を変更した瞬間にコピーが走る（a は変わらない）
```

Swift の Array, Dictionary, String はすべて COW。内部で参照カウント（`Rc` に相当）を持っていて、参照が1つなら書き換えてもコピーしない。2つ以上共有していて書き換えようとしたときだけコピーする。

### Rust と Swift の違い

| | Rust (`Cow<T>`) | Swift (値型 COW) |
|---|---|---|
| 判断基準 | 所有権を持っているか | 参照カウントが1より大きいか |
| 仕組み | `Borrowed` / `Owned` の enum | 参照カウント + 書き換え時コピー |
| 明示性 | 型で明示（`Cow<str>`） | 暗黙（Array 等に組み込み済み） |

Rust は「今これは借用？所有？」を型レベルで追跡する。Swift は「今これを何人が見てる？」を参照カウントで追跡する。目的は同じ（不要なコピーの回避）だがアプローチが違う。

## どこで使われているか

- **OS のプロセス fork** — 子プロセスは親のメモリを共有。書き換えたページだけコピー
- **Swift の値型** — Array, Dictionary, String, Set すべて COW
- **Rust の `Cow<T>`** — 文字列処理、パーサ、設定値の受け渡しなど
- **PHP の変数** — 代入時はコピーせず、書き換え時にコピー（zval の refcount）
- **Git のオブジェクト** — ファイルが変わっていなければ同じ blob を共有

## 関連

- [[programming-language|プログラミング言語]]
