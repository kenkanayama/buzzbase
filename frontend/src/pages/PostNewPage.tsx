import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Instagram, User, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firestore/users';
import { getInstagramMedia } from '@/lib/api/instagram';
import { InstagramAccountWithId, InstagramMedia } from '@/types';

export function PostNewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // location.state から selectedAccountId を取得
  const { selectedAccountId } = (location.state as { selectedAccountId?: string }) || {};

  // State
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccountWithId | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [posts, setPosts] = useState<InstagramMedia[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 選択されたアカウント情報を取得
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!user || !selectedAccountId) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.instagramAccounts && profile.instagramAccounts[selectedAccountId]) {
          const accountInfo = profile.instagramAccounts[selectedAccountId];
          setSelectedAccount({
            accountId: selectedAccountId,
            ...accountInfo,
          });
        }
      } catch (err) {
        console.error('アカウント情報の取得に失敗しました:', err);
        setError('アカウント情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [user, selectedAccountId]);

  // 直近の投稿を取得
  const handleFetchPosts = async () => {
    if (!selectedAccountId) return;

    setFetchingPosts(true);
    setError(null);
    setPosts([]);

    try {
      // バックエンドAPI経由でInstagram投稿一覧を取得
      // トークンはバックエンドで安全に取得・使用される
      const data = await getInstagramMedia(selectedAccountId);

      if (data.media && data.media.data) {
        setPosts(data.media.data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('投稿の取得に失敗しました:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : '投稿の取得に失敗しました。ネットワークエラーが発生した可能性があります。';
      setError(errorMessage);
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

  // selectedAccountIdがない場合はダッシュボードにリダイレクト
  if (!selectedAccountId) {
    return (
      <div className="animate-fade-in">
        <div className="card py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="mb-2 font-medium text-gray-900">アカウントが選択されていません</h3>
          <p className="mb-4 text-sm text-gray-500">
            ダッシュボードでInstagramアカウントを選択してから投稿登録を行ってください
          </p>
          <Link to="/dashboard">
            <Button size="sm">ダッシュボードに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">投稿を登録</h1>
      </div>

      {/* 選択中のアカウント表示 */}
      <div className="card !p-4">
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium text-gray-500">選択中のアカウント</p>
        </div>
        {loading ? (
          <div className="mt-3 flex items-center justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : selectedAccount ? (
          <div className="mt-3 flex items-center gap-3">
            {/* プロフィール画像 */}
            {selectedAccount.profilePictureUrl ? (
              <img
                src={selectedAccount.profilePictureUrl}
                alt={selectedAccount.name || selectedAccount.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            )}
            {/* アカウント情報 */}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">
                {selectedAccount.name || selectedAccount.username}
              </p>
              <p className="truncate text-sm text-gray-500">@{selectedAccount.username}</p>
            </div>
            {/* Instagramアイコン */}
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{
                background: 'linear-gradient(135deg, #833AB4 0%, #E1306C 50%, #F77737 100%)',
              }}
            >
              <Instagram className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">アカウント情報を取得できませんでした</p>
        )}
      </div>

      {/* 投稿取得ボタン */}
      <div className="card !p-6">
        <h2 className="mb-2 text-base font-semibold text-gray-900">投稿一覧を取得</h2>
        <p className="mb-4 text-sm text-gray-500">
          選択中のアカウントから直近の投稿を取得します。 PR投稿を選択して登録してください。
        </p>
        <Button
          onClick={handleFetchPosts}
          disabled={fetchingPosts || !selectedAccount}
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
              直近の投稿を取得する
            </>
          )}
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 投稿一覧 */}
      {posts.length > 0 && (
        <div className="card !p-4">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            直近の投稿（{posts.length}件）
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => {
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

      {/* 投稿がない場合 */}
      {!fetchingPosts && posts.length === 0 && !error && selectedAccount && (
        <div className="card py-8 text-center">
          <p className="text-sm text-gray-500">
            「直近の投稿を取得する」ボタンをクリックして投稿を取得してください
          </p>
        </div>
      )}
    </div>
  );
}
