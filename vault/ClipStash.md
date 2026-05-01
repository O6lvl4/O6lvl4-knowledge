---
title: ClipStash
tags: [macos, native, objective-c, productivity]
---

Pure Objective-C + Cocoa/Carbon で書かれた macOS 用クリップボード履歴マネージャ。Electron/Swift/外部依存ゼロ、~200 行のネイティブコード。

## Core Idea

クリップボード履歴ツールに Electron は重すぎる。`NSPasteboard` を polling して履歴を保持、Carbon の `EventHotKey` で Cmd+Shift+V を捕まえ、選択したエントリを直接アクティブアプリへ paste（`CGEventPost` で Cmd+V をシミュレート）するだけで十分。

## Features

- Menu bar 常駐（Dock アイコンなし、`LSUIElement`）
- 直近 20 件のテキスト履歴を保持
- Global hotkey **Cmd+Shift+V** でマウス位置にメニュー表示
- 選択したエントリをアクティブアプリへ直接 paste
- 重複は自動排除
- ログイン時起動対応

## Build

```bash
make          # build
make run      # build & launch
make install  # /Applications にコピー
make clean
```

Xcode CLT が必要（Xcode 14.3 / macOS 12+ で動作確認）。

## Architecture

```
ClipStash/
├── main.m               アプリエントリ
├── AppDelegate.h/m      menu bar UI、hotkey 登録、paste シミュレーション
├── ClipboardMonitor.h/m NSPasteboard polling、履歴管理
└── Info.plist           bundle metadata（LSUIElement）
```

**~200 行の Objective-C**。`clang` 一発で 1 秒以内にコンパイル完了。

## How It Works

`ClipboardMonitor` が `NSPasteboard.generalPasteboard` を 0.5 秒間隔で polling。`changeCount` の増分を検知すると新文字列を bounded array の先頭へ push。

`AppDelegate` が Carbon の `EventHotKey` で Cmd+Shift+V を登録。トリガー時に履歴から `NSMenu` を構築し、`popUpMenuPositioningItem:atLocation:inView:` でマウス位置に表示。選択時は pasteboard へ書き戻し、`CGEventPost` で Cmd+V を投入。

## Links

- [GitHub](https://github.com/O6lvl4/ClipStash)
