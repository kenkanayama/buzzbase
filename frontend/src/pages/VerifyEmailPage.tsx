import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Mail, RefreshCw, CheckCircle, LogOut } from 'lucide-react';

// デザインシステムカラー
const COLORS = {
  primary: '#f29801',
  primaryLight: '#fff8ed',
  primaryBorder: '#ffdba8',
  neutral50: '#fafafa',
  neutral200: '#e5e5e5',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral800: '#262626',
  success: '#16a34a',
  successLight: '#f0fdf4',
};

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user, resendVerificationEmail, signOut, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  // メール確認済みの場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // 未ログインの場合はログインページへリダイレクト
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // 確認メール再送信
  const handleResendEmail = async () => {
    setResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      await resendVerificationEmail();
      setResendSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setResendError(error.message);
      } else {
        setResendError('確認メールの送信に失敗しました');
      }
    } finally {
      setResending(false);
    }
  };

  // メール確認状態を更新
  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await refreshUser();
      // refreshUser後、useEffectでemailVerifiedがtrueならダッシュボードへ遷移
    } catch {
      // エラーは無視
    } finally {
      setChecking(false);
    }
  };

  // ログアウト
  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: COLORS.neutral50 }}
    >
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: COLORS.primary }}
            >
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="font-display text-2xl font-bold" style={{ color: COLORS.neutral800 }}>
              Buzz<span style={{ color: COLORS.primary }}>Base</span>
            </span>
          </Link>
        </div>

        {/* メール確認カード */}
        <div
          className="rounded-2xl bg-white p-8"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${COLORS.neutral200}`,
          }}
        >
          {/* アイコン */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.primaryLight }}
            >
              <Mail className="h-8 w-8" style={{ color: COLORS.primary }} />
            </div>
          </div>

          <h1
            className="mb-2 text-center font-display text-2xl font-bold"
            style={{ color: COLORS.neutral800 }}
          >
            メールアドレスを確認してください
          </h1>
          <p className="mb-6 text-center" style={{ color: COLORS.neutral500 }}>
            以下のメールアドレスに確認メールを送信しました。
            <br />
            メール内のリンクをクリックして、登録を完了してください。
          </p>

          {/* 送信先メールアドレス */}
          <div
            className="mb-6 rounded-xl p-4 text-center"
            style={{
              backgroundColor: COLORS.neutral50,
              border: `1px solid ${COLORS.neutral200}`,
            }}
          >
            <span className="font-medium" style={{ color: COLORS.neutral800 }}>
              {user.email}
            </span>
          </div>

          {/* 成功メッセージ */}
          {resendSuccess && (
            <div
              className="mb-6 flex items-center gap-3 rounded-xl p-4"
              style={{
                backgroundColor: COLORS.successLight,
                border: '1px solid #bbf7d0',
              }}
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0" style={{ color: COLORS.success }} />
              <p className="text-sm" style={{ color: COLORS.success }}>
                確認メールを再送信しました
              </p>
            </div>
          )}

          {/* エラーメッセージ */}
          {resendError && (
            <div
              className="mb-6 rounded-xl p-4"
              style={{
                backgroundColor: '#fff1f0',
                border: '1px solid #ffc8c4',
              }}
            >
              <p className="text-sm" style={{ color: '#e61f13' }}>
                {resendError}
              </p>
            </div>
          )}

          {/* ボタン */}
          <div className="space-y-3">
            <Button onClick={handleCheckVerification} loading={checking} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              確認状態を更新
            </Button>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resending}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                border: `1px solid ${COLORS.neutral200}`,
                color: COLORS.neutral600,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.backgroundColor = COLORS.primaryLight;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = COLORS.neutral200;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {resending ? '送信中...' : '確認メールを再送信'}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
              style={{ color: COLORS.neutral500 }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = COLORS.neutral800;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = COLORS.neutral500;
              }}
            >
              <LogOut className="h-4 w-4" />
              別のアカウントで登録
            </button>
          </div>

          {/* ヘルプテキスト */}
          <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: COLORS.neutral50 }}>
            <p className="text-xs" style={{ color: COLORS.neutral500 }}>
              メールが届かない場合は、迷惑メールフォルダを確認するか、
              上のボタンから確認メールを再送信してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
