/**
 * Firestore キャンペーン操作ユーティリティ
 * campaigns コレクションの読み取り・更新操作
 */
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign, PostedMediaByPlatform, SNSPlatform } from '@/types';

/**
 * Firestore Timestamp を Date に変換
 */
function timestampToDate(timestamp: Timestamp | undefined | null): Date | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate();
}

/**
 * Firestore の postedMedia を PostedMediaByPlatform 型に変換
 */
function parsePostedMedia(data: unknown): PostedMediaByPlatform | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return undefined;
  }

  const dataRecord = data as Record<string, unknown>;
  const result: PostedMediaByPlatform = {};

  if (Array.isArray(dataRecord.instagram)) {
    result.instagram = dataRecord.instagram as string[];
  }
  if (Array.isArray(dataRecord.tiktok)) {
    result.tiktok = dataRecord.tiktok as string[];
  }

  // 空オブジェクトの場合は undefined を返す
  if (Object.keys(result).length === 0) {
    return undefined;
  }

  return result;
}

/**
 * Firestore ドキュメントを Campaign 型に変換
 */
function docToCampaign(id: string, data: Record<string, unknown>): Campaign {
  return {
    id,
    name: (data.name as string) || '',
    description: (data.description as string) || undefined,
    imageUrl: (data.imageUrl as string) || undefined,
    status: (data.status as 'active' | 'inactive') || 'inactive',
    startDate: timestampToDate(data.startDate as Timestamp | undefined),
    endDate: timestampToDate(data.endDate as Timestamp | undefined),
    postedMedia: parsePostedMedia(data.postedMedia),
    createdAt: timestampToDate(data.createdAt as Timestamp) || new Date(),
    updatedAt: timestampToDate(data.updatedAt as Timestamp),
  };
}

/**
 * アクティブなキャンペーン一覧を取得
 * @returns Campaign[]
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  if (!db) {
    console.error('Firestore が初期化されていません');
    return [];
  }

  try {
    const campaignsRef = collection(db, 'campaigns');
    // 複合インデックス不要にするため、whereのみでクエリし、ソートはJS側で行う
    const q = query(campaignsRef, where('status', '==', 'active'));

    const snapshot = await getDocs(q);
    const campaigns: Campaign[] = [];

    snapshot.forEach((doc) => {
      campaigns.push(docToCampaign(doc.id, doc.data()));
    });

    // createdAtの降順でソート
    campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return campaigns;
  } catch (error) {
    console.error('キャンペーン一覧の取得に失敗しました:', error);
    return [];
  }
}

/**
 * 全てのキャンペーン一覧を取得（管理者向け）
 * @returns Campaign[]
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  if (!db) {
    console.error('Firestore が初期化されていません');
    return [];
  }

  try {
    const campaignsRef = collection(db, 'campaigns');
    const snapshot = await getDocs(campaignsRef);
    const campaigns: Campaign[] = [];

    snapshot.forEach((docSnap) => {
      campaigns.push(docToCampaign(docSnap.id, docSnap.data()));
    });

    // createdAtの降順でソート
    campaigns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return campaigns;
  } catch (error) {
    console.error('キャンペーン一覧の取得に失敗しました:', error);
    return [];
  }
}

/**
 * キャンペーンにメディアIDを追加（重複なし）
 * Firestore の arrayUnion を使用して重複を防ぐ
 * @param campaignId - キャンペーンID
 * @param platform - SNSプラットフォーム（instagram, tiktok）
 * @param mediaId - 追加するメディアID
 */
export async function addMediaIdToCampaign(
  campaignId: string,
  platform: SNSPlatform,
  mediaId: string
): Promise<void> {
  if (!db) {
    throw new Error('Firestore が初期化されていません');
  }

  try {
    const campaignRef = doc(db, 'campaigns', campaignId);
    // ネストされたフィールドへの更新: postedMedia.instagram や postedMedia.tiktok
    await updateDoc(campaignRef, {
      [`postedMedia.${platform}`]: arrayUnion(mediaId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('キャンペーンへのメディアID追加に失敗しました:', error);
    throw error;
  }
}
