/**
 * Firestore ユーザー操作ユーティリティ
 * @see docs/API_RESOURCES.md - Users リソース
 */
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserProfileUpdateInput, InstagramAccountsMap } from '@/types';

/**
 * Firestore Timestamp を Date に変換
 */
function timestampToDate(timestamp: Timestamp | undefined | null): Date | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate();
}

/**
 * Firestore の instagramAccounts Map を InstagramAccountsMap 型に変換
 */
function parseInstagramAccounts(data: unknown): InstagramAccountsMap {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }

  const result: InstagramAccountsMap = {};
  const dataRecord = data as Record<string, unknown>;

  for (const [accountId, accountData] of Object.entries(dataRecord)) {
    if (typeof accountData === 'object' && accountData !== null) {
      const account = accountData as Record<string, unknown>;
      result[accountId] = {
        username: (account.username as string) || '',
        name: (account.name as string) || '',
        profilePictureUrl: (account.profile_picture_url as string) || '',
      };
    }
  }

  return result;
}

/**
 * Firestore ドキュメントを UserProfile 型に変換
 */
function docToUserProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: (data.email as string) || '',
    displayName: (data.displayName as string) || null,
    photoURL: (data.photoURL as string) || null,
    phone: (data.phone as string) || null,
    address: data.address
      ? {
          postalCode: (data.address as Record<string, unknown>).postalCode as string,
          prefecture: (data.address as Record<string, unknown>).prefecture as string,
          city: (data.address as Record<string, unknown>).city as string,
          street: (data.address as Record<string, unknown>).street as string,
          building: ((data.address as Record<string, unknown>).building as string) || null,
        }
      : null,
    bankAccount: data.bankAccount
      ? {
          bankName: (data.bankAccount as Record<string, unknown>).bankName as string,
          bankCode: (data.bankAccount as Record<string, unknown>).bankCode as string,
          branchName: (data.bankAccount as Record<string, unknown>).branchName as string,
          branchCode: (data.bankAccount as Record<string, unknown>).branchCode as string,
          accountType: (data.bankAccount as Record<string, unknown>).accountType as
            | 'ordinary'
            | 'checking',
          accountNumber: (data.bankAccount as Record<string, unknown>).accountNumber as string,
          accountHolder: (data.bankAccount as Record<string, unknown>).accountHolder as string,
        }
      : null,
    instagramAccounts: parseInstagramAccounts(data.instagramAccounts),
    createdAt: timestampToDate(data.createdAt as Timestamp) || new Date(),
    updatedAt: timestampToDate(data.updatedAt as Timestamp) || new Date(),
    lastLoginAt: timestampToDate(data.lastLoginAt as Timestamp),
  };
}

/**
 * ユーザープロフィールを作成（初回のみ）
 * @param uid - Firebase Auth UID
 * @param initialData - 初期データ（認証情報から取得したemail等）
 */
export async function createUserProfile(
  uid: string,
  initialData: { email: string; displayName?: string | null; photoURL?: string | null }
): Promise<UserProfile> {
  if (!db) {
    throw new Error('Firestore が初期化されていません');
  }

  try {
    const userRef = doc(db, 'users', uid);

    const newProfile = {
      email: initialData.email,
      displayName: initialData.displayName || null,
      photoURL: initialData.photoURL || null,
      phone: null,
      address: null,
      bankAccount: null,
      instagramAccounts: {}, // Map形式（空オブジェクト）
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, newProfile);

    // 作成したプロフィールを返す（timestampはローカルの値を使用）
    return {
      uid,
      email: initialData.email,
      displayName: initialData.displayName || null,
      photoURL: initialData.photoURL || null,
      phone: null,
      address: null,
      bankAccount: null,
      instagramAccounts: {}, // Map形式（空オブジェクト）
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw error;
  }
}

/**
 * ユーザープロフィールを取得
 * @param uid - Firebase Auth UID
 * @returns UserProfile | null
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) {
    console.error('Firestore is not initialized');
    return null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return docToUserProfile(uid, userSnap.data());
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

/**
 * ユーザープロフィールを更新
 * @param uid - Firebase Auth UID
 * @param data - 更新するデータ
 */
export async function updateUserProfile(
  uid: string,
  data: UserProfileUpdateInput,
  options?: { email?: string; photoURL?: string | null }
): Promise<void> {
  if (!db) {
    throw new Error('Firestore が初期化されていません');
  }

  try {
    const userRef = doc(db, 'users', uid);

    // null や undefined のフィールドを除外しつつ、明示的な null は保持
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    // email補完オプション（不完全なドキュメントの修正用）
    if (options?.email !== undefined) {
      updateData.email = options.email;
    }

    if (options?.photoURL !== undefined) {
      updateData.photoURL = options.photoURL;
    }

    if (data.displayName !== undefined) {
      updateData.displayName = data.displayName;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    if (data.address !== undefined) {
      updateData.address = data.address;
    }

    if (data.bankAccount !== undefined) {
      updateData.bankAccount = data.bankAccount;
    }

    await setDoc(userRef, updateData, { merge: true });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

/**
 * バリデーションユーティリティ
 */
export const validators = {
  /**
   * 電話番号の形式をチェック
   * ハイフンあり/なし両方対応
   */
  isValidPhone: (phone: string): boolean => {
    const phonePattern = /^0\d{9,10}$|^0\d{2,3}-\d{2,4}-\d{4}$/;
    return phonePattern.test(phone);
  },

  /**
   * 郵便番号の形式をチェック（XXX-XXXX）
   */
  isValidPostalCode: (postalCode: string): boolean => {
    const postalPattern = /^\d{3}-\d{4}$/;
    return postalPattern.test(postalCode);
  },

  /**
   * 口座番号の形式をチェック（7桁の数字）
   */
  isValidAccountNumber: (accountNumber: string): boolean => {
    const accountPattern = /^\d{7}$/;
    return accountPattern.test(accountNumber);
  },

  /**
   * 口座名義の形式をチェック（全角カタカナ）
   */
  isValidAccountHolder: (accountHolder: string): boolean => {
    // 全角カタカナと全角スペース（\u3000）を許可
    const holderPattern = /^[ァ-ヶー\u3000]+$/;
    return holderPattern.test(accountHolder);
  },

  /**
   * 銀行コードの形式をチェック（4桁の数字）
   */
  isValidBankCode: (bankCode: string): boolean => {
    const codePattern = /^\d{4}$/;
    return codePattern.test(bankCode);
  },

  /**
   * 支店コードの形式をチェック（3桁の数字）
   */
  isValidBranchCode: (branchCode: string): boolean => {
    const codePattern = /^\d{3}$/;
    return codePattern.test(branchCode);
  },
};
