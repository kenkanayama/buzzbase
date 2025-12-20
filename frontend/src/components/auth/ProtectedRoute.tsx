import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ユーザーがメール確認済みかどうかを判定
 * - Google認証ユーザー: 常に確認済みとして扱う（Googleで既に確認済み）
 * - メール/パスワードユーザー: emailVerifiedフラグを確認
 */
function isEmailVerified(user: { emailVerified: boolean; providerData: { providerId: string }[] }): boolean {
  // Google認証ユーザーは確認済みとして扱う
  const isGoogleUser = user.providerData.some((provider) => provider.providerId === 'google.com');
  if (isGoogleUser) {
    return true;
  }

  // メール/パスワードユーザーはemailVerifiedを確認
  return user.emailVerified;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // 未認証の場合はログインページへリダイレクト
    // 元のURLを state に保存して、ログイン後にリダイレクト可能に
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // メール確認が完了していない場合はメール確認画面へリダイレクト
  if (!isEmailVerified(user)) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
}
