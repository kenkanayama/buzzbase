import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Music2, Calendar, User, CheckCircle2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '@/lib/firestore/users';
import { getAllPRPostsFlat } from '@/lib/firestore/prPosts';
import { InstagramAccountWithId, TikTokAccountWithId, PRPostItem } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { PostCard } from '@/components/posts/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';

// Instagram認証URL生成用の定数
const INSTAGRAM_APP_ID = '1395033632016244';
const INSTAGRAM_REDIRECT_URI =
  'https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback';
const INSTAGRAM_SCOPES = 'instagram_business_basic,instagram_business_manage_insights';

// TikTok認証URL生成用の定数
const TIKTOK_CLIENT_KEY = 'sbawmsbtoxbwwp81ea';
const TIKTOK_REDIRECT_URI = 'https://asia-northeast1-sincere-kit.cloudfunctions.net/tiktokCallback';
const TIKTOK_SCOPES = 'user.info.basic,video.list';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountWithId[]>([]);
  const [tiktokAccounts, setTiktokAccounts] = useState<TikTokAccountWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // 選択中のInstagramアカウントID
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // PR投稿一覧（PRPostItemは既にaccountIdを含む）
  const [prPosts, setPrPosts] = useState<PRPostItem[]>([]);

  // 詳細ポップアップ用の状態
  const [selectedPost, setSelectedPost] = useState<PRPostItem | null>(null);

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

        // TikTokアカウント情報を取得
        if (profile && profile.tiktokAccounts) {
          const tiktokAccountsArray = Object.entries(profile.tiktokAccounts).map(
            ([openId, accountInfo]) => ({
              accountId: openId,
              ...accountInfo,
            })
          );
          setTiktokAccounts(tiktokAccountsArray);
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

  // TikTok認証URLを生成
  const handleTikTokConnect = () => {
    if (!user) return;

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', TIKTOK_CLIENT_KEY);
    authUrl.searchParams.set('scope', TIKTOK_SCOPES);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', TIKTOK_REDIRECT_URI);
    authUrl.searchParams.set('state', user.uid); // ユーザーIDをstateに設定

    window.location.href = authUrl.toString();
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
            {instagramAccounts.length > 0 || tiktokAccounts.length > 0 ? (
              <div className="space-y-3">
                {/* Instagramアカウント */}
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
                {/* TikTokアカウント */}
                {tiktokAccounts.map((account) => {
                  return (
                    <div
                      key={account.accountId}
                      className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3"
                    >
                      {/* プロフィール画像 */}
                      <div className="relative flex-shrink-0">
                        {account.profilePictureUrl ? (
                          <img
                            src={account.profilePictureUrl}
                            alt={account.displayName || account.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {/* アカウント情報 */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {account.displayName || account.username}
                        </p>
                        <p className="truncate text-sm text-gray-500">@{account.username}</p>
                      </div>
                      {/* TikTokアイコン */}
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black">
                        <Music2 className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
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
          <div className="card">
            <EmptyState
              icon={<Calendar className="h-7 w-7" style={{ color: '#f29801' }} />}
              title="まだPR投稿がありません"
              description={
                instagramAccounts.length > 0
                  ? '最初の投稿を登録して、再生数をトラッキングしましょう'
                  : 'PR投稿を登録するには、まずSNSアカウントを連携してください'
              }
              action={
                instagramAccounts.length > 0 ? (
                  <Button onClick={() => navigate('/register-post')}>
                    <Plus className="mr-2 h-4 w-4" />
                    PR投稿を登録
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {prPosts.slice(0, 5).map((post) => (
              <PostCard key={post.mediaId} post={post} onClick={() => setSelectedPost(post)} />
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
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="SNS連携設定"
        className="p-6"
      >
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
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Instagram</p>
              <p className="text-sm text-gray-500">Instagramアカウントを連携</p>
            </div>
          </button>

          {/* TikTok連携ボタン */}
          <button
            className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            onClick={handleTikTokConnect}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">TikTok</p>
              <p className="text-sm text-gray-500">TikTokアカウントを連携</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* PR投稿詳細ポップアップ */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          instagramAccounts={instagramAccounts}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
