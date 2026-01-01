# 📚 BuzzBase API リソース設計

> RESTfulな思想に基づいたデータリソースの設計ドキュメント

---

## 📋 目次

1. [リソース一覧](#リソース一覧)
2. [Users（ユーザー）](#1-usersユーザー)
3. [SnsAccounts（SNS連携）](#2-snsaccountssns連携)
4. [Posts（投稿）](#3-posts投稿)
5. [ViewCountResults（再生数取得結果）](#4-viewcountresults再生数取得結果)
6. [Firestore コレクション設計](#firestore-コレクション設計)
7. [API エンドポイント設計](#api-エンドポイント設計)

---

## リソース一覧

| リソース名 | 説明 | ステータス |
|-----------|------|-----------|
| Users | ユーザー情報（プロフィール・住所・振込先・Instagram連携） | ✅ 実装済み |
| InstagramAccounts | Instagramトークン管理 | ✅ 実装済み |
| Campaigns | キャンペーン（商品/案件）マスター | ✅ 実装済み |
| PRPosts | PR投稿情報（投稿データ・インサイト数値） | ✅ 実装済み |
| ~~SnsAccounts~~ | ~~SNS連携情報~~ | ❌ 廃止（InstagramAccountsに統合） |
| ~~Posts~~ | ~~投稿情報~~ | ❌ 廃止（PRPostsに統合） |
| ~~ViewCountResults~~ | ~~再生数取得バッチ結果~~ | ❌ 廃止（PRPostsに直接保存） |

---

## 1. Users（ユーザー）

ユーザーの基本情報、連絡先、振込先情報を管理するリソース。

### リソース定義

```typescript
interface User {
  // === 識別情報 ===
  id: string;                    // ユーザーID（Firebase Auth UID）

  // === 基本情報（認証時に取得） ===
  email: string;                 // メールアドレス
  displayName: string | null;    // 表示名
  photoURL: string | null;       // プロフィール画像URL

  // === 連絡先情報 ===
  phone: string | null;          // 電話番号

  // === 住所情報 ===
  address: {
    postalCode: string;          // 郵便番号（例: "123-4567"）
    prefecture: string;          // 都道府県（例: "東京都"）
    city: string;                // 市区町村（例: "渋谷区"）
    street: string;              // 番地（例: "〇〇1-2-3"）
    building: string | null;     // 建物名・部屋番号
  } | null;

  // === 振込先情報 ===
  bankAccount: {
    bankName: string;            // 銀行名（例: "みずほ銀行"）
    bankCode: string;            // 銀行コード（例: "0001"）
    branchName: string;          // 支店名（例: "渋谷支店"）
    branchCode: string;          // 支店コード（例: "001"）
    accountType: 'ordinary' | 'checking';  // 口座種別（普通/当座）
    accountNumber: string;       // 口座番号（例: "1234567"）
    accountHolder: string;       // 口座名義（カタカナ）
  } | null;

  // === Instagram連携情報 ===
  instagramAccounts: {                    // 連携済みInstagramアカウント（Map形式）
    [accountId: string]: InstagramAccountInfo;  // キー: InstagramアカウントID
  };

  // === メタデータ ===
  createdAt: timestamp;          // 作成日時
  updatedAt: timestamp;          // 更新日時
  lastLoginAt: timestamp;        // 最終ログイン日時
}

/**
 * Instagram連携アカウント情報（users.instagramAccountsのValue）
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user
 */
interface InstagramAccountInfo {
  username: string;              // ユーザー名（例: "example_user"）
  name: string;                  // プロフィール名（表示名）
  profile_picture_url: string;   // プロフィール画像URL
}
```

### 用途

| フィールド | 用途 |
|-----------|------|
| email, displayName, photoURL | 認証・プロフィール表示 |
| phone, address | 商品発送時の連絡先 |
| bankAccount | 再生数補償の振込先 |
| instagramAccounts | Instagram連携済みアカウントの表示・投稿時の連携アカウント選択（Map形式：アカウントIDをキーに効率的な検索が可能） |

### バリデーションルール

| フィールド | ルール |
|-----------|--------|
| email | 有効なメールアドレス形式 |
| phone | 日本の電話番号形式（ハイフンあり/なし対応） |
| postalCode | 郵便番号形式（XXX-XXXX） |
| accountNumber | 7桁の数字 |
| accountHolder | 全角カタカナ |

---

## 2. SnsAccounts（SNS連携）

Instagram/TikTokアカウントの連携情報を管理するリソース。

### リソース定義

```typescript
interface SnsAccount {
  // === 識別情報 ===
  id: string;                    // SNS連携ID
  userId: string;                // ユーザーID（外部キー）

  // === SNS情報 ===
  platform: 'instagram' | 'tiktok';  // プラットフォーム
  platformUserId: string;        // SNS側のユーザーID
  username: string;              // ユーザー名（@example_user）
  profileUrl: string | null;     // プロフィールURL

  // === 認証情報 ===
  accessToken: string;           // アクセストークン（暗号化保存）
  refreshToken: string | null;   // リフレッシュトークン（暗号化保存）
  tokenExpiresAt: timestamp;     // トークン有効期限
  scopes: string[];              // 許可されたスコープ

  // === ステータス ===
  status: 'active' | 'expired' | 'revoked';  // 連携状態
  // active: 正常に連携中
  // expired: トークン期限切れ（再連携が必要）
  // revoked: ユーザーがSNS側で連携解除

  // === メタデータ ===
  lastSyncedAt: timestamp | null;  // 最終同期日時
  createdAt: timestamp;          // 連携日時
  updatedAt: timestamp;          // 更新日時
}
```

### 用途

| フィールド | 用途 |
|-----------|------|
| platform, username | ダッシュボードでの連携状況表示 |
| accessToken, refreshToken | API呼び出し時の認証 |
| status | 「連携済み」「要再連携」の判定 |
| followerCount | インフルエンサーの影響力把握（オプション） |

### プラットフォーム別スコープ

```typescript
// Instagram (Graph API)
const instagramScopes = [
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_insights',
];

// TikTok
const tiktokScopes = [
  'user.info.basic',
  'video.list',
  'video.insights',
];
```

---

## 3. Posts（投稿）

ユーザーが登録した商品PR投稿の情報を管理するリソース。

### リソース定義

```typescript
interface Post {
  // === 識別情報 ===
  id: string;                    // 投稿ID
  userId: string;                // ユーザーID（外部キー）
  snsAccountId: string;          // SNS連携ID（外部キー）

  // === 投稿情報 ===
  platform: 'instagram' | 'tiktok';  // プラットフォーム
  postUrl: string;               // 投稿URL
  postId: string | null;         // SNS側の投稿ID（URL解析で取得）
  productName: string;           // 商品名（自由入力）
  productId: string | null;      // 商品ID（将来の商品マスタ連携用）

  // === 日付情報 ===
  postDate: timestamp;           // 投稿登録日
  measureDate: timestamp;        // 計測予定日（postDate + 7日）

  // === 再生数情報 ===
  viewCount: number | null;      // 再生数
  likeCount: number | null;      // いいね数（オプション）
  commentCount: number | null;   // コメント数（オプション）
  shareCount: number | null;     // シェア数（オプション）

  // === ステータス ===
  status: 'pending' | 'fetching' | 'completed' | 'failed';
  // pending: 計測待ち（7日未経過）
  // fetching: 計測中（API取得処理中）
  // completed: 計測完了
  // failed: 計測失敗

  // === エラー情報 ===
  errorCode: string | null;      // エラーコード
  errorMessage: string | null;   // エラーメッセージ
  retryCount: number;            // リトライ回数

  // === メタデータ ===
  viewCountFetchedAt: timestamp | null;  // 再生数取得日時
  createdAt: timestamp;          // 作成日時
  updatedAt: timestamp;          // 更新日時
}
```

### 用途

| フィールド | 用途 |
|-----------|------|
| productName, postUrl | 投稿リストでの表示 |
| measureDate | バッチ処理での対象判定 |
| viewCount | 再生数の表示・補償計算 |
| status | 「計測中」「完了」バッジ表示 |

### ステータス遷移

```
[登録] → pending → [7日経過] → fetching → completed
                                    ↓
                                  failed → [リトライ] → fetching
```

### URL形式バリデーション

```typescript
// Instagram URL パターン
const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|reels)\/[\w-]+\/?/;

// TikTok URL パターン
const tiktokUrlPattern = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/@?[\w.-]+\/video\/\d+/;
```

---

## 4. ViewCountResults（再生数取得結果）

Cloud Functionsバッチ処理の実行結果を記録するリソース。

### リソース定義

```typescript
interface ViewCountResult {
  // === 識別情報 ===
  id: string;                    // 結果ID
  postId: string;                // 対象投稿ID（外部キー）
  batchJobId: string;            // バッチジョブID

  // === 実行情報 ===
  executedAt: timestamp;         // 実行日時
  executionDuration: number;     // 実行時間（ミリ秒）

  // === 結果情報 ===
  success: boolean;              // 成功/失敗
  viewCount: number | null;      // 取得した再生数
  likeCount: number | null;      // 取得したいいね数
  commentCount: number | null;   // 取得したコメント数

  // === エラー情報 ===
  errorCode: string | null;      // エラーコード
  errorMessage: string | null;   // エラーメッセージ
  errorDetails: object | null;   // 詳細エラー情報（デバッグ用）

  // === メタデータ ===
  createdAt: timestamp;          // 作成日時
}
```

### バッチジョブ情報

```typescript
interface BatchJob {
  // === 識別情報 ===
  id: string;                    // ジョブID
  
  // === 実行情報 ===
  startedAt: timestamp;          // 開始日時
  completedAt: timestamp | null; // 完了日時
  
  // === 統計情報 ===
  totalPosts: number;            // 対象投稿数
  successCount: number;          // 成功数
  failureCount: number;          // 失敗数
  
  // === ステータス ===
  status: 'running' | 'completed' | 'failed';
  
  // === メタデータ ===
  createdAt: timestamp;
}
```

### 用途

| フィールド | 用途 |
|-----------|------|
| success, errorCode | 失敗原因の特定・リトライ判断 |
| executionDuration | パフォーマンス監視 |
| batchJobId | ジョブ単位での分析 |

---

## 5. InstagramTokens（Instagramトークン管理）

Instagramアカウントのアクセストークン情報を管理するリソース。
セキュリティ上の理由から、トークン情報はusersコレクションとは別に管理する。

### リソース定義

```typescript
/**
 * Instagramトークン情報
 * @description アクセストークンを安全に管理するためのコレクション
 * @collection instagramAccounts（ドキュメントID = InstagramアカウントID）
 */
interface InstagramToken {
  // === 識別情報 ===
  accountId: string;             // InstagramアカウントID（ドキュメントIDと同一）
  username: string;              // ユーザー名（参照用）
  
  // === トークン情報 ===
  accessToken: string;           // 長期アクセストークン（60日有効）
  tokenExpiresAt: timestamp;     // トークン有効期限
  
  // === メタデータ ===
  createdAt: timestamp;          // 初回連携日時
  updatedAt: timestamp;          // 最終更新日時
}
```

### 用途

| フィールド | 用途 |
|-----------|------|
| accessToken | Instagram Graph APIへのリクエスト認証 |
| tokenExpiresAt | トークンリフレッシュのタイミング判定 |
| accountId | usersコレクションのinstagramAccountsキーとの紐付け |

### 補足

- **複数ユーザーが同一アカウントを連携可能**: 同じInstagramアカウントを複数のBuzzBaseユーザーが連携した場合、トークン情報は上書きされる
- **ユーザーとの紐付け**: `users`コレクションの`instagramAccounts`フィールド（Map）のキーがInstagramアカウントIDとなっており、このコレクションと紐付けが可能
- **トークンリフレッシュ**: 長期トークンは60日で期限切れになるため、定期的なリフレッシュが必要

### Instagram連携設定情報

| 項目 | 値 |
|------|-----|
| **Meta App ID** | `1395033632016244` |
| **OAuth コールバックURL** | `https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback` |
| **Cloud Function名** | `instagramCallback` |
| **リージョン** | `asia-northeast1` |
| **審査ステータス** | ✅ **承認済み**（2026年1月1日通過） - 本番環境で利用可能 |

#### OAuth スコープ

```
instagram_business_basic
instagram_business_manage_messages
instagram_business_manage_comments
instagram_business_content_publish
instagram_business_manage_insights
```

#### 認証フロー

1. フロントエンドで認証URLを生成（`state`パラメータにユーザーUIDを含める）
2. ユーザーがInstagramで認可を承認
3. Cloud Function（`instagramCallback`）がコールバックを受け取り：
   - 認可コード → 短期トークン取得
   - 短期トークン → 長期トークン取得（60日有効）
   - 長期トークン → ユーザープロフィール取得
   - `instagramAccounts`コレクションにトークン保存
   - `users`コレクションにアカウント情報保存（Map形式）
4. ダッシュボードにリダイレクト

#### 関連ドキュメント

- [Business Login for Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login) - Meta公式ドキュメント
- [IG User Reference](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user) - Instagram Graph API

---

## Firestore コレクション設計

### データベース情報

| 項目 | 値 |
|------|-----|
| **プロジェクトID** | `sincere-kit` |
| **データベースID** | `sincere-kit-buzzbase` |
| **リージョン** | `asia-northeast1`（東京） |

> ⚠️ **重要**: このプロジェクトでは名前付きデータベース（`sincere-kit-buzzbase`）を使用しています。
> Firestoreクライアントを初期化する際は、必ず`databaseId`を指定してください。

```javascript
// Cloud Functions / バックエンドでの初期化例
const firestore = new Firestore({
  projectId: 'sincere-kit',
  databaseId: 'sincere-kit-buzzbase',
});
```

### コレクション構造

```
firestore/
├── users/{userId}                    # ユーザー情報
│   └── [User fields]
│       └── instagramAccounts: {      # Map形式（キー: InstagramアカウントID）
│             [accountId]: { username, name, profile_picture_url }
│           }
│
├── instagramAccounts/{accountId}     # Instagramトークン管理（ルートコレクション）
│   └── [InstagramToken fields]       # アクセストークン、有効期限など
│
├── campaigns/{campaignId}            # キャンペーン（商品/案件）マスター
│   └── [Campaign fields]             # 商品名、ステータス、投稿済みメディアID等
│
└── prPosts/{userId}                  # PR投稿データ（ドキュメントID = ユーザーID）
    └── postData: {                   # Map形式（2階層のネスト構造）
          [accountId]: {              # キー: InstagramアカウントID
            [mediaId]: {              # キー: Instagram Media ID
              accountId, campaignId, campaignName, mediaId, mediaType,
              permalink, thumbnailUrl, postedAt, registeredAt, status,
              // インサイトデータ（バッチ処理で取得）
              dataFetchedAt, igReelsAvgWatchTime, igReelsVideoViewTotalTime,
              reach, saved, views, likes, comments
            }
          }
        }
```

> **注意**: 旧設計では `users/{userId}/posts/{postId}` のサブコレクション構造でしたが、
> 現在は `prPosts/{userId}` としてルートレベルのドキュメントにMap形式で格納しています。

### インデックス設計

```javascript
// firestore.indexes.json
{
  "indexes": [
    // 計測待ち投稿の取得（バッチ処理用）
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "measureDate", "order": "ASCENDING" }
      ]
    },
    // ユーザーの投稿一覧（新しい順）
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## API エンドポイント設計

### 認証 (Auth)

現在はFirebase Authenticationで直接処理。将来的にカスタムAPIが必要な場合：

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/auth/signup` | メールアドレスでサインアップ |
| POST | `/auth/signin` | メールアドレスでサインイン |
| POST | `/auth/signin/google` | Googleでサインイン |
| POST | `/auth/signout` | サインアウト |
| POST | `/auth/verify-email` | メール確認 |

### Users

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/users/me` | 現在のユーザー情報を取得 |
| PUT | `/users/me` | ユーザー情報を更新 |
| PATCH | `/users/me/profile` | プロフィール（名前・写真）を更新 |
| PATCH | `/users/me/address` | 住所情報を更新 |
| PATCH | `/users/me/bank-account` | 振込先情報を更新 |
| DELETE | `/users/me` | アカウントを削除 |

### SNS Accounts

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/users/me/sns-accounts` | SNS連携一覧を取得 |
| GET | `/users/me/sns-accounts/:id` | 特定のSNS連携情報を取得 |
| POST | `/users/me/sns-accounts/instagram/connect` | Instagram連携を開始 |
| POST | `/users/me/sns-accounts/tiktok/connect` | TikTok連携を開始 |
| POST | `/users/me/sns-accounts/:id/refresh` | トークンをリフレッシュ |
| DELETE | `/users/me/sns-accounts/:id` | SNS連携を解除 |

### Posts

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/users/me/posts` | 投稿一覧を取得 |
| GET | `/users/me/posts/:id` | 特定の投稿を取得 |
| POST | `/users/me/posts` | 新規投稿を登録 |
| PUT | `/users/me/posts/:id` | 投稿情報を更新 |
| DELETE | `/users/me/posts/:id` | 投稿を削除 |

### View Count (バッチ処理)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/batch/view-count/run` | 再生数取得バッチを手動実行 |
| GET | `/batch/view-count/jobs` | バッチジョブ履歴を取得 |
| GET | `/batch/view-count/jobs/:id` | 特定のジョブ詳細を取得 |

---

## 📝 リクエスト/レスポンス例

### POST /users/me/posts

新規投稿の登録リクエスト：

```json
// Request
{
  "platform": "instagram",
  "productName": "〇〇化粧水",
  "postUrl": "https://www.instagram.com/reel/ABC123xyz/"
}

// Response
{
  "id": "post_abc123",
  "userId": "user_xyz789",
  "platform": "instagram",
  "productName": "〇〇化粧水",
  "postUrl": "https://www.instagram.com/reel/ABC123xyz/",
  "postId": "ABC123xyz",
  "postDate": "2025-12-22T10:00:00Z",
  "measureDate": "2025-12-29T10:00:00Z",
  "viewCount": null,
  "status": "pending",
  "createdAt": "2025-12-22T10:00:00Z",
  "updatedAt": "2025-12-22T10:00:00Z"
}
```

### GET /users/me/posts

投稿一覧の取得レスポンス：

```json
{
  "data": [
    {
      "id": "post_abc123",
      "platform": "instagram",
      "productName": "〇〇化粧水",
      "postUrl": "https://www.instagram.com/reel/ABC123xyz/",
      "viewCount": 15420,
      "status": "completed",
      "measureDate": "2025-12-29T10:00:00Z",
      "createdAt": "2025-12-22T10:00:00Z"
    },
    {
      "id": "post_def456",
      "platform": "tiktok",
      "productName": "△△スキンケアセット",
      "postUrl": "https://www.tiktok.com/@user/video/123456",
      "viewCount": null,
      "status": "pending",
      "measureDate": "2025-12-30T10:00:00Z",
      "createdAt": "2025-12-23T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "perPage": 20,
    "hasNextPage": false
  }
}
```

---

## 🔗 関連ドキュメント

- [アプリ開発概要.md](../アプリ開発概要.md) - 機能詳細・要件定義
- [DASHBOARD_TODO.md](./DASHBOARD_TODO.md) - ダッシュボード機能開発TODO
- [types/index.ts](../frontend/src/types/index.ts) - TypeScript型定義

---

## 📝 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-22 | 初版作成 - 全リソースのRESTful設計 |
| 2025-12-24 | リソース一覧を実態に合わせて更新（InstagramAccounts, Campaigns, PRPosts を追加、廃止リソースを明記） |
| 2025-12-24 | Firestoreコレクション設計を実態（prPostsのMap構造）に合わせて更新 |
| 2026-01-01 | Meta社のInstagram API審査通過を反映 |

