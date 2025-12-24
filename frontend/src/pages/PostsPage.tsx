import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPRPostsFlat } from '@/lib/firestore/prPosts';
import { PRPostItem } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function PostsPage() {
  const { user } = useAuth();
  const [prPosts, setPrPosts] = useState<Array<PRPostItem & { accountId: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRPosts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // PR投稿を取得（getAllPRPostsFlatは投稿日降順でソート済み）
        const posts = await getAllPRPostsFlat(user.uid);
        setPrPosts(posts);
      } catch (error) {
        console.error('PR投稿の取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPRPosts();
  }, [user]);

  // 日付フォーマット
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
              <div key={post.mediaId} className="card !p-4">
                <div className="flex items-start gap-4">
                  {/* サムネイル */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt={post.campaignName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Instagram className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-gray-900">{post.campaignName}</h3>
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
      </main>
    </div>
  );
}
