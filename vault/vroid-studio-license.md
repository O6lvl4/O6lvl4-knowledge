---
title: VRoid Studio ライセンス
tags: [vtuber, 3d, license, pixiv]
---

[[vroid-studio|VRoid Studio]] で作ったキャラクターの権利と利用条件。

## 自作キャラは自由に使えるか？ — 判定フロー

**Q1. モデルは誰が作った？**
- 自分で VRoid Studio で作った → Q2 へ
- 他人が作ったモデルをダウンロードした → **そのモデルのライセンスに従う**（[[vroid-hub|VRoid Hub]] なら利用条件を確認）

**Q2. 使った素材は？**
- VRoid Studio のプリセットのみ（デフォルト髪型、衣装等）→ Q3 へ
- BOOTH 等で買ったテクスチャや衣装を使った → **その素材のライセンスも確認が必要**（素材ごとに商用可否が違う）

**Q3. プリセットに特別なライセンス表示がある？**
- ない → **自由に使える。商用 OK、販売 OK、改変 OK**
- ある → **その条件に従う**

**Q4. 何に使う？**
- VTuber 配信、動画投稿、ゲーム、グッズ → **OK**
- VRM モデルそのものを販売 → **OK**（ただし Q2 の素材ライセンスに注意）
- VRoid のアセットを組み込んだキャラクタークリエイター（競合アプリ）を公開 → **禁止**（自分だけが使う内製ツールは OK）

**結論: 「自分で VRoid Studio のプリセットだけで作ったキャラ」は、何に使っても法的に問題ない。** 注意が必要なのは「外部から持ち込んだ素材」と「競合アプリの公開」だけ。

## 権利の根拠

### 作成モデルの知的財産権

VRoid Studio 利用規約（Steam 版）第9条:

> All Intellectual Property Rights and other rights to works that constitute Output Items created using Software shall belong to the Users who created such works.

ユーザーが VRoid Studio で作成した出力物（.vrm モデル）の知的財産権は **ユーザーに帰属**する。個人・法人問わず商用利用可能。

### プリセット素材（髪型、衣装、テクスチャ等）

VRoid Studio ガイドライン（[vroid.com/en/studio/guidelines](https://vroid.com/en/studio/guidelines)）に基づく。

VRoid Studio に最初から入っている髪型や衣装は、pixiv が著作権を持ったまま「自由に使っていいよ」と許諾を出している形。ガイドラインの原文:

> Outside of situations when other special licensing terms are displayed, you can sell data and use it for commercial purposes, regardless of whether you're an individual or corporate body.

| 素材の出どころ | 商用利用 | 販売 | 改変 |
|---|---|---|---|
| VRoid Studio のプリセット（特別表示なし） | OK | OK | OK |
| VRoid Studio のプリセット（特別表示あり） | 表示に従う | 表示に従う | 表示に従う |
| BOOTH 等で購入した素材 | **素材ごとに異なる。必ず確認** | 同左 | 同左 |

「特別表示」は素材の説明欄に書かれている。表示がなければ気にしなくていい。

### CC0 との違い

フリー素材には「権利放棄」と「使用許諾」の2種類がある。VRoid のプリセットは後者。

| | CC0（権利放棄） | VRoid プリセット（使用許諾） |
|---|---|---|
| 権利者 | いない（完全放棄） | pixiv が保持 |
| 取り消し | **不可能**（一度放棄したら戻せない） | **理論上は可能**（規約変更で制限を追加できる） |
| 現時点の自由度 | 何でも OK | 何でも OK（ほぼ同じ） |
| リスク | なし | pixiv が規約を変える可能性がゼロではない |

**実例: Unsplash のライセンス変更。** 写真共有サイト Unsplash はもともと CC0 で写真を提供していたが、写真を大量ダウンロードして別サイトで再配布する業者が現れたため、独自ライセンス（Unsplash License）に変更した。CC0 時代にダウンロードされた写真は取り消せないが、新規の写真は新ライセンスが適用される。

VRoid のプリセットは CC0 ではなく pixiv の使用許諾なので、同様の変更が起きる可能性はある。ただし **既に書き出した .vrm ファイルの利用を遡及的に禁止する** ことは民法の信義則（民法第1条第2項）に反するため、現実的なリスクは低い。

**結論: 今プリセットだけで作って書き出したキャラは安心して使える。ただし CC0 のように「絶対に永久に自由」とは言い切れない、という構造上の違いがある。**

### 禁止事項

VRoid Studio ガイドラインの原文:

> You cannot create an application that can generate or output 3D models, avatars, or items consisting of deformed or combined meshes and textures that were created in VRoid Studio.

VRoid Studio で作ったメッシュやテクスチャを素材として組み込んで「ユーザーが 3D モデルを生成・出力できるアプリやサービス」を公開することが禁止されている。要は VRoid のアセットを流用した別のキャラクタークリエイターを作って配るな、という話。

VTuber 配信、ゲームに組み込む、グッズにする、VRM を販売する — こういった「モデルを使う」行為はすべて OK。自分だけが使う内製ツールもこの制限の対象外（ガイドラインに明記）。pixiv から個別ライセンスを取得すれば公開も可能。

また、利用規約 第5条第6項で VRoid Studio 自体の商用利用・二次利用は原則禁止されているが、「出力物の制作（Production of Output Items）」は明示的に例外として許可されている。

## 参照先

- [VRoid Studio ガイドライン](https://vroid.com/en/studio/guidelines) — プリセット素材の利用条件、アプリ開発制限
- [VRoid Studio 利用規約（Steam 版）](https://store.steampowered.com/eula/1486350_eula_0) — 第5条: 禁止行為、第9条: 知的財産権、第11条: 使用権取消
- [ピクシブ サービス利用規約](https://policies.pixiv.net/) — VRoid Studio 個別規約を含む統合規約

## 関連

- [[vroid-studio|VRoid Studio]] — ツール本体
- [[vroid-hub|VRoid Hub]] — 他人のモデルはここの利用条件に従う
- [[vrm|VRM]] — VRoid が出力するフォーマット
- [[copyright-law|著作権法]] — 権利の法的根拠
- [[creative-commons|Creative Commons]] — CC0 との比較の前提知識
- [[good-faith-principle|信義則]] — 遡及的な規約変更が困難な法的根拠
