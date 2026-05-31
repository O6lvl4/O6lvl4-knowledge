---
title: チョムスキー階層
tags: [formal-language, automata-theory, computer-science]
created_at: 2026-05-18
updated_at: 2026-05-31T21:32:58+09:00
---

形式言語を生成する形式文法の包含階層。1956年にノーム・チョムスキーが発表。

## 形式文法 = 文字列の生成ルール

「ある文字列がこの言語に属するか？」を判定する仕組み。プログラマ向けに言えば、バリデーション関数の表現力の分類。

```ts
// 形式文法を TypeScript で表現するとこうなる
type Grammar = {
  nonTerminals: string[];   // N: まだ展開できる記号（変数みたいなもの）
  terminals: string[];      // Σ: 最終的な出力文字（リテラルみたいなもの）
  rules: Rule[];            // P: 展開ルール
  start: string;            // S: 最初の記号
};
type Rule = { from: string; to: string };

// 例: a が n 個、b が n 個 並ぶ文字列（ab, aabb, aaabbb, ...）
const grammar: Grammar = {
  nonTerminals: ["S"],
  terminals: ["a", "b"],
  rules: [
    { from: "S", to: "aSb" },  // S を aSb に展開できる
    { from: "S", to: "ab" },   // S を ab に展開できる
  ],
  start: "S",
};
// S → aSb → aaSbb → aaabbb  （S を繰り返し展開して文字列を生成）
```

## 階層 = 「バリデーション関数にどれだけの道具を許すか」

```ts
// Type 3: 変数1個で足りる（状態だけ、メモリなし）
function type3(input: string): boolean {
  let state = "start";
  for (const ch of input) {
    // 今の状態と文字だけで次の状態が決まる
    state = transition(state, ch);
  }
  return state === "accept";
}

// Type 2: スタック（配列の push/pop）が必要
function type2(input: string): boolean {
  const stack: string[] = [];
  for (const ch of input) {
    // 今の状態 + スタックのトップ で判断
  }
  return stack.length === 0;
}

// Type 1: メモリは使えるが入力長に比例する量まで
function type1(input: string): boolean {
  const memory = new Array(input.length * C); // 定数倍まで
  // ...
}

// Type 0: 何でもあり = 普通のプログラム
function type0(input: string): boolean {
  // 任意のコードが書ける。ただし停止しないかもしれない
}
```

## 階層の対応表

| Type | プログラマの感覚 | 使える道具 | 身近な例 |
|---|---|---|---|
| [[type-3-grammar\|Type 3]] | 正規表現 | 変数1個（状態） | `/^a*b$/` |
| [[type-2-grammar\|Type 2]] | 再帰 / スタック | `stack.push()` / `stack.pop()` | 括弧の対応チェック |
| [[type-1-grammar\|Type 1]] | 配列を使った検証 | 入力長に比例するメモリ | 型チェック |
| [[type-0-grammar\|Type 0]] | 任意のプログラム | 制限なし | 停止問題 |

## 文法 ⇔ 認識オートマトン対応表

階層の本質は「生成する文法」と「受理するオートマトン（≒メモリの形）」がぴったり対応している点にある。文法の生成規則に課す制約が、それを認識するのに必要な計算資源を決める。

| Type | 文法（生成規則の形） | 認識オートマトン | メモリの形 | 言語クラス | 例 |
|---|---|---|---|---|---|
| [[type-0-grammar\|Type 0]] | 句構造文法（`α → β`、制約なし） | チューリング機械（TM） | 無制限テープ | 帰納的可算言語 | 停止問題、任意計算 |
| [[type-1-grammar\|Type 1]] | 文脈依存文法（`αAβ → αγβ`、長さ非短縮） | 線形有界オートマトン（LBA） | 入力長に比例するテープ | 文脈依存言語 | `aⁿbⁿcⁿ`、型チェック |
| [[type-2-grammar\|Type 2]] | 文脈自由文法（`A → γ`、左辺は非終端1個） | [[pushdown-automaton\|プッシュダウン・オートマトン]]（PDA） | スタック1本 | 文脈自由言語 | `aⁿbⁿ`、括弧の対応、JSON |
| [[type-3-grammar\|Type 3]] | 正規文法（`A → aB` / `A → a`、線形） | 有限オートマトン（DFA/NFA） | 状態のみ（メモリなし） | 正規言語 | `a*b`、トークン分割 |

対応の読み方：**規則の左辺をどこまで複雑にできるか = 必要なメモリの形**。左辺が1記号（Type 2/3）ならスタックや状態で足り、左辺に文脈（周囲の記号）が必要（Type 1）ならテープ全体が要る。決定性 PDA は文脈自由言語の真部分（LR 文法）しか受理できず、ここで非決定性が本質的になる点も実務上重要。

## 包含関係

```
Type 3 ⊂ Type 2 ⊂ Type 1 ⊂ Type 0

正規表現で書けるものは、再帰でも書ける。逆は無理。
再帰で書けるものは、配列でも書ける。逆は無理。
```

各包含は**真**の包含。`aⁿbⁿ`（対応した括弧）は Type 2 だが Type 3 では書けず（有限状態では数を覚えられない＝反復補題で証明）、`aⁿbⁿcⁿ`（3つの数を揃える）は Type 1 だが Type 2 では書けない（スタック1本では2つの計数を同時に保てない）。

## なぜプログラマに関係あるか

- **正規表現** (Type 3) で括弧の対応を検証しようとして失敗した経験 → それは Type 2 の問題だから
- **パーサ** を書くとき、再帰下降パーサ (Type 2) で十分か、もっと強い仕組みが要るかの判断基準
- `JSON.parse()` は Type 2 のパーサ。TypeScript の型チェッカーは Type 1 以上の処理

## 押さえどころ（カード化候補）

- **チョムスキー階層とは** → 形式文法の包含階層（Type 3 ⊂ 2 ⊂ 1 ⊂ 0、すべて真包含）。1956年チョムスキー。生成規則に課す制約が表現力を決める。
- **文法⇔オートマトン対応** → Type 0=チューリング機械、Type 1=線形有界オートマトン、Type 2=[[pushdown-automaton|プッシュダウン・オートマトン]]（スタック）、Type 3=有限オートマトン（状態のみ）。
- **規則の形がメモリを決める** → 規則左辺が非終端1個なら状態/スタックで足り、文脈（周囲の記号）が必要ならテープ全体が要る。
- **真包含の証拠** → `aⁿbⁿ` は Type 2 だが Type 3 不可（有限状態では計数できない）、`aⁿbⁿcⁿ` は Type 1 だが Type 2 不可（スタック1本で2計数は無理）。反復補題で証明。
- **プログラマへの含意** → 正規表現（Type 3）で括弧の対応は取れない（Type 2 が要る）。`JSON.parse` は Type 2、型チェックは Type 1 以上。

## Links

- [Chomsky, "Three models for the description of language" (1956)](https://doi.org/10.1109/TIT.1956.1056813)
- [Chomsky, "On certain formal properties of grammars" (1959)](https://doi.org/10.1016/S0019-9958(59)90362-6)

## 関連

- [[type-0-grammar|Type 0 文法]] — 句構造文法 ⇔ チューリング機械。制約なし、帰納的可算言語
- [[type-1-grammar|Type 1 文法]] — 文脈依存文法 ⇔ 線形有界オートマトン。長さ非短縮規則
- [[type-2-grammar|Type 2 文法]] — 文脈自由文法 ⇔ PDA。プログラミング言語の構文の主戦場
- [[type-3-grammar|Type 3 文法]] — 正規文法 ⇔ 有限オートマトン。トークナイザ・正規表現の理論
- [[pushdown-automaton|プッシュダウン・オートマトン]] — Type 2 を受理する機械。スタックという1点が表現力を生む
- [[programming-language|プログラミング言語]] — 構文は Type 2、意味解析は Type 1 以上という分担の出発点
