// =============================================================================
// BuzzBase - Type Definitions
// =============================================================================

/**
 * Instagram連携アカウント情報（Map形式のValue）
 * @see https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user
 * @see docs/API_RESOURCES.md - Users リソース定義
 */
export interface InstagramAccountInfo {
  username: string; // ユーザー名（例: "example_user"）
  name: string; // プロフィール名（表示名）
  profilePictureUrl: string; // プロフィール画像URL
}

/**
 * Instagram連携アカウント（Map形式）
 * キー: InstagramアカウントID
 * 値: InstagramAccountInfo
 */
export type InstagramAccountsMap = Record<string, InstagramAccountInfo>;

/**
 * Instagram連携アカウント情報（UI表示用にaccountIdを含む）
 */
export interface InstagramAccountWithId extends InstagramAccountInfo {
  accountId: string; // InstagramアカウントID
}

/**
 * ユーザー情報
 * @see docs/API_RESOURCES.md - Users リソース定義
 */
export interface UserProfile {
  // === 識別情報 ===
  uid: string; // ユーザーID（Firebase Auth UID）

  // === 基本情報（認証時に取得） ===
  email: string; // メールアドレス
  displayName: string | null; // 表示名
  photoURL: string | null; // プロフィール画像URL

  // === 連絡先情報 ===
  phone: string | null; // 電話番号

  // === 住所情報 ===
  address: {
    postalCode: string; // 郵便番号（例: "123-4567"）
    prefecture: string; // 都道府県（例: "東京都"）
    city: string; // 市区町村（例: "渋谷区"）
    street: string; // 番地（例: "〇〇1-2-3"）
    building: string | null; // 建物名・部屋番号
  } | null;

  // === 振込先情報 ===
  bankAccount: {
    bankName: string; // 銀行名（例: "みずほ銀行"）
    bankCode: string; // 銀行コード（例: "0001"）
    branchName: string; // 支店名（例: "渋谷支店"）
    branchCode: string; // 支店コード（例: "001"）
    accountType: 'ordinary' | 'checking'; // 口座種別（普通/当座）
    accountNumber: string; // 口座番号（例: "1234567"）
    accountHolder: string; // 口座名義（カタカナ）
  } | null;

  // === Instagram連携情報 ===
  instagramAccounts: InstagramAccountsMap; // 連携済みInstagramアカウント（Map形式）

  // === メタデータ ===
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
  lastLoginAt?: Date; // 最終ログイン日時
}

/**
 * ユーザープロフィール更新用の入力型
 */
export interface UserProfileUpdateInput {
  displayName?: string | null;
  phone?: string | null;
  address?: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building: string | null;
  } | null;
  bankAccount?: {
    bankName: string;
    bankCode: string;
    branchName: string;
    branchCode: string;
    accountType: 'ordinary' | 'checking';
    accountNumber: string;
    accountHolder: string;
  } | null;
}

/**
 * SNSアカウント連携情報
 */
export interface SnsAccount {
  id: string;
  userId: string;
  platform: 'instagram' | 'tiktok';
  username: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  connected: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 投稿情報
 */
export interface Post {
  id: string;
  userId: string;
  platform: 'instagram' | 'tiktok';
  productName: string;
  postUrl: string;
  postId?: string; // SNSから取得した投稿ID
  postDate: Date;
  viewCountTargetDate: Date; // 7日後の日付
  viewCount?: number;
  viewCountFetchedAt?: Date;
  status: 'pending' | 'fetching' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 投稿登録フォームの入力値
 */
export interface PostFormInput {
  platform: 'instagram' | 'tiktok';
  productName: string;
  postUrl: string;
}

/**
 * APIエラーレスポンス
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * 再生数取得バッチの結果
 */
export interface ViewCountBatchResult {
  postId: string;
  success: boolean;
  viewCount?: number;
  error?: string;
  fetchedAt: Date;
}

// =============================================================================
// Instagram API Related Types
// =============================================================================

/**
 * Instagram Graph APIから取得したメディア情報
 * @see https://developers.facebook.com/docs/instagram-platform/reference/instagram-media
 */
export interface InstagramMedia {
  id: string; // メディアID
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'; // メディアタイプ
  media_url?: string; // メディアURL（IMAGE, VIDEO）
  thumbnail_url?: string; // サムネイルURL（VIDEOのみ）
  timestamp: string; // 投稿日時（ISO 8601形式）
  permalink?: string; // 投稿のパーマリンク
  caption?: string; // キャプション
}

/**
 * Instagram Graph APIのmediaエッジレスポンス
 */
export interface InstagramMediaResponse {
  media: {
    data: InstagramMedia[];
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
      next?: string;
      previous?: string;
    };
  };
  id: string; // ユーザーID
}
