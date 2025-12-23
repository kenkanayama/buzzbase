import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Instagram,
  Music2,
  Calendar,
  User,
  X,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { getUserProfile } from '@/lib/firestore/users';
import { getInstagramMedia } from '@/lib/api/instagram';
import { InstagramAccountWithId, InstagramMedia } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Instagram認証URL生成用の定数
const INSTAGRAM_APP_ID = '1395033632016244';
const INSTAGRAM_REDIRECT_URI =
  'https://asia-northeast1-sincere-kit.cloudfunctions.net/instagramCallback';
const INSTAGRAM_SCOPES =
  'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights';

export function DashboardPage() {
  const { user } = useAuth();
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  // 選択中のInstagramアカウントID（投稿登録時に使用）
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // 投稿取得関連の状態
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState<InstagramMedia[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Firestoreからユーザーデータを取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
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

  // 直近の投稿を取得
  const handleFetchPosts = async () => {
    if (!selectedAccountId) return;

    setFetchingPosts(true);
    setFetchError(null);
    setInstagramPosts([]);

    try {
      // バックエンドAPI経由でInstagram投稿一覧を取得
      const data = await getInstagramMedia(selectedAccountId);

      if (data.media && data.media.data) {
        setInstagramPosts(data.media.data);
      } else {
        setInstagramPosts([]);
      }
    } catch (err) {
      console.error('投稿の取得に失敗しました:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : '投稿の取得に失敗しました。ネットワークエラーが発生した可能性があります。';
      setFetchError(errorMessage);
    } finally {
      setFetchingPosts(false);
    }
  };

  // 投稿画像URLを取得（VIDEOはthumbnail_url、それ以外はmedia_url）
  const getPostImageUrl = (post: InstagramMedia): string | null => {
    if (post.media_type === 'VIDEO') {
      return post.thumbnail_url || null;
    }
    return post.media_url || null;
  };

  // 日付フォーマット
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // TODO: 投稿データはFirestoreから取得するように実装予定
  const recentPosts: {
    id: string;
    platform: string;
    productName: string;
    postDate: Date;
    viewCount: number | null;
    status: string;
  }[] = [];

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
              <p className="py-4 text-center text-sm text-gray-500">
                連携されているSNSアカウントはありません
              </p>
            )}
          </div>
        )}
      </section>

      {/* PR投稿 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">PR投稿</h2>
          <Link to="/posts" className="text-sm hover:underline" style={{ color: '#f29801' }}>
            すべて見る
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 font-medium text-gray-900">まだ投稿がありません</h3>
            <p className="text-sm text-gray-500">
              最初の投稿を登録して、再生数をトラッキングしましょう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="card !p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={
                      post.platform === 'Instagram'
                        ? {
                            background:
                              'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
                          }
                        : { backgroundColor: 'black' }
                    }
                  >
                    {post.platform === 'Instagram' ? (
                      <Instagram className="h-5 w-5 text-white" />
                    ) : (
                      <Music2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-gray-900">{post.productName}</h3>
                    <p className="text-sm text-gray-500">
                      {post.postDate.toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PR投稿の登録セクション */}
      {instagramAccounts.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">PR投稿を登録</h2>
          </div>

          <div className="card !p-4">
            <p className="mb-4 text-sm text-gray-500">
              Instagramから直近の投稿を取得し、PR投稿として登録します
            </p>
            <Button
              onClick={handleFetchPosts}
              disabled={fetchingPosts || !selectedAccountId}
              className="w-full"
            >
              {fetchingPosts ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  取得中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  投稿を取得して登録
                </>
              )}
            </Button>
          </div>

          {/* エラー表示 */}
          {fetchError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                <p className="text-sm text-red-700">{fetchError}</p>
              </div>
            </div>
          )}

          {/* 投稿一覧 */}
          {instagramPosts.length > 0 && (
            <div className="card mt-4 !p-4">
              <h3 className="mb-4 text-base font-semibold text-gray-900">
                直近の投稿（{instagramPosts.length}件）
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {instagramPosts.map((post) => {
                  const imageUrl = getPostImageUrl(post);
                  return (
                    <div
                      key={post.id}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`投稿 ${post.id}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Instagram className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                      {/* ホバー時のオーバーレイ */}
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="w-full p-2">
                          <p className="text-xs text-white">{formatDate(post.timestamp)}</p>
                          {post.media_type === 'VIDEO' && (
                            <span className="mt-1 inline-block rounded bg-white/20 px-1.5 py-0.5 text-xs text-white">
                              動画
                            </span>
                          )}
                          {post.media_type === 'CAROUSEL_ALBUM' && (
                            <span className="mt-1 inline-block rounded bg-white/20 px-1.5 py-0.5 text-xs text-white">
                              アルバム
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 動画バッジ（常時表示） */}
                      {post.media_type === 'VIDEO' && (
                        <div className="absolute right-1 top-1">
                          <span className="inline-flex items-center rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                            ▶
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
