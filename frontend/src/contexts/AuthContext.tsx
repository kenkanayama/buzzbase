import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendEmailVerification,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

// =====================================================
// Constants
// =====================================================

/**
 * 【暫定対応】開発中のため、Google認証でログインできるドメインを制限
 *
 * 開発完了後は、この制限を解除してすべてのユーザーがログインできるようにする予定
 * TODO: 本番リリース時にALLOWED_GOOGLE_DOMAINSをnullまたは空配列に変更する
 */
const ALLOWED_GOOGLE_DOMAINS: string[] | null = ['hayashi-rice.tech'];

// =====================================================
// Types
// =====================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// =====================================================
// Context
// =====================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google認証プロバイダー
const googleProvider = new GoogleAuthProvider();

// =====================================================
// Provider
// =====================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 認証状態の監視
  useEffect(() => {
    // Firebase が設定されていない場合はスキップ
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // メールでサインイン
  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError('Firebase が設定されていません');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  // メールでサインアップ
  const signUpWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError('Firebase が設定されていません');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // メール確認を送信
      await sendEmailVerification(result.user);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  // Googleでサインイン
  const signInWithGoogle = async () => {
    if (!auth) {
      setError('Firebase が設定されていません');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);

      // 【暫定対応】ドメイン制限チェック
      if (ALLOWED_GOOGLE_DOMAINS && ALLOWED_GOOGLE_DOMAINS.length > 0) {
        const email = result.user.email;
        if (email) {
          const domain = email.split('@')[1];
          if (!ALLOWED_GOOGLE_DOMAINS.includes(domain)) {
            // 許可されていないドメインの場合はユーザーを削除してエラー
            // Firebase Authにユーザーが残らないようにする
            try {
              await deleteUser(result.user);
            } catch (deleteError) {
              // 削除に失敗した場合はサインアウトのみ実行
              console.error('ユーザー削除に失敗:', deleteError);
              await firebaseSignOut(auth);
            }
            const errorMessage = `このアプリは現在開発中のため、${ALLOWED_GOOGLE_DOMAINS.join(', ')} ドメインのアカウントのみログインできます`;
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }

      // Firestoreにユーザー情報を登録（新規ユーザーの場合のみ）
      await registerUserToFirestore(result.user);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  // サインアウト
  const signOut = async () => {
    if (!auth) return;

    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // エラーをクリア
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isConfigured: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// Hook
// =====================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// =====================================================
// Utils
// =====================================================

/**
 * Firestoreにユーザー情報を登録
 * 新規ユーザーの場合のみ登録、既存ユーザーの場合は最終ログイン日時を更新
 */
async function registerUserToFirestore(user: User): Promise<void> {
  console.log('registerUserToFirestore: 開始', { uid: user.uid, email: user.email });

  if (!db) {
    console.error('registerUserToFirestore: Firestoreが設定されていません (db is null)');
    return;
  }

  console.log('registerUserToFirestore: Firestore接続確認OK');

  try {
    const userRef = doc(db, 'users', user.uid);
    console.log('registerUserToFirestore: ドキュメント参照作成', userRef.path);

    const userSnap = await getDoc(userRef);
    console.log('registerUserToFirestore: ドキュメント取得完了', { exists: userSnap.exists() });

    if (!userSnap.exists()) {
      // 新規ユーザー: ドキュメントを作成
      const userData = {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      console.log('registerUserToFirestore: 新規ユーザー登録開始', userData);

      await setDoc(userRef, userData);
      console.log('registerUserToFirestore: 新規ユーザー登録完了:', user.uid);
    } else {
      // 既存ユーザー: 最終ログイン日時を更新
      console.log('registerUserToFirestore: 既存ユーザー、lastLoginAt更新開始');
      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
      console.log('registerUserToFirestore: lastLoginAt更新完了');
    }
  } catch (error) {
    console.error('registerUserToFirestore: エラー発生', error);
    // ログインは成功させるため、エラーは投げない
  }
}

function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'このメールアドレスは既に使用されています';
      case 'auth/invalid-email':
        return 'メールアドレスの形式が正しくありません';
      case 'auth/operation-not-allowed':
        return 'この操作は許可されていません';
      case 'auth/weak-password':
        return 'パスワードが弱すぎます（8文字以上で設定してください）';
      case 'auth/user-disabled':
        return 'このアカウントは無効になっています';
      case 'auth/user-not-found':
        return 'ユーザーが見つかりません';
      case 'auth/wrong-password':
        return 'パスワードが間違っています';
      case 'auth/too-many-requests':
        return 'ログイン試行回数が多すぎます。しばらくお待ちください';
      case 'auth/popup-closed-by-user':
        return 'ログインがキャンセルされました';
      default:
        return 'エラーが発生しました。もう一度お試しください';
    }
  }
  return 'エラーが発生しました';
}
