import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPRPostsFlat } from '@/lib/firestore/prPosts';
import { getUserProfile } from '@/lib/firestore/users';
import { PRPostItem, InstagramAccountWithId } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PRPostDetailModal } from '@/components/PRPostDetailModal';
import { getMeasurementDate, formatDate, formatNumber } from '@/lib/utils';
import { useModalHistory } from '@/hooks/useModalHistory';

export function PostsPage() {
  const { user } = useAuth();
  // PRPostItemは既にaccountIdを含む
  const [prPosts, setPrPosts] = useState<PRPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountWithId[]>([]);
  // 詳細ポップアップ用の状態
  const [selectedPost, setSelectedPost] = useState<PRPostItem | null>(null);

  // モーダルの閉じるハンドラ
  const handleClosePostDetail = useCallback(() => {
    setSelectedPost(null);
  }, []);

  // ブラウザの「戻る」ボタン/ジェスチャーでモーダルを閉じるためのフック
  const { closeModal: closePostDetailModal } = useModalHistory(
    selectedPost !== null,
    handleClosePostDetail,
    'posts-page-detail-modal'
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // ユーザープロフィールを取得（アカウント情報用）
        const profile = await getUserProfile(user.uid);
        if (profile && profile.instagramAccounts) {
          const accountsArray = Object.entries(profile.instagramAccounts).map(
            ([accountId, accountInfo]) => ({
              accountId,
              ...accountInfo,
            })
          );
          setInstagramAccounts(accountsArray);
        }

        // PR投稿を取得（getAllPRPostsFlatは投稿日降順でソート済み）
        const posts = await getAllPRPostsFlat(user.uid);
        setPrPosts(posts);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-10 border-b border-gray-200/50">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link
            to="/dashboard"
            className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">PR投稿一覧</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {prPosts.length === 0 ? (
          <div className="card py-10 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#fff8ed' }}
            >
              <Calendar className="h-7 w-7" style={{ color: '#f29801' }} />
            </div>
            <h3 className="mb-2 font-medium text-gray-900">まだPR投稿がありません</h3>
            <p className="mb-5 text-sm text-gray-500">
              ダッシュボードから最初の投稿を登録しましょう
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#f29801' }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f29801')}
            >
              ダッシュボードへ戻る
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {prPosts.map((post) => (
              <button
                key={post.mediaId}
                onClick={() => setSelectedPost(post)}
                className="card w-full !p-4 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  {/* サムネイル */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                    {/* 再生数表示（計測完了時）または空のスペース（計測中時） */}
                    <div className="h-5">
                      {post.status === 'measured' && post.views !== undefined ? (
                        <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                          {formatNumber(post.views)} ビュー
                        </p>
                      ) : (
                        <div className="h-5" /> // 高さを確保するための空のdiv
                      )}
                    </div>
                    <p className="text-xs text-gray-500">投稿日: {formatDate(post.postedAt)}</p>
                    <p className="text-xs text-gray-400">
                      計測日: {formatDate(getMeasurementDate(post.postedAt))}
                    </p>
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
                        計測中
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* PR投稿詳細ポップアップ */}
      {selectedPost && (
        <PRPostDetailModal
          post={selectedPost}
          instagramAccounts={instagramAccounts}
          onClose={closePostDetailModal}
        />
      )}
    </div>
  );
}
