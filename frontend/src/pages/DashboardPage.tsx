import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Music2, Plus, Eye, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { formatNumber } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuth();

  // TODO: Firestoreから実際のデータを取得
  const snsAccounts = [
    { platform: 'Instagram', username: '@example_user', connected: true },
    { platform: 'TikTok', username: '@example_tiktok', connected: false },
  ];

  const recentPosts = [
    {
      id: '1',
      platform: 'Instagram',
      productName: 'サンプル商品A',
      postDate: new Date('2024-12-10'),
      viewCount: 15420,
      status: 'completed',
    },
    {
      id: '2',
      platform: 'TikTok',
      productName: 'サンプル商品B',
      postDate: new Date('2024-12-15'),
      viewCount: null,
      status: 'pending',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* ウェルカムセクション */}
      <section>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          こんにちは、{user?.displayName || 'ユーザー'}さん 👋
        </h1>
        <p className="mt-1 text-gray-500">今日も素敵な投稿を管理しましょう</p>
      </section>

      {/* クイックアクション */}
      <section className="card !p-4">
        <Link to="/post/new" className="group flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20 transition-transform group-hover:scale-105">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">新しい投稿を登録</h3>
            <p className="text-sm text-gray-500">商品PRの投稿URLを追加</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-brand-500" />
        </Link>
      </section>

      {/* SNS連携状況 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">SNS連携</h2>
          <button className="text-sm text-brand-500 hover:underline">設定</button>
        </div>
        <div className="grid gap-3">
          {snsAccounts.map((account) => (
            <div key={account.platform} className="card flex items-center gap-4 !p-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  account.platform === 'Instagram'
                    ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
                    : 'bg-black'
                }`}
              >
                {account.platform === 'Instagram' ? (
                  <Instagram className="h-5 w-5 text-white" />
                ) : (
                  <Music2 className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{account.platform}</h3>
                <p className="text-sm text-gray-500">{account.username}</p>
              </div>
              <span className={`${account.connected ? 'badge-success' : 'badge-warning'}`}>
                {account.connected ? '連携済み' : '要再連携'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 最近の投稿 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">最近の投稿</h2>
          <Link to="/posts" className="text-sm text-brand-500 hover:underline">
            すべて見る
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 font-medium text-gray-900">まだ投稿がありません</h3>
            <p className="mb-4 text-sm text-gray-500">
              最初の投稿を登録して、再生数をトラッキングしましょう
            </p>
            <Link to="/post/new">
              <Button size="sm">投稿を登録する</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="card !p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                      post.platform === 'Instagram'
                        ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
                        : 'bg-black'
                    }`}
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
                  <div className="text-right">
                    {post.viewCount !== null ? (
                      <div className="flex items-center gap-1 font-semibold text-gray-900">
                        <Eye className="h-4 w-4 text-gray-400" />
                        {formatNumber(post.viewCount)}
                      </div>
                    ) : (
                      <span className="badge-warning">計測中</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
