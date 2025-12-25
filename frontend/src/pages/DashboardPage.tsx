import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Music2, Calendar, User, X, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/lib/firestore/users';
import { getAllPRPostsFlat } from '@/lib/firestore/prPosts';
import { InstagramAccountWithId, PRPostItem } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Instagram認証URL生成用の定数
const INSTAGRAM_APP_ID = '1395033632016244';
const INSTAGRAM_REDIRECT_URI =
  'https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback';
const INSTAGRAM_SCOPES = 'instagram_business_basic,instagram_business_manage_insights';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // 選択中のInstagramアカウントID
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // PR投稿一覧（PRPostItemは既にaccountIdを含む）
  const [prPosts, setPrPosts] = useState<PRPostItem[]>([]);

  // Firestoreからユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ユーザープロフィールを取得
        const profile = await getUserProfile(user.uid);

        if (profile && profile.instagramAccounts) {
          // Map形式からUI表示用の配列に変換
          const accountsArray = Object.entries(profile.instagramAccounts).map(
            ([accountId, accountInfo]) => ({
              accountId,
              ...accountInfo,
            })
          );
          setInstagramAccounts(accountsArray);
          // デフォルトで最初のアカウントを選択
          if (accountsArray.length > 0) {
            setSelectedAccountId(accountsArray[0].accountId);
          }
        }

        // PR投稿を別途取得（エラーが発生しても上記の処理には影響しない）
        const posts = await getAllPRPostsFlat(user.uid);
        setPrPosts(posts);
      } catch (error) {
        console.error('ユーザーデータの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // アカウント選択ハンドラー
  const handleAccountSelect = (accountId: string) => {
    // アカウントが1つしかない場合は選択変更を許可しない
    if (instagramAccounts.length === 1) return;
    setSelectedAccountId(accountId);
  };

  // Instagram認証URLを生成
  const handleInstagramConnect = () => {
    if (!user) return;

    const authUrl = new URL('https://www.instagram.com/oauth/authorize');
    authUrl.searchParams.set('client_id', INSTAGRAM_APP_ID);
    authUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', INSTAGRAM_SCOPES);
    authUrl.searchParams.set('state', user.uid); // ユーザーIDをstateに設定

    window.location.href = authUrl.toString();
  };

  // 日付フォーマット
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 数値フォーマット（再生数など）
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* 連携済みSNS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">連携済みSNS</h2>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="text-sm font-medium hover:underline"
            style={{ color: '#f29801' }}
          >
            設定
          </button>
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <div className="card !p-4">
            {instagramAccounts.length > 0 ? (
              <div className="space-y-3">
                {instagramAccounts.map((account) => {
                  const isSelected = selectedAccountId === account.accountId;
                  const isSingleAccount = instagramAccounts.length === 1;
                  return (
                    <button
                      key={account.accountId}
                      onClick={() => handleAccountSelect(account.accountId)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
                        isSelected
                          ? 'bg-green-50 ring-2 ring-green-500 ring-opacity-50'
                          : 'bg-gray-50 hover:bg-gray-100'
                      } ${isSingleAccount ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {/* 選択チェックマーク */}
                      <div className="relative flex-shrink-0">
                        {/* プロフィール画像 */}
                        {account.profilePictureUrl ? (
                          <img
                            src={account.profilePictureUrl}
                            alt={account.name || account.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        {/* 選択中の場合、緑色のチェックマークを左上に表示 */}
                        {isSelected && (
                          <div className="absolute -left-1 -top-1">
                            <CheckCircle2
                              className="h-5 w-5 fill-green-500 text-white"
                              strokeWidth={2}
                            />
                          </div>
                        )}
                      </div>
                      {/* アカウント情報 */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {account.name || account.username}
                        </p>
                        <p className="truncate text-sm text-gray-500">@{account.username}</p>
                      </div>
                      {/* Instagramアイコン */}
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-md"
                        style={{
                          background:
                            'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
                        }}
                      >
                        <Instagram className="h-3.5 w-3.5 text-white" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* 空状態: SNSアカウント未連携 */
              <div className="py-8 text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#fff8ed' }}
                >
                  <Instagram className="h-7 w-7" style={{ color: '#f29801' }} />
                </div>
                <h3 className="mb-2 font-medium text-gray-900">SNSアカウントを連携しましょう</h3>
                <p className="mb-5 text-sm text-gray-500">
                  PR投稿を登録するには、まずSNSアカウントの連携が必要です
                </p>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: '#f29801' }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f29801')}
                >
                  <Plus className="h-4 w-4" />
                  SNSアカウントを連携する
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* PR投稿 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">PR投稿</h2>
          {prPosts.length > 0 && (
            <Link to="/posts" className="text-sm hover:underline" style={{ color: '#f29801' }}>
              すべて見る
            </Link>
          )}
        </div>

        {prPosts.length === 0 ? (
          <div className="card py-10 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#fff8ed' }}
            >
              <Calendar className="h-7 w-7" style={{ color: '#f29801' }} />
            </div>
            <h3 className="mb-2 font-medium text-gray-900">まだPR投稿がありません</h3>
            {instagramAccounts.length > 0 ? (
              <>
                <p className="mb-5 text-sm text-gray-500">
                  最初の投稿を登録して、再生数をトラッキングしましょう
                </p>
                <Button onClick={() => navigate('/register-post')}>
                  <Plus className="mr-2 h-4 w-4" />
                  PR投稿を登録
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                PR投稿を登録するには、まずSNSアカウントを連携してください
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {prPosts.slice(0, 5).map((post) => (
              <div key={post.mediaId} className="card !p-4">
                <div className="flex items-start gap-4">
                  {/* サムネイル */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt={post.campaignName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Instagram className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-gray-900">{post.campaignName}</h3>
                    {/* 再生数表示（計測完了時）または空のスペース（計測待ち時） */}
                    <div className="h-5">
                      {post.status === 'measured' && post.views !== undefined ? (
                        <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                          {formatNumber(post.views)} ビュー
                        </p>
                      ) : (
                        <div className="h-5" /> // 高さを確保するための空のdiv
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(post.postedAt)}</p>
                  </div>
                  {/* ステータスバッジ */}
                  <div className="flex-shrink-0">
                    {post.status === 'measured' ? (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
                      >
                        計測完了
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        style={{ backgroundColor: '#fff8ed', color: '#f29801' }}
                      >
                        計測待ち
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PR投稿登録ボタン */}
      {instagramAccounts.length > 0 && prPosts.length > 0 && (
        <section>
          <Button onClick={() => navigate('/register-post')} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            PR投稿を登録
          </Button>
        </section>
      )}

      {/* SNS連携設定モーダル */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSettingsModalOpen(false)}
          />
          {/* モーダルコンテンツ */}
          <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            {/* ヘッダー */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">SNS連携設定</h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 連携ボタン一覧 */}
            <div className="space-y-3">
              {/* Instagram連携ボタン */}
              <button
                className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                onClick={handleInstagramConnect}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
                  }}
                >
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">Instagramを連携する</span>
              </button>

              {/* TikTok連携ボタン（近日対応予定） */}
              <button
                className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl border border-gray-200 p-4 opacity-60"
                disabled
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
                  <Music2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <span className="font-medium text-gray-900">TikTokを連携する</span>
                  <p className="text-sm text-gray-500">近日対応予定</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
