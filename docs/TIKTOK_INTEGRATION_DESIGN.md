# TikTok連携機能 設計書

> 作成日: 2025年1月27日  
> 対象環境: サンドボックス環境

## 📋 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [アーキテクチャ](#アーキテクチャ)
4. [データモデル](#データモデル)
5. [実装詳細](#実装詳細)
6. [セキュリティ](#セキュリティ)
7. [エラーハンドリング](#エラーハンドリング)
8. [実装チェックリスト](#実装チェックリスト)
9. [参考資料](#参考資料)

---

## 概要

### 目的

BuzzBaseアプリにTikTok連携機能を追加し、Instagram連携と同様にTikTokアカウントの連携、投稿取得、データ計測を可能にする。

### 対象環境

- **環境**: サンドボックス環境
- **アプリ名**: バズベース
- **Client Key**: `sbawmsbtoxbwwp81ea`
- **Client Secret**: `5D62Ro8bpHhjzi5zW5Kb67aijD5djQDE`

### 実装範囲

1. **OAuth認証フロー**
   - 認証URL生成
   - 認証コールバック処理
   - アクセストークン取得・保存

2. **アカウント管理**
   - TikTokアカウント情報の表示
   - 複数アカウント連携対応
   - アカウント解除機能

3. **投稿取得機能**
   - TikTok投稿一覧取得
   - 投稿サムネイル表示
   - 投稿選択・登録

4. **トークン管理**
   - アクセストークン自動更新（リフレッシュ）
   - トークン期限切れ時の再連携促進

---

## 前提条件

### TikTok for Developers設定

- ✅ アプリ「バズベース」を登録済み
- ✅ サンドボックス環境を作成済み
- ✅ Client Key / Client Secret を取得済み

### 必要な設定（実装前に確認）

1. **リダイレクトURIの登録**
   - TikTok for DevelopersコンソールでリダイレクトURIを登録
   - 例: `https://asia-northeast1-sincere-kit.cloudfunctions.net/tiktokCallback`

2. **スコープの確認**
   - 必要なスコープを確認・申請
   - 基本スコープ: `user.info.basic`, `video.list`

3. **Secret Managerへの保存**
   - Client SecretをSecret Managerに保存

---

## アーキテクチャ

### 全体フロー

```
┌─────────────┐
│  フロントエンド  │
│  (React)    │
└──────┬──────┘
       │ 1. 認証URL生成
       │    (state=userId)
       ▼
┌─────────────────────┐
│  TikTok認証サーバー   │
│  (OAuth 2.0)        │
└──────┬──────────────┘
       │ 2. ユーザー認証
       │ 3. 認可コード返却
       ▼
┌─────────────────────┐
│  Cloud Functions     │
│  (tiktokCallback)    │
└──────┬──────────────┘
       │ 4. 認可コード → アクセストークン
       │ 5. ユーザー情報取得
       │ 6. Firestore保存
       ▼
┌─────────────────────┐
│  Firestore           │
│  - users             │
│  - tiktokAccounts    │
└─────────────────────┘
```

### コンポーネント構成

```
frontend/
├── src/
│   ├── lib/
│   │   └── api/
│   │       └── tiktok.ts          # TikTok APIクライアント
│   ├── pages/
│   │   ├── DashboardPage.tsx     # ダッシュボード（連携ボタン追加）
│   │   └── RegisterPostPage.tsx   # 投稿登録（TikTok対応）
│   └── types/
│       └── index.ts               # 型定義追加
│
terraform/
├── functions/
│   └── index.js                  # Cloud Functions（tiktokCallback追加）
└── cloud_functions.tf             # 関数定義
```

---

## データモデル

### 1. Firestore: `users` コレクション

既存の `users` コレクションに `tiktokAccounts` フィールドを追加。

```typescript
interface UserProfile {
  // ... 既存フィールド ...
  
  // TikTok連携情報（Map形式）
  tiktokAccounts: TikTokAccountsMap;
}

// TikTok連携アカウント情報（Map形式のValue）
interface TikTokAccountInfo {
  username: string;              // ユーザー名（例: "example_user"）
  displayName: string;            // 表示名
  profilePictureUrl: string;      // プロフィール画像URL
  openId: string;                 // TikTok Open ID
}

// TikTok連携アカウント（Map形式）
// キー: TikTok Open ID
// 値: TikTokAccountInfo
type TikTokAccountsMap = Record<string, TikTokAccountInfo>;
```

### 2. Firestore: `tiktokAccounts` コレクション（新規）

トークン情報を保存する専用コレクション。

```typescript
interface TikTokAccountDocument {
  openId: string;                 // TikTok Open ID（ドキュメントID）
  userId: string;                 // Firebase UID
  accessToken: string;            // アクセストークン
  refreshToken: string;           // リフレッシュトークン
  tokenExpiresAt: Date;           // アクセストークン有効期限（24時間）
  refreshExpiresAt: Date;         // リフレッシュトークン有効期限（365日）
  scope: string;                  // 許可されたスコープ（カンマ区切り）
  createdAt: Date;                // 作成日時
  updatedAt: Date;                // 更新日時
}
```

### 3. 型定義: `frontend/src/types/index.ts`

```typescript
// TikTok連携アカウント情報
export interface TikTokAccountInfo {
  username: string;
  displayName: string;
  profilePictureUrl: string;
  openId: string;
}

export type TikTokAccountsMap = Record<string, TikTokAccountInfo>;

export interface TikTokAccountWithId extends TikTokAccountInfo {
  accountId: string; // TikTok Open ID
}

// TikTok投稿情報
export interface TikTokVideo {
  id: string;                      // 動画ID
  title: string;                   // タイトル
  cover_image_url: string;         // サムネイルURL
  share_url: string;               // 共有URL
  create_time: number;             // 作成日時（Unix timestamp）
  video_description?: string;       // 説明文
  duration: number;                 // 動画長（秒）
  view_count?: number;              // 再生数（取得可能な場合）
  like_count?: number;              // いいね数（取得可能な場合）
  comment_count?: number;           // コメント数（取得可能な場合）
}

export interface TikTokVideoResponse {
  videos: {
    data: TikTokVideo[];
    cursor?: string;               // ページネーション用カーソル
    has_more: boolean;              // 次のページがあるか
  };
}
```

---

## 実装詳細

### 1. フロントエンド実装

#### 1-1. 認証URL生成 (`DashboardPage.tsx`)

```typescript
// TikTok認証URLを生成
const handleTikTokConnect = () => {
  if (!user) return;

  const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  authUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
  authUrl.searchParams.set('scope', TIKTOK_SCOPES);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
  authUrl.searchParams.set('state', user.uid); // ユーザーIDをstateに設定

  window.location.href = authUrl.toString();
};
```

**定数定義**:
```typescript
const TIKTOK_CLIENT_KEY = 'sbawmsbtoxbwwp81ea';
const TIKTOK_REDIRECT_URI = 'https://asia-northeast1-sincere-kit.cloudfunctions.net/tiktokCallback';
const TIKTOK_SCOPES = 'user.info.basic,video.list';
```

#### 1-2. TikTok APIクライアント (`frontend/src/lib/api/tiktok.ts`)

```typescript
/**
 * TikTok API クライアント
 * バックエンド（Cloud Functions）経由でTikTok APIを呼び出す
 */

import { auth } from '@/lib/firebase';
import { TikTokVideoResponse } from '@/types';

const CLOUD_FUNCTIONS_BASE_URL =
  import.meta.env.VITE_CLOUD_FUNCTIONS_BASE_URL ||
  'https://asia-northeast1-sincere-kit.cloudfunctions.net';

async function getIdToken(): Promise<string> {
  if (!auth || !auth.currentUser) {
    throw new Error('認証が必要です。ログインしてください。');
  }
  return await auth.currentUser.getIdToken();
}

/**
 * TikTok投稿一覧を取得
 * @param openId - TikTok Open ID
 * @returns TikTok投稿一覧
 */
export async function getTikTokVideos(openId: string): Promise<TikTokVideoResponse> {
  if (!openId) {
    throw new Error('openIdが必要です');
  }

  const idToken = await getIdToken();
  const url = `${CLOUD_FUNCTIONS_BASE_URL}/getTikTokVideos?openId=${encodeURIComponent(openId)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * サムネイル画像をCloud Storageに保存
 * @param thumbnailUrl - TikTok APIから取得したサムネイルURL
 * @param openId - TikTok Open ID
 * @param videoId - TikTok Video ID
 * @returns Cloud Storageの公開URL
 */
export async function saveTikTokThumbnailToStorage(
  thumbnailUrl: string,
  openId: string,
  videoId: string
): Promise<string> {
  if (!thumbnailUrl || !openId || !videoId) {
    throw new Error('必要なパラメータが不足しています');
  }

  const idToken = await getIdToken();
  const url = `${CLOUD_FUNCTIONS_BASE_URL}/saveTikTokThumbnailToStorage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      thumbnailUrl,
      openId,
      videoId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: '不明なエラー' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}
```

#### 1-3. ダッシュボードへの連携ボタン追加

`DashboardPage.tsx` にTikTok連携ボタンを追加（Instagram連携ボタンの隣）。

#### 1-4. 投稿登録ページの拡張

`RegisterPostPage.tsx` を拡張してTikTok投稿も選択・登録できるようにする。

### 2. バックエンド実装（Cloud Functions）

#### 2-1. OAuthコールバック処理 (`terraform/functions/index.js`)

```javascript
/**
 * TikTok認証コールバック
 * HTTPトリガー（GET）
 */
exports.tiktokCallback = async (req, res) => {
  // CORSヘッダー設定
  res.set('Access-Control-Allow-Origin', '*');

  // プリフライトリクエスト対応
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const { code, state, error, error_description } = req.query;

  console.log('TikTok callback received:', {
    hasCode: !!code,
    state,
    error,
    error_description,
  });

  // エラーチェック
  if (error) {
    console.error('TikTok認証エラー:', error, error_description);
    return res.redirect(`${FRONTEND_URL}/dashboard?error=tiktok_denied`);
  }

  // パラメータチェック
  if (!code) {
    console.error('認可コードがありません');
    return res.redirect(`${FRONTEND_URL}/dashboard?error=missing_code`);
  }

  if (!state) {
    console.error('stateパラメータがありません');
    return res.redirect(`${FRONTEND_URL}/dashboard?error=missing_state`);
  }

  try {
    const userId = state;
    const redirectUri = TIKTOK_CALLBACK_URL;

    // 1. Client Secretを取得
    const clientSecret = await getTikTokClientSecret();

    // 2. 認可コードをアクセストークンに交換
    console.log('認可コードをトークンに交換中...');
    const tokenData = await exchangeTikTokCodeForToken(code, redirectUri, clientSecret);
    console.log('トークン交換成功');

    const { access_token, refresh_token, expires_in, refresh_expires_in, scope, open_id } = tokenData;

    // 3. TikTokユーザー情報を取得
    console.log('ユーザー情報取得中...');
    const userInfo = await getTikTokUserInfo(access_token, open_id);
    console.log('ユーザー情報取得成功:', userInfo.display_name);

    // 4. プロフィール画像をCloud Storageに保存
    console.log('プロフィール画像をCloud Storageに保存中...');
    const storedImageUrl = await saveProfileImageToStorage(open_id, userInfo.avatar_url, 'tiktok');

    // 5. Firestoreに保存
    console.log('Firestoreに保存中...');

    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);
    const refreshExpiresAt = new Date(Date.now() + refresh_expires_in * 1000);

    // 5a. tiktokAccountsコレクションにトークン情報を保存
    await firestore.collection('tiktokAccounts').doc(open_id).set({
      openId: open_id,
      userId: userId,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiresAt: tokenExpiresAt,
      refreshExpiresAt: refreshExpiresAt,
      scope: scope,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // 5b. usersコレクションにアカウント情報を保存
    await firestore.collection('users').doc(userId).set({
      tiktokAccounts: {
        [open_id]: {
          username: userInfo.display_name,
          displayName: userInfo.display_name,
          profilePictureUrl: storedImageUrl,
          openId: open_id,
        },
      },
    }, { merge: true });

    console.log('保存完了');
    return res.redirect(`${FRONTEND_URL}/dashboard?success=tiktok_connected`);

  } catch (err) {
    console.error('TikTok連携エラー:', err);
    return res.redirect(`${FRONTEND_URL}/dashboard?error=tiktok_connection_failed`);
  }
};
```

#### 2-2. トークン交換関数

```javascript
/**
 * 認可コードをアクセストークンに交換
 */
async function exchangeTikTokCodeForToken(code, redirectUri, clientSecret) {
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('トークン交換エラー:', errorText);
    throw new Error('トークン交換に失敗しました');
  }

  return response.json();
}

/**
 * TikTokユーザー情報を取得
 */
async function getTikTokUserInfo(accessToken, openId) {
  const url = `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ユーザー情報取得エラー:', errorText);
    throw new Error('ユーザー情報の取得に失敗しました');
  }

  const data = await response.json();
  return data.data.user;
}
```

#### 2-3. 投稿取得関数

```javascript
/**
 * TikTok投稿一覧を取得
 */
async function getTikTokVideos(openId, accessToken) {
  const url = `https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time,video_description,duration`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('投稿取得エラー:', errorText);
    throw new Error('投稿の取得に失敗しました');
  }

  return response.json();
}

/**
 * TikTok投稿取得エンドポイント
 * HTTPトリガー（GET）
 */
exports.getTikTokVideos = async (req, res) => {
  // CORS設定
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.status(204).send('');
    return;
  }

  try {
    // Firebase認証チェック
    const idToken = req.headers.authorization?.replace('Bearer ', '');
    if (!idToken) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { openId } = req.query;
    if (!openId) {
      return res.status(400).json({ error: 'openIdが必要です' });
    }

    // トークン情報を取得
    const accountDoc = await firestore.collection('tiktokAccounts').doc(openId).get();
    if (!accountDoc.exists) {
      return res.status(404).json({ error: 'TikTokアカウントが見つかりません' });
    }

    const accountData = accountDoc.data();
    if (accountData.userId !== userId) {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }

    // トークンが期限切れの場合はリフレッシュ
    let accessToken = accountData.accessToken;
    if (new Date(accountData.tokenExpiresAt.toDate()) < new Date()) {
      console.log('トークンをリフレッシュ中...');
      const refreshedToken = await refreshTikTokToken(accountData.refreshToken);
      accessToken = refreshedToken.access_token;
      
      // 更新されたトークンを保存
      await firestore.collection('tiktokAccounts').doc(openId).update({
        accessToken: refreshedToken.access_token,
        refreshToken: refreshedToken.refresh_token || accountData.refreshToken,
        tokenExpiresAt: new Date(Date.now() + refreshedToken.expires_in * 1000),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // 投稿を取得
    const videosData = await getTikTokVideos(openId, accessToken);
    res.json(videosData);

  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: error.message || 'サーバーエラー' });
  }
};
```

#### 2-4. トークンリフレッシュ関数

```javascript
/**
 * リフレッシュトークンでアクセストークンを更新
 */
async function refreshTikTokToken(refreshToken) {
  const clientSecret = await getTikTokClientSecret();
  
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('トークンリフレッシュエラー:', errorText);
    throw new Error('トークンリフレッシュに失敗しました');
  }

  return response.json();
}
```

### 3. Terraform設定

#### 3-1. Secret Manager設定

**✅ 完了**: `tiktok-client-secret`という名前でSecret Managerに保存済み

TerraformでSecret Managerリソースを定義（`terraform/secrets.tf`）:

```hcl
# -----------------------------------------------------------------------------
# TikTok App Secrets
# -----------------------------------------------------------------------------

resource "google_secret_manager_secret" "tiktok_client_secret" {
  secret_id = "tiktok-client-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}
```

**注意**: シークレットの値は既にGCP Consoleまたはgcloud CLIで設定済みのため、Terraformではリソースの存在のみを管理します。

#### 3-2. Cloud Functions設定 (`terraform/cloud_functions.tf`)

既存の `instagramCallback` 関数と同様に `tiktokCallback` 関数を追加。

---

## セキュリティ

### 1. クレデンシャル管理

- **Client Secret**: Secret Managerに保存
- **アクセストークン**: Firestoreに保存（暗号化は検討事項）

### 2. 認証・認可

- Firebase Authenticationでユーザー認証
- ユーザーIDとOpen IDの紐付けを確認
- 他ユーザーのデータにアクセスできないように制御

### 3. CORS設定

- Cloud Functionsで適切なCORSヘッダーを設定
- 本番環境では特定ドメインのみ許可

---

## エラーハンドリング

### 1. OAuth認証エラー

- ユーザーが認証を拒否した場合: `error=tiktok_denied`
- 認可コードが無効: `error=invalid_code`
- リダイレクトURI不一致: `error=redirect_uri_mismatch`

### 2. API呼び出しエラー

- トークン期限切れ: 自動リフレッシュを試行
- リフレッシュ失敗: 再連携を促すエラーメッセージ
- APIレート制限: 適切なエラーメッセージとリトライ推奨

### 3. Firestoreエラー

- ドキュメント不存在: 404エラー
- 権限エラー: 403エラー
- ネットワークエラー: リトライ推奨

---

## 実装チェックリスト

### フロントエンド

- [ ] 型定義の追加 (`frontend/src/types/index.ts`)
  - [ ] `TikTokAccountInfo`
  - [ ] `TikTokAccountsMap`
  - [ ] `TikTokAccountWithId`
  - [ ] `TikTokVideo`
  - [ ] `TikTokVideoResponse`

- [ ] APIクライアントの実装 (`frontend/src/lib/api/tiktok.ts`)
  - [ ] `getTikTokVideos()`
  - [ ] `saveTikTokThumbnailToStorage()`

- [ ] ダッシュボードの拡張 (`frontend/src/pages/DashboardPage.tsx`)
  - [ ] TikTok連携ボタンの追加
  - [ ] 連携済みTikTokアカウントの表示
  - [ ] アカウント解除機能

- [ ] 投稿登録ページの拡張 (`frontend/src/pages/RegisterPostPage.tsx`)
  - [ ] TikTokアカウント選択
  - [ ] TikTok投稿取得・表示
  - [ ] TikTok投稿の登録

### バックエンド

- [x] Secret Manager設定
  - [x] Client Secretの保存（`tiktok-client-secret`として保存済み）
  - [x] Terraformリソース定義（`terraform/secrets.tf`）

- [ ] Cloud Functions実装 (`terraform/functions/index.js`)
  - [ ] `tiktokCallback()` - OAuthコールバック処理
  - [ ] `exchangeTikTokCodeForToken()` - トークン交換
  - [ ] `getTikTokUserInfo()` - ユーザー情報取得
  - [ ] `getTikTokVideos()` - 投稿取得
  - [ ] `refreshTikTokToken()` - トークンリフレッシュ
  - [ ] `getTikTokVideos` HTTPエンドポイント
  - [ ] `saveTikTokThumbnailToStorage` HTTPエンドポイント

- [ ] Terraform設定 (`terraform/cloud_functions.tf`)
  - [ ] `tiktokCallback` 関数の定義
  - [ ] `getTikTokVideos` 関数の定義
  - [ ] `saveTikTokThumbnailToStorage` 関数の定義
  - [ ] IAM権限の設定

### テスト

- [ ] OAuth認証フローのテスト
- [ ] 投稿取得のテスト
- [ ] トークンリフレッシュのテスト
- [ ] エラーハンドリングのテスト

### ドキュメント

- [ ] API仕様書の更新
- [ ] 開発ガイドの更新

---

## 参考資料

### 公式ドキュメント

- [TikTok Login Kit for Web](https://developers.tiktok.com/doc/login-kit-web?enter_method=left_navigation)
- [TikTok OAuth User Access Token Management](https://developers.tiktok.com/doc/oauth-user-access-token-management)
- [TikTok Server API - Video List](https://developers.tiktok.com/doc/server-api-video-list)

### プロジェクト内ドキュメント

- `docs/API_RESOURCES.md` - APIリソース定義
- `docs/DEVELOPMENT_ROADMAP.md` - 開発ロードマップ
- `docs/DEVELOPMENT.md` - 開発ガイド

### 既存実装の参考

- `frontend/src/lib/api/instagram.ts` - Instagram APIクライアント
- `terraform/functions/index.js` - Instagram OAuth実装
- `frontend/src/pages/DashboardPage.tsx` - Instagram連携UI

---

## 注意事項

### サンドボックス環境の制限

- サンドボックス環境では、**自分自身のTikTokアカウントのみ**連携可能
- 他のユーザーのアカウントは連携できない
- 本番環境への移行時は、アプリレビューが必要

### トークン有効期限

- **アクセストークン**: 24時間
- **リフレッシュトークン**: 365日
- リフレッシュトークンも期限切れになった場合は、再連携が必要

### スコープの制限

- サンドボックス環境では、一部のスコープが制限される可能性がある
- 本番環境では、必要なスコープを申請・承認する必要がある

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-01-27 | 初版作成 |

