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
  ActionCodeSettings,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

// =====================================================
// Constants
// =====================================================

/**
 * 【暫定対応】開発中のため、認証でログインできるドメインを制限
 *
 * Google認証・メールアドレス認証の両方に適用される。
 * 開発完了後は、この制限を解除してすべてのユーザーがログインできるようにする予定。
 *
 * TODO: 本番リリース時にALLOWED_AUTH_DOMAINSをnullまたは空配列に変更する
 */
const ALLOWED_AUTH_DOMAINS: string[] | null = [
  'hayashi-rice.tech',
  'ricecurry.co.jp',
  'ricecurryplus.co.jp',
  'muscatgroup.co.jp',
];

/**
 * 審査用環境のURL（Meta審査用）
 * 審査用環境ではドメイン制限を無効にする
 */
const REVIEW_ENVIRONMENT_URL = 'buzzbase-review-1028492470102.asia-northeast1.run.app';

/**
 * 現在の環境が審査用環境かどうかを判定
 */
const isReviewEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === REVIEW_ENVIRONMENT_URL;
};

/**
 * ドメイン制限のエラーメッセージを生成
 */
const getDomainRestrictionErrorMessage = (): string => {
  if (!ALLOWED_AUTH_DOMAINS || ALLOWED_AUTH_DOMAINS.length === 0) {
    return 'Cannot sign in';
  }
  return `This app is currently in development. Only accounts with ${ALLOWED_AUTH_DOMAINS.join(', ')} domains can be used`;
};

/**
 * メールアドレスのドメインが許可されているかチェック
 * @returns true: 許可されている, false: 許可されていない
 */
const isEmailDomainAllowed = (email: string): boolean => {
  // 審査用環境ではドメイン制限を無効にする（Meta審査員が様々なメールアドレスを使用するため）
  if (isReviewEnvironment()) {
    return true;
  }

  // ドメイン制限がない場合は全て許可
  if (!ALLOWED_AUTH_DOMAINS || ALLOWED_AUTH_DOMAINS.length === 0) {
    return true;
  }

  const domain = email.split('@')[1];
  return ALLOWED_AUTH_DOMAINS.includes(domain);
};

/**
 * メール確認後のリダイレクト設定
 * 確認リンクをクリック後、アプリ内のカスタムハンドラーへ遷移する
 */
const getEmailVerificationSettings = (): ActionCodeSettings => {
  // 現在のホスト（ローカル or 本番）に基づいてURLを生成
  const baseUrl = window.location.origin;
  return {
    // カスタムハンドラーのURLを指定（Firebaseはここにリダイレクトする）
    url: `${baseUrl}/auth/action`,
    handleCodeInApp: true,
  };
};

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
  resendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
      setError('Firebase is not configured');
      throw new Error('Firebase not configured');
    }

    // 【暫定対応】ドメイン制限チェック
    if (!isEmailDomainAllowed(email)) {
      const errorMessage = getDomainRestrictionErrorMessage();
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);

      // 最新のユーザー情報を取得（メール確認状態がキャッシュで古い場合があるため）
      await result.user.reload();

      // 状態を更新（reload後の最新情報を反映）
      setUser(auth.currentUser);

      // メール確認済みの場合のみFirestoreに登録
      if (auth.currentUser?.emailVerified) {
        await registerUserToFirestore(auth.currentUser);
      }
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  // メールでサインアップ
  const signUpWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError('Firebase is not configured');
      throw new Error('Firebase not configured');
    }

    // 【暫定対応】ドメイン制限チェック
    if (!isEmailDomainAllowed(email)) {
      const errorMessage = getDomainRestrictionErrorMessage();
      setError(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // メール確認を送信（確認後のリダイレクト先を指定）
      await sendEmailVerification(result.user, getEmailVerificationSettings());
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setError(message);
      throw err;
    }
  };

  // Googleでサインイン
  const signInWithGoogle = async () => {
    if (!auth) {
      setError('Firebase is not configured');
      throw new Error('Firebase not configured');
    }

    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);

      // 【暫定対応】ドメイン制限チェック
      const email = result.user.email;
      if (email && !isEmailDomainAllowed(email)) {
        // 許可されていないドメインの場合はユーザーを削除してエラー
        // Firebase Authにユーザーが残らないようにする
        try {
          await deleteUser(result.user);
        } catch (deleteError) {
          // 削除に失敗した場合はサインアウトのみ実行
          console.error('ユーザー削除に失敗:', deleteError);
          await firebaseSignOut(auth);
        }
        const errorMessage = getDomainRestrictionErrorMessage();
        setError(errorMessage);
        throw new Error(errorMessage);
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

  // 確認メールを再送信
  const resendVerificationEmail = async () => {
      if (!auth?.currentUser) {
        throw new Error('User is not signed in');
      }

    try {
      await sendEmailVerification(auth.currentUser, getEmailVerificationSettings());
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/too-many-requests') {
        throw new Error('Verification email send limit reached. Please wait a moment.');
      }
      throw new Error('Failed to send verification email');
    }
  };

  // ユーザー情報を更新（メール確認状態の更新）
  const refreshUser = async () => {
    if (!auth?.currentUser) {
      return;
    }

    await auth.currentUser.reload();
    // reload後のユーザー情報を反映
    setUser({ ...auth.currentUser });
  };

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
        resendVerificationEmail,
        refreshUser,
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
  if (!db) {
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // 新規ユーザー: ドキュメントを作成
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // 既存ユーザー: 最終ログイン日時を更新
      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error('Firestoreへのユーザー登録に失敗しました:', error);
    // ログインは成功させるため、エラーは投げない
  }
}

function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already in use';
      case 'auth/invalid-email':
        return 'Invalid email address format';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed';
      case 'auth/weak-password':
        return 'Password is too weak (must be at least 8 characters)';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'User not found';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please wait a moment';
      case 'auth/popup-closed-by-user':
        return 'Sign in was cancelled';
      default:
        return 'An error occurred. Please try again';
    }
  }
  return 'An error occurred';
}
