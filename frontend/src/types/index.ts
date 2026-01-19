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
  media_product_type?: string; // メディア製品タイプ（FEED, REELS, STORY等）
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

// =============================================================================
// Campaign Related Types
// =============================================================================

/**
 * SNSプラットフォームの種類
 */
export type SNSPlatform = 'instagram' | 'tiktok';

/**
 * SNS媒体ごとの投稿メディアID
 * 各プラットフォームごとにメディアIDの配列を保持
 */
export interface PostedMediaByPlatform {
  instagram?: string[]; // InstagramのメディアID配列
  tiktok?: string[]; // TikTokのメディアID配列（将来対応予定）
}

/**
 * キャンペーン（商品/案件）情報
 * Firestore: campaigns コレクション
 */
export interface Campaign {
  id: string; // ドキュメントID
  name: string; // 商品/案件名（例: "チョコレート新商品PR"）
  description?: string; // 説明
  imageUrl?: string; // 商品画像URL
  status: 'active' | 'inactive'; // ステータス
  startDate?: Date; // 開始日
  endDate?: Date; // 終了日
  postedMedia?: PostedMediaByPlatform; // SNS媒体ごとの投稿メディアID（重複なし）
  createdAt: Date; // 作成日時
  updatedAt?: Date; // 更新日時
}

// =============================================================================
// PR Post Related Types
// =============================================================================

/**
 * PR投稿データ（個別の投稿情報）
 * 新構造: postData[accountId][mediaId] にこのオブジェクトが格納される
 */
export interface PRPostItem {
  accountId: string; // InstagramアカウントID
  campaignId: string; // 商品/案件ID
  campaignName: string; // 商品/案件名（スナップショット）
  mediaId: string; // Instagram Media ID
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'; // メディアタイプ
  permalink: string; // 投稿URL
  thumbnailUrl?: string; // サムネイル画像URL
  postedAt: Date; // 投稿日時（日本時間）
  mediaProductType?: string; // メディア製品タイプ（FEED, REELS, STORY等）

  // 計測データ
  dataFetchedAt?: Date; // データ取得日時（日本時間）
  igReelsAvgWatchTime?: number; // リールの平均視聴時間
  igReelsVideoViewTotalTime?: number; // リールの総視聴時間
  reach?: number; // リーチ数
  saved?: number; // 保存数
  shares?: number; // シェア数
  views?: number; // 再生数
  likes?: number; // いいね数
  comments?: number; // コメント数

  // メタデータ
  registeredAt: Date; // バズベース登録日時（日本時間）
  status: 'fetching' | 'measured'; // ステータス
}

/**
 * メディアIDをキーとしたPR投稿データのMap
 * キー: Instagram Media ID
 * 値: PRPostItem
 */
export type MediaPostMap = Record<string, PRPostItem>;

/**
 * PR投稿データ（アカウントIDをキーとしたMap形式）
 * キー: InstagramアカウントID
 * 値: MediaPostMap（メディアIDをキーとしたPR投稿データ）
 */
export type PRPostDataMap = Record<string, MediaPostMap>;

/**
 * PR投稿ドキュメント
 * Firestore: prPosts コレクション（ドキュメントID = userId）
 */
export interface PRPostDocument {
  userId: string; // Firebase UID
  postData: PRPostDataMap; // アカウントIDをキーとした投稿データ
}

/**
 * PR投稿登録用の入力型
 */
export interface PRPostRegisterInput {
  campaignId: string;
  campaignName: string;
  mediaId: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
  thumbnailUrl?: string;
  postedAt: Date;
  mediaProductType?: string; // メディア製品タイプ（FEED, REELS, STORY等）
}
