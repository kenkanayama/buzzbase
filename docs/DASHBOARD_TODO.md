# 📋 ダッシュボード画面 開発TODOリスト

> このドキュメントは、ダッシュボード画面および関連機能の開発進捗を追跡するためのものです。
> すべてのタスクが完了したら、このファイルは削除してください。

---

## 📊 現在の実装状況サマリー

| カテゴリ | 実装状況 | 備考 |
|---------|---------|------|
| ダッシュボードUI | ⚠️ 部分的 | モックデータで表示中 |
| ユーザー情報編集 | ❌ 未実装 | ページ・機能なし |
| 投稿登録機能 | ❌ 未実装 | ページ・機能なし |
| 投稿一覧機能 | ❌ 未実装 | ページ・機能なし |
| Firestore CRUD | ❌ 未実装 | データ取得・保存なし |
| SNS API連携 | ❌ 未実装 | Instagram/TikTok |
| 再生数取得バッチ | ❌ 未実装 | Cloud Functions |

---

## 🎯 開発タスク

### 1. ページ・ルーティング追加

以下のページとルートが未実装です。

- [ ] **マイページ（プロフィール編集）**
  - パス: `/profile`
  - ファイル: `frontend/src/pages/ProfilePage.tsx`
  - 機能: ユーザー情報の表示・編集

- [ ] **投稿登録ページ**
  - パス: `/post/new`
  - ファイル: `frontend/src/pages/PostNewPage.tsx`
  - 機能: 新規投稿URL登録フォーム

- [ ] **投稿一覧ページ**
  - パス: `/posts`
  - ファイル: `frontend/src/pages/PostsPage.tsx`
  - 機能: 登録済み投稿のリスト表示

- [ ] **App.tsx にルート追加**
  - 上記3ページのルーティング設定

---

### 2. ユーザー情報編集機能（/profile）

ドキュメント要件:
> **ユーザー情報:** 名前（表示）、編集ボタン（名前・住所・電話・振込先）。

- [ ] **ProfilePage.tsx の作成**
  - ユーザー情報表示
  - 編集フォーム（名前・住所・電話・振込先）

- [ ] **Firestore ユーザーコレクション設計**
  ```
  users/{userId}
  ├── displayName: string
  ├── email: string
  ├── address: string (住所)
  ├── phone: string (電話番号)
  ├── bankAccount: object (振込先)
  │   ├── bankName: string
  │   ├── branchName: string
  │   ├── accountType: string
  │   ├── accountNumber: string
  │   └── accountHolder: string
  ├── createdAt: timestamp
  └── updatedAt: timestamp
  ```

- [ ] **ユーザー情報 CRUD ユーティリティ**
  - `lib/firestore/users.ts` 作成
  - getUser, updateUser 関数

- [ ] **フォームバリデーション**
  - 電話番号形式チェック
  - 必須項目チェック

---

### 3. 投稿登録機能（/post/new）

ドキュメント要件:
> **URL登録:** SNS選択、商品名（自由入力）、投稿URLを入力。

- [ ] **PostNewPage.tsx の作成**
  - SNS選択（Instagram / TikTok）
  - 商品名入力フィールド
  - 投稿URL入力フィールド
  - 登録ボタン

- [ ] **Firestore 投稿コレクション設計**
  ```
  users/{userId}/posts/{postId}
  ├── platform: 'instagram' | 'tiktok'
  ├── productName: string
  ├── postUrl: string
  ├── postDate: timestamp (登録日)
  ├── measureDate: timestamp (計測予定日 = 登録日+7日)
  ├── viewCount: number | null
  ├── status: 'pending' | 'completed' | 'failed'
  ├── createdAt: timestamp
  └── updatedAt: timestamp
  ```

- [ ] **投稿 CRUD ユーティリティ**
  - `lib/firestore/posts.ts` 作成
  - createPost, getPosts, getPost 関数

- [ ] **URL バリデーション**
  - Instagram URL形式チェック
  - TikTok URL形式チェック

---

### 4. 投稿一覧機能（/posts）

ドキュメント要件:
> **履歴表示:** 登録済み投稿のリスト表示。7日経過後に自動取得された再生数を表示。

- [ ] **PostsPage.tsx の作成**
  - 投稿リスト表示
  - ステータスバッジ（計測中 / 完了）
  - 再生数表示
  - ページネーション（必要に応じて）

- [ ] **投稿詳細モーダル or ページ**
  - 投稿の詳細情報表示
  - 編集・削除機能

---

### 5. ダッシュボードのFirestore連携

現在のDashboardPage.tsxはハードコードされたダミーデータを表示しています。

```typescript
// TODO: Firestoreから実際のデータを取得
const snsAccounts = [
  { platform: 'Instagram', username: '@example_user', connected: true },
  { platform: 'TikTok', username: '@example_tiktok', connected: false },
];
```

- [ ] **SNS連携状況の取得**
  - Firestoreからユーザーの連携SNSアカウント情報を取得
  - 連携状況を表示

- [ ] **最近の投稿の取得**
  - Firestoreから直近の投稿を取得（limit: 5件程度）
  - リアルタイム更新（onSnapshot）の検討

- [ ] **ダッシュボードの「設定」ボタン**
  - クリック時の動作を実装（SNS連携設定ページへ or モーダル）

---

### 6. SNS連携機能

- [ ] **SNS連携設定ページ or モーダル**
  - Instagram連携ボタン
  - TikTok連携ボタン
  - 連携解除機能

- [ ] **Instagram API連携**
  - Instagram Graph API (New Pro API) の設定
  - OAuth認証フロー
  - アクセストークン保存

- [ ] **TikTok API連携**
  - TikTok for Developers API 設定
  - OAuth認証フロー
  - アクセストークン保存

> ⚠️ SNS API連携はAPI審査通過後の最終工程（アプリ開発概要.md より）

---

### 7. Cloud Functions（再生数取得バッチ）

ドキュメント要件:
> Cloud Schedulerにより毎日0時に実行。
> 投稿から7日経過したレコードをAPIで叩き、`view_count`をFirestoreに書き込む。

- [ ] **Cloud Functions プロジェクト初期化**
  - `functions/` ディレクトリ作成
  - TypeScript設定

- [ ] **再生数取得関数**
  - 7日経過した投稿を検索
  - Instagram/TikTok APIで再生数取得
  - Firestoreに書き込み

- [ ] **Cloud Scheduler設定**
  - 毎日0時に実行するジョブ
  - Terraform定義追加

---

## 📁 作成が必要なファイル一覧

```
frontend/src/
├── pages/
│   ├── ProfilePage.tsx      # NEW: マイページ
│   ├── PostNewPage.tsx      # NEW: 投稿登録
│   └── PostsPage.tsx        # NEW: 投稿一覧
├── lib/
│   └── firestore/
│       ├── users.ts         # NEW: ユーザーCRUD
│       └── posts.ts         # NEW: 投稿CRUD
└── types/
    └── index.ts             # UPDATE: 型定義追加

functions/                    # NEW: Cloud Functions
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 🔗 関連ドキュメント

- [アプリ開発概要.md](../アプリ開発概要.md) - 機能詳細・要件定義
- [README.md](../README.md) - 開発ステップ進捗
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 開発ガイド

---

## 📝 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-22 | 初版作成 - 調査結果をもとにTODOリスト化 |


