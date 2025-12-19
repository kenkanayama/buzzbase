// =============================================================================
// BuzzBase - Type Definitions
// =============================================================================

/**
 * ユーザー情報
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  address?: {
    postalCode: string;
    prefecture: string;
    city: string;
    street: string;
    building?: string;
  };
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountType: 'ordinary' | 'checking';
    accountNumber: string;
    accountHolder: string;
  };
  createdAt: Date;
  updatedAt: Date;
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
