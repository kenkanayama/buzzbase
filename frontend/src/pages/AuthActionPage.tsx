import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// デザインシステムカラー
const COLORS = {
  primary: '#f29801',
  secondary: '#e61f13',
  secondaryLight: '#fff1f0',
  neutral50: '#fafafa',
  neutral200: '#e5e5e5',
  neutral500: '#737373',
  neutral800: '#262626',
  success: '#16a34a',
  successLight: '#f0fdf4',
};

type ActionStatus = 'loading' | 'success' | 'error';

/**
 * Firebase Auth のメール確認などのアクションを処理するページ
 * URLパラメータ:
 * - mode: 'verifyEmail' | 'resetPassword' | 'recoverEmail'
 * - oobCode: Firebase が発行するワンタイムコード
 * - continueUrl: 確認後のリダイレクト先（オプション）
 */
export function AuthActionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ActionStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const handleAction = async () => {
      if (!auth) {
        setStatus('error');
        setErrorMessage('Firebase is not configured');
        return;
      }

      if (!mode || !oobCode) {
        setStatus('error');
        setErrorMessage('Invalid link. Please check if the link is correct.');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            // まずコードの有効性を確認
            await checkActionCode(auth, oobCode);
            // メールアドレスを確認
            await applyActionCode(auth, oobCode);
            setStatus('success');

            // 3秒後にログインページへリダイレクト
            setTimeout(() => {
              navigate('/login?verified=true', { replace: true });
            }, 3000);
            break;

          case 'resetPassword':
            // パスワードリセットの場合は別ページへ遷移
            navigate(`/reset-password?oobCode=${oobCode}`, { replace: true });
            break;

          default:
            setStatus('error');
            setErrorMessage('Unsupported action');
        }
      } catch (error) {
        setStatus('error');
        const code = (error as { code?: string }).code;

        switch (code) {
          case 'auth/expired-action-code':
            setErrorMessage(
              'The verification link has expired. Please request a new verification email.'
            );
            break;
          case 'auth/invalid-action-code':
            setErrorMessage('This link has already been used or is invalid.');
            break;
          case 'auth/user-disabled':
            setErrorMessage('This account has been disabled.');
            break;
          case 'auth/user-not-found':
            setErrorMessage('Account not found.');
            break;
          default:
            setErrorMessage('An error occurred. Please try again.');
        }
      }
    };

    handleAction();
  }, [mode, oobCode, navigate]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: COLORS.neutral50 }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl bg-white p-8 text-center"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: `1px solid ${COLORS.neutral200}`,
          }}
        >
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" className="mx-auto mb-6" />
              <h1
                className="mb-2 font-display text-xl font-bold"
                style={{ color: COLORS.neutral800 }}
              >
                Verifying...
              </h1>
              <p className="text-sm" style={{ color: COLORS.neutral500 }}>
                Please wait a moment
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.successLight }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: COLORS.success }} />
              </div>
              <h1
                className="mb-2 font-display text-xl font-bold"
                style={{ color: COLORS.neutral800 }}
              >
                Email Verified
              </h1>
              <p className="mb-6 text-sm" style={{ color: COLORS.neutral500 }}>
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                to="/login?verified=true"
                className="inline-block rounded-lg px-6 py-3 font-medium text-white transition-colors"
                style={{ backgroundColor: COLORS.primary }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
              >
                Go to Login Page Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.secondaryLight }}
              >
                <XCircle className="h-10 w-10" style={{ color: COLORS.secondary }} />
              </div>
              <h1
                className="mb-2 font-display text-xl font-bold"
                style={{ color: COLORS.neutral800 }}
              >
                Verification Failed
              </h1>
              <div
                className="mb-6 flex items-start gap-3 rounded-xl p-4 text-left"
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
                  {errorMessage}
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  to="/signup"
                  className="inline-block w-full rounded-lg px-6 py-3 font-medium text-white transition-colors"
                  style={{ backgroundColor: COLORS.primary }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
                >
                  Go to Sign Up Page
                </Link>
                <Link
                  to="/login"
                  className="inline-block w-full rounded-lg border-2 px-6 py-3 font-medium transition-colors"
                  style={{
                    borderColor: COLORS.neutral200,
                    color: COLORS.neutral800,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.backgroundColor = '#fff8ed';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = COLORS.neutral200;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Go to Login Page
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
