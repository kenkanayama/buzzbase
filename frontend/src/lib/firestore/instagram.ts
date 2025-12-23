/**
 * Firestore Instagram操作ユーティリティ
 * @see docs/API_RESOURCES.md - InstagramTokens リソース
 */
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * InstagramアカウントのFirestoreドキュメント型
 */
export interface InstagramAccountDocument {
  accountId: string;
  username: string;
  accessToken: string;
  tokenExpiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Firestore Timestamp を Date に変換
 */
function timestampToDate(timestamp: Timestamp | undefined | null): Date | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate();
}

/**
 * InstagramアカウントのアクセストークンをFirestoreから取得
 * @param accountId - InstagramアカウントID
 * @returns InstagramAccountDocument | null
 */
export async function getInstagramAccountToken(
  accountId: string
): Promise<InstagramAccountDocument | null> {
  if (!db) {
    console.error('Firestore が初期化されていません');
    return null;
  }

  try {
    const accountRef = doc(db, 'instagramAccounts', accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      console.error(`Instagram アカウント ${accountId} が見つかりません`);
      return null;
    }

    const data = accountSnap.data();
    return {
      accountId,
      username: (data.username as string) || '',
      accessToken: (data.accessToken as string) || '',
      tokenExpiresAt: timestampToDate(data.tokenExpiresAt as Timestamp) || new Date(),
      createdAt: timestampToDate(data.createdAt as Timestamp) || new Date(),
      updatedAt: timestampToDate(data.updatedAt as Timestamp) || new Date(),
    };
  } catch (error) {
    console.error('Instagram アカウント情報の取得に失敗しました:', error);
    throw error;
  }
}

