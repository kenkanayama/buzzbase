/**
 * Firestore PR投稿操作ユーティリティ
 * prPosts コレクションの CRUD 操作
 */
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PRPostDocument,
  PRPostItem,
  PRPostRegisterInput,
  PRPostDataMap,
  MediaPostMap,
} from '@/types';
import { addMediaIdToCampaign } from './campaigns';

/**
 * Firestore Timestamp を Date に変換
 */
function timestampToDate(timestamp: Timestamp | undefined | null): Date | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate();
}

/**
 * Firestore の postData を PRPostDataMap 型に変換
 * 新構造: postData[accountId][mediaId] = PRPostItem
 */
function parsePostData(data: unknown): PRPostDataMap {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  const result: PRPostDataMap = {};
  const dataRecord = data as Record<string, unknown>;

  for (const [accountId, mediaPosts] of Object.entries(dataRecord)) {
    // 新構造: mediaPosts は mediaId をキーとしたオブジェクト
    if (mediaPosts && typeof mediaPosts === 'object' && !Array.isArray(mediaPosts)) {
      const mediaPostsRecord = mediaPosts as Record<string, unknown>;
      const mediaPostMap: MediaPostMap = {};

      for (const [mediaId, postData] of Object.entries(mediaPostsRecord)) {
        if (postData && typeof postData === 'object') {
          const postRecord = postData as Record<string, unknown>;
          mediaPostMap[mediaId] = {
            accountId: (postRecord.accountId as string) || accountId,
            campaignId: (postRecord.campaignId as string) || '',
            campaignName: (postRecord.campaignName as string) || '',
            mediaId: (postRecord.mediaId as string) || mediaId,
            mediaType: (postRecord.mediaType as 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM') || 'IMAGE',
            permalink: (postRecord.permalink as string) || '',
            thumbnailUrl: (postRecord.thumbnailUrl as string) || undefined,
            postedAt: timestampToDate(postRecord.postedAt as Timestamp) || new Date(),
            mediaProductType: (postRecord.mediaProductType as string) || undefined,
            dataFetchedAt: timestampToDate(postRecord.dataFetchedAt as Timestamp),
            igReelsAvgWatchTime: (postRecord.igReelsAvgWatchTime as number) || undefined,
            igReelsVideoViewTotalTime:
              (postRecord.igReelsVideoViewTotalTime as number) || undefined,
            reach: (postRecord.reach as number) || undefined,
            saved: (postRecord.saved as number) || undefined,
            views: (postRecord.views as number) || undefined,
            likes: (postRecord.likes as number) || undefined,
            comments: (postRecord.comments as number) || undefined,
            registeredAt: timestampToDate(postRecord.registeredAt as Timestamp) || new Date(),
            status: (postRecord.status as 'pending' | 'measured') || 'pending',
          };
        }
      }

      if (Object.keys(mediaPostMap).length > 0) {
        result[accountId] = mediaPostMap;
      }
    }
  }

  return result;
}

/**
 * ユーザーのPR投稿データを取得
 * @param userId - Firebase UID
 * @returns PRPostDocument | null
 */
export async function getPRPosts(userId: string): Promise<PRPostDocument | null> {
  if (!db) {
    console.error('Firestore が初期化されていません');
    return null;
  }

  try {
    const docRef = doc(db, 'prPosts', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      userId,
      postData: parsePostData(data.postData),
    };
  } catch (error) {
    console.error('PR投稿データの取得に失敗しました:', error);
    throw error;
  }
}

/**
 * 特定のアカウントのPR投稿一覧を取得
 * @param userId - Firebase UID
 * @param accountId - InstagramアカウントID
 * @returns PRPostItem[]
 */
export async function getPRPostsByAccount(
  userId: string,
  accountId: string
): Promise<PRPostItem[]> {
  const prPostDoc = await getPRPosts(userId);
  if (!prPostDoc) {
    return [];
  }
  const mediaPostMap = prPostDoc.postData[accountId];
  if (!mediaPostMap) {
    return [];
  }
  // MediaPostMap から配列に変換
  return Object.values(mediaPostMap);
}

/**
 * 同一mediaIdが既に登録されているかチェック
 * @param userId - Firebase UID
 * @param mediaId - Instagram Media ID
 * @returns boolean - 既に登録されている場合は true
 */
export async function isMediaIdAlreadyRegistered(
  userId: string,
  mediaId: string
): Promise<boolean> {
  const prPostDoc = await getPRPosts(userId);
  if (!prPostDoc) {
    return false;
  }

  // 全アカウントの投稿をチェック
  for (const mediaPostMap of Object.values(prPostDoc.postData)) {
    // mediaId がキーとして存在するかチェック
    if (mediaId in mediaPostMap) {
      return true;
    }
  }

  return false;
}

/**
 * PR投稿を登録
 * @param userId - Firebase UID
 * @param accountId - InstagramアカウントID
 * @param input - 登録する投稿データ
 * @throws Error - 同一mediaIdが既に登録されている場合
 */
export async function registerPRPost(
  userId: string,
  accountId: string,
  input: PRPostRegisterInput
): Promise<void> {
  if (!db) {
    throw new Error('Firestore が初期化されていません');
  }

  // 重複チェック
  const isRegistered = await isMediaIdAlreadyRegistered(userId, input.mediaId);
  if (isRegistered) {
    throw new Error('この投稿は既に登録されています');
  }

  try {
    const docRef = doc(db, 'prPosts', userId);
    const docSnap = await getDoc(docRef);

    // 新しい投稿アイテムを作成（Firestoreに保存可能な形式）
    // 新構造: postData[accountId][mediaId] = PRPostItem
    const newPostItem = {
      accountId: accountId,
      campaignId: input.campaignId,
      campaignName: input.campaignName,
      mediaId: input.mediaId,
      mediaType: input.mediaType,
      permalink: input.permalink,
      thumbnailUrl: input.thumbnailUrl || null,
      postedAt: input.postedAt,
      mediaProductType: input.mediaProductType || null,
      registeredAt: new Date(),
      status: 'pending' as const,
    };

    if (!docSnap.exists()) {
      // ドキュメントが存在しない場合は新規作成
      await setDoc(docRef, {
        userId,
        postData: {
          [accountId]: {
            [input.mediaId]: newPostItem,
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // ドキュメントが存在する場合は更新
      const existingData = docSnap.data();
      const existingPostData = existingData?.postData || {};
      const existingAccountPosts =
        existingPostData[accountId] && typeof existingPostData[accountId] === 'object'
          ? existingPostData[accountId]
          : {};

      // 新しい投稿を追加（mediaIdをキーとして追加）
      const updatedAccountPosts = {
        ...existingAccountPosts,
        [input.mediaId]: newPostItem,
      };

      await setDoc(docRef, {
        userId,
        postData: {
          ...existingPostData,
          [accountId]: updatedAccountPosts,
        },
        updatedAt: serverTimestamp(),
      });
    }

    // キャンペーンにメディアIDを追加（重複なし）
    // 現在はInstagramのみ対応、将来的にTikTok等も追加予定
    await addMediaIdToCampaign(input.campaignId, 'instagram', input.mediaId);
  } catch (error) {
    console.error('PR投稿の登録に失敗しました:', error);
    throw error;
  }
}

/**
 * ユーザーの全PR投稿を取得（UI表示用にフラット化）
 * @param userId - Firebase UID
 * @returns 投稿一覧（PRPostItem型、既にaccountIdを含む）
 */
export async function getAllPRPostsFlat(userId: string): Promise<PRPostItem[]> {
  try {
    const prPostDoc = await getPRPosts(userId);
    if (!prPostDoc) {
      return [];
    }

    const result: PRPostItem[] = [];

    // 新構造: postData[accountId][mediaId] = PRPostItem
    for (const mediaPostMap of Object.values(prPostDoc.postData)) {
      for (const post of Object.values(mediaPostMap)) {
        result.push(post);
      }
    }

    // 投稿日の新しい順にソート
    result.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());

    return result;
  } catch (error) {
    // エラーが発生してもダッシュボードの表示を妨げないよう空配列を返す
    console.error('PR投稿一覧の取得に失敗しました:', error);
    return [];
  }
}
