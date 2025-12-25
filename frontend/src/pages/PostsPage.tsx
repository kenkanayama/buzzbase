import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPRPostsFlat } from '@/lib/firestore/prPosts';
import { getUserProfile } from '@/lib/firestore/users';
import { PRPostItem, InstagramAccountWithId } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PostDetailModal } from '@/components/posts/PostDetailModal';
import { PostCard } from '@/components/posts/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function PostsPage() {
  const { user } = useAuth();
  // PRPostItemは既にaccountIdを含む
  const [prPosts, setPrPosts] = useState<PRPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountWithId[]>([]);
  // 詳細ポップアップ用の状態
  const [selectedPost, setSelectedPost] = useState<PRPostItem | null>(null);

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
          <div className="card">
            <EmptyState
              icon={<Calendar className="h-7 w-7" style={{ color: '#f29801' }} />}
              title="まだPR投稿がありません"
              description="ダッシュボードから最初の投稿を登録しましょう"
              action={
                <Link to="/dashboard">
                  <Button>ダッシュボードへ戻る</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {prPosts.map((post) => (
              <PostCard key={post.mediaId} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        )}
      </main>

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
