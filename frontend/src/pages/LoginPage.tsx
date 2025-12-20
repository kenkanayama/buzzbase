import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

// デザインシステムカラー
const COLORS = {
  primary: '#f29801',
  primaryHover: '#e38500',
  secondary: '#e61f13',
  secondaryLight: '#fff1f0',
  neutral50: '#fafafa',
  neutral200: '#e5e5e5',
  neutral500: '#737373',
  neutral600: '#525252',
  neutral800: '#262626',
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithGoogle, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // リダイレクト先を取得（デフォルトはダッシュボード）
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      await signInWithEmail(email, password);
      navigate(from, { replace: true });
    } catch {
      // エラーはAuthContextで処理
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearError();

    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch {
      // エラーはAuthContextで処理
    } finally {
      setLoading(false);
    }
  };

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

        {/* ログインカード */}
        <div
          className="rounded-2xl bg-white p-8"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${COLORS.neutral200}`,
          }}
        >
          <h1
            className="mb-2 text-center font-display text-2xl font-bold"
            style={{ color: COLORS.neutral800 }}
          >
            おかえりなさい
          </h1>
          <p className="mb-8 text-center" style={{ color: COLORS.neutral500 }}>
            アカウントにログインしてください
          </p>

          {/* エラー表示 */}
          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl p-4"
              style={{
                backgroundColor: COLORS.secondaryLight,
                border: `1px solid #ffc8c4`,
              }}
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                style={{ color: COLORS.secondary }}
              />
              <p className="text-sm" style={{ color: COLORS.secondary }}>
                {error}
              </p>
            </div>
          )}

          {/* Googleログイン */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
            style={{ border: `2px solid ${COLORS.neutral200}` }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = COLORS.primary;
              e.currentTarget.style.backgroundColor = '#fff8ed';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = COLORS.neutral200;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-medium" style={{ color: COLORS.neutral600 }}>
              Googleでログイン
            </span>
          </button>

          {/* 区切り線 */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1" style={{ backgroundColor: COLORS.neutral200 }} />
            <span className="text-sm" style={{ color: COLORS.neutral500 }}>
              または
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: COLORS.neutral200 }} />
          </div>

          {/* メールログインフォーム */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <Input
              type="email"
              label="メールアドレス"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              type="password"
              label="パスワード"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} className="w-full">
              ログイン
            </Button>
          </form>

          {/* サインアップリンク */}
          <p className="mt-6 text-center text-sm" style={{ color: COLORS.neutral500 }}>
            アカウントをお持ちでない方は{' '}
            <Link
              to="/signup"
              className="font-medium hover:underline"
              style={{ color: COLORS.primary }}
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
