/**
 * Instagram API クライアント
 * バックエンド（Cloud Functions）経由でInstagram APIを呼び出す
 */

import { auth } from '@/lib/firebase';
import { InstagramMediaResponse } from '@/types';

// Cloud FunctionsのベースURL
// 環境変数から取得、デフォルトは本番環境のURL
const CLOUD_FUNCTIONS_BASE_URL =
  import.meta.env.VITE_CLOUD_FUNCTIONS_BASE_URL ||
  'https://asia-northeast1-sincere-kit.cloudfunctions.net';

/**
 * Firebase IDトークンを取得
 */
async function getIdToken(): Promise<string> {
  if (!auth || !auth.currentUser) {
    throw new Error('認証が必要です。ログインしてください。');
  }
  const token = await auth.currentUser.getIdToken();
  return token;
}

/**
 * Instagram投稿一覧を取得
 * @param accountId - InstagramアカウントID
 * @returns Instagram投稿一覧
 */
export async function getInstagramMedia(accountId: string): Promise<InstagramMediaResponse> {
  if (!accountId) {
    throw new Error('accountIdが必要です');
  }

  // Firebase IDトークンを取得
  const idToken = await getIdToken();

  // バックエンドAPIを呼び出し
  const url = `${CLOUD_FUNCTIONS_BASE_URL}/getInstagramMedia?accountId=${encodeURIComponent(accountId)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data: InstagramMediaResponse = await response.json();
  return data;
}

/**
 * サムネイル画像をCloud Storageに保存
 * @param thumbnailUrl - Instagram APIから取得したサムネイルURL
 * @param accountId - InstagramアカウントID
 * @param mediaId - Instagram Media ID
 * @returns Cloud Storageの公開URL
 */
export async function saveThumbnailToStorage(
  thumbnailUrl: string,
  accountId: string,
  mediaId: string
): Promise<string> {
  if (!thumbnailUrl) {
    throw new Error('thumbnailUrlが必要です');
  }
  if (!accountId) {
    throw new Error('accountIdが必要です');
  }
  if (!mediaId) {
    throw new Error('mediaIdが必要です');
  }

  // Firebase IDトークンを取得
  const idToken = await getIdToken();

  // バックエンドAPIを呼び出し
  const url = `${CLOUD_FUNCTIONS_BASE_URL}/saveThumbnailToStorage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      thumbnailUrl,
      accountId,
      mediaId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.url;
}
