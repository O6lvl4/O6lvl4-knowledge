---
title: NIST テストベクタ
tags: [cryptography, testing, standard]
---

NIST (米国国立標準技術研究所) が暗号アルゴリズムの仕様書と一緒に公開している公式のテスト入出力データ。

## 何であるか

「この鍵とこの平文を入れたら、この暗号文が出なければならない」という正解セット。実装が仕様通りに動いているかを検証するためのもの。世界中の暗号実装がこれで検証しており、ここを通れば基本的な正しさは担保できる。

NIST はアルゴリズムごとに仕様書 (FIPS / SP) を発行し、その付録やコンパニオンドキュメントとしてテストベクタを同梱する。CAVP (Cryptographic Algorithm Validation Program) はこれをさらに体系化した公式検証プログラムで、商用製品が暗号モジュール認証 (FIPS 140) を取得する際にも使われる。

## なぜ重要か

- **正しさの最低保証** — 自前の暗号実装が仕様と同じ結果を出すことを確認できる
- **相互運用性** — 異なるライブラリ・言語間で同じ鍵・平文から同じ暗号文が得られることが前提
- **リグレッション検出** — リファクタや最適化の後でもベクタが通れば互換性は壊れていない
- **再現可能な検証** — 誰がどこで実行しても同じ結果になる、客観的な正解

ただしベクタが通ることは必要条件であって十分条件ではない。サイドチャネル攻撃耐性やパディング処理の正しさなど、ベクタだけではカバーできない領域がある。

## 代表的なベクタ

### FIPS 197 Appendix B — AES ブロック暗号の基本テスト

AES-128 の単一ブロック暗号化。最も基本的なベクタ。

| 項目 | 値 |
|---|---|
| 鍵 | `2B7E151628AED2A6ABF7158809CF4F3C` |
| 平文 | `3243F6A8885A308D31319802E0370734` |
| 正解 (暗号文) | `3925841D02DC09FBDC118597196A0B32` |

ソース: [FIPS 197 — Advanced Encryption Standard (AES)](https://csrc.nist.gov/pubs/fips/197/final), Appendix B

### SP 800-38A F.3.7 — AES-CFB8 モードのテスト

ブロック暗号の運用モードの一つ CFB8 のベクタ。ストリーム的に1バイトずつ暗号化する。

| 項目 | 値 |
|---|---|
| 鍵 | `2B7E151628AED2A6ABF7158809CF4F3C` |
| IV | `000102030405060708090A0B0C0D0E0F` |
| 平文 | `6BC1BEE2` |
| 正解 (暗号文) | `3B79424C` |

ソース: [SP 800-38A — Recommendation for Block Cipher Modes of Operation](https://csrc.nist.gov/pubs/sp/800-38a/final), Section F.3.7

## 使い方

テストコードで NIST ベクタの入力を自前の実装に通し、出力が正解と一致するかを比較する。一致しなければ実装にバグがある。

```rust
// 例: Rust でのベクタ検証
#[test]
fn test_aes128_fips197_appendix_b() {
    let key = hex!("2B7E151628AED2A6ABF7158809CF4F3C");
    let plaintext = hex!("3243F6A8885A308D31319802E0370734");
    let expected = hex!("3925841D02DC09FBDC118597196A0B32");

    let ciphertext = aes128_encrypt(&key, &plaintext);
    assert_eq!(ciphertext, expected);
}
```

## 他のアルゴリズムのベクタ

NIST は AES 以外にも多数のベクタを公開している。

| アルゴリズム | 文書 | 内容 |
|---|---|---|
| SHA-2 | [FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final) | ハッシュ関数 (SHA-256, SHA-512 等) |
| SHA-3 | [FIPS 202](https://csrc.nist.gov/pubs/fips/202/final) | Keccak ベースのハッシュ |
| AES-GCM | [SP 800-38D](https://csrc.nist.gov/pubs/sp/800-38d/final) | 認証付き暗号 |
| HMAC | [FIPS 198-1](https://csrc.nist.gov/pubs/fips/198-1/final) | 鍵付きハッシュ |
| ECDSA | [FIPS 186-5](https://csrc.nist.gov/pubs/fips/186-5/final) | 楕円曲線デジタル署名 |

CAVP が提供する全ベクタの一覧: [CAVP Testing: Block Ciphers](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program)

## 参考リンク

- [NIST CSRC (Computer Security Resource Center)](https://csrc.nist.gov/) — NIST 暗号関連文書の総合ポータル
- [CAVP (Cryptographic Algorithm Validation Program)](https://csrc.nist.gov/projects/cryptographic-algorithm-validation-program) — 公式検証プログラム
- [FIPS 140-3](https://csrc.nist.gov/pubs/fips/140-3/final) — 暗号モジュール認証の規格。テストベクタによる検証はこの認証プロセスの一部
