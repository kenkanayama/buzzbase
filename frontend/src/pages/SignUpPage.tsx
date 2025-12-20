import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle } from 'lucide-react';

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

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // パスワードバリデーション
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8 || pwd.length > 20) {
      return 'パスワードは8〜20文字で入力してください';
    }
    if (!/[a-zA-Z]/.test(pwd)) {
      return 'パスワードには英字を含めてください';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'パスワードには数字を含めてください';
    }
    return null;
  };

  const handleEmailSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    setValidationError(null);

    // パスワードバリデーション
    const pwdError = validatePassword(password);
    if (pwdError) {
      setValidationError(pwdError);
      setLoading(false);
      return;
    }

    // パスワード確認
    if (password !== confirmPassword) {
      setValidationError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      await signUpWithEmail(email, password);
      // メール確認画面へ遷移
      navigate('/verify-email', { replace: true });
    } catch {
      // エラーはAuthContextで処理
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    clearError();

    try {
      await signInWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch {
      // エラーはAuthContextで処理
    } finally {
      setLoading(false);
    }
  };

  const displayError = validationError || error;

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

        {/* サインアップカード */}
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
            アカウント作成
          </h1>
          <p className="mb-8 text-center" style={{ color: COLORS.neutral500 }}>
            無料で始めましょう
          </p>

          {/* エラー表示 */}
          {displayError && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl p-4"
              style={{
                backgroundColor: COLORS.secondaryLight,
                border: '1px solid #ffc8c4',
              }}
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                style={{ color: COLORS.secondary }}
              />
              <p className="text-sm" style={{ color: COLORS.secondary }}>
                {displayError}
              </p>
            </div>
          )}

          {/* Googleサインアップ */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
              Googleで登録
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

          {/* メールサインアップフォーム */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <Input
              type="email"
              label="メールアドレス"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div>
              <Input
                type="password"
                label="パスワード"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <div className="mt-2 space-y-1">
                <PasswordRule satisfied={password.length >= 8 && password.length <= 20}>
                  8〜20文字
                </PasswordRule>
                <PasswordRule satisfied={/[a-zA-Z]/.test(password)}>英字を含む</PasswordRule>
                <PasswordRule satisfied={/[0-9]/.test(password)}>数字を含む</PasswordRule>
              </div>
            </div>
            <Input
              type="password"
              label="パスワード（確認）"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} className="w-full">
              アカウント作成
            </Button>
          </form>

          {/* ログインリンク */}
          <p className="mt-6 text-center text-sm" style={{ color: COLORS.neutral500 }}>
            既にアカウントをお持ちの方は{' '}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: COLORS.primary }}
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function PasswordRule({ satisfied, children }: { satisfied: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2 text-xs"
      style={{ color: satisfied ? '#16a34a' : COLORS.neutral500 }}
    >
      <CheckCircle className={`h-3.5 w-3.5 ${satisfied ? 'opacity-100' : 'opacity-40'}`} />
      <span>{children}</span>
    </div>
  );
}
