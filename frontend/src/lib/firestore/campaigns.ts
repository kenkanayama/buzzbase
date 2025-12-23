/**
 * Firestore キャンペーン操作ユーティリティ
 * campaigns コレクションの読み取り操作
 */
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

/**
 * Firestore Timestamp を Date に変換
 */
function timestampToDate(timestamp: Timestamp | undefined | null): Date | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate();
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
