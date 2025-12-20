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
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

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
            // 許可されていないドメインの場合はサインアウトしてエラー
            await firebaseSignOut(auth);
            const errorMessage = `このアプリは現在開発中のため、${ALLOWED_GOOGLE_DOMAINS.join(', ')} ドメインのアカウントのみログインできます`;
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
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
