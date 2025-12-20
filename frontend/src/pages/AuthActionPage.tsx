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
        setErrorMessage('Firebase が設定されていません');
        return;
      }

      if (!mode || !oobCode) {
        setStatus('error');
        setErrorMessage('無効なリンクです。リンクが正しいか確認してください。');
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
            setErrorMessage('サポートされていないアクションです');
        }
      } catch (error) {
        setStatus('error');
        const code = (error as { code?: string }).code;

        switch (code) {
          case 'auth/expired-action-code':
            setErrorMessage(
              '確認リンクの有効期限が切れています。新しい確認メールを送信してください。'
            );
            break;
          case 'auth/invalid-action-code':
            setErrorMessage(
              'このリンクは既に使用されているか、無効です。'
            );
            break;
          case 'auth/user-disabled':
            setErrorMessage('このアカウントは無効化されています。');
            break;
          case 'auth/user-not-found':
            setErrorMessage('アカウントが見つかりません。');
            break;
          default:
            setErrorMessage('エラーが発生しました。もう一度お試しください。');
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
                確認中...
              </h1>
              <p className="text-sm" style={{ color: COLORS.neutral500 }}>
                しばらくお待ちください
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
                メールアドレスが確認されました
              </h1>
              <p className="mb-6 text-sm" style={{ color: COLORS.neutral500 }}>
                3秒後に自動的にログインページへ移動します...
              </p>
              <Link
                to="/login?verified=true"
                className="inline-block rounded-lg px-6 py-3 font-medium text-white transition-colors"
                style={{ backgroundColor: COLORS.primary }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary)}
              >
                今すぐログインページへ
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
                確認に失敗しました
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
                  新規登録ページへ
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
                  ログインページへ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

