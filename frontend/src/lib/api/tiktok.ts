/**
 * TikTok API クライアント
 * バックエンド（Cloud Functions）経由でTikTok APIを呼び出す
 */

import { auth } from '@/lib/firebase';
import { TikTokVideoResponse } from '@/types';

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
 * TikTok投稿一覧を取得
 * @param openId - TikTok Open ID
 * @returns TikTok投稿一覧
 */
export async function getTikTokVideos(openId: string): Promise<TikTokVideoResponse> {
  if (!openId) {
    throw new Error('openIdが必要です');
  }

  // Firebase IDトークンを取得
  const idToken = await getIdToken();

  // バックエンドAPIを呼び出し
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

  const data: TikTokVideoResponse = await response.json();
  return data;
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
  if (!thumbnailUrl) {
    throw new Error('thumbnailUrlが必要です');
  }
  if (!openId) {
    throw new Error('openIdが必要です');
  }
  if (!videoId) {
    throw new Error('videoIdが必要です');
  }

  // Firebase IDトークンを取得
  const idToken = await getIdToken();

  // バックエンドAPIを呼び出し
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
