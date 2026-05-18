---
title: csv (Almide)
tags: [almide, stdlib]
---

RFC 4180 準拠の CSV パーサー・シリアライザ。[[almide|Almide]] で純粋実装。

`parse`（配列）と `parse_records`（オブジェクト）の2モード。quoted fields、escaped quotes、CRLF/LF 対応。roundtrip-safe な stringify。
