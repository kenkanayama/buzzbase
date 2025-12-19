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
    <div className="space-y-8 animate-fade-in">
      {/* ウェルカムセクション */}
      <section>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          こんにちは、{user?.displayName || 'ユーザー'}さん 👋
        </h1>
        <p className="text-gray-500 mt-1">今日も素敵な投稿を管理しましょう</p>
      </section>

      {/* クイックアクション */}
      <section className="card !p-4">
        <Link to="/post/new" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">新しい投稿を登録</h3>
            <p className="text-sm text-gray-500">商品PRの投稿URLを追加</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition-colors" />
        </Link>
      </section>

      {/* SNS連携状況 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SNS連携</h2>
          <button className="text-sm text-brand-500 hover:underline">設定</button>
        </div>
        <div className="grid gap-3">
          {snsAccounts.map((account) => (
            <div key={account.platform} className="card !p-4 flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  account.platform === 'Instagram'
                    ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
                    : 'bg-black'
                }`}
              >
                {account.platform === 'Instagram' ? (
                  <Instagram className="w-5 h-5 text-white" />
                ) : (
                  <Music2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{account.platform}</h3>
                <p className="text-sm text-gray-500">{account.username}</p>
              </div>
              <span
                className={`${
                  account.connected ? 'badge-success' : 'badge-warning'
                }`}
              >
                {account.connected ? '連携済み' : '要再連携'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 最近の投稿 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近の投稿</h2>
          <Link to="/posts" className="text-sm text-brand-500 hover:underline">
            すべて見る
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">まだ投稿がありません</h3>
            <p className="text-sm text-gray-500 mb-4">最初の投稿を登録して、再生数をトラッキングしましょう</p>
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      post.platform === 'Instagram'
                        ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
                        : 'bg-black'
                    }`}
                  >
                    {post.platform === 'Instagram' ? (
                      <Instagram className="w-5 h-5 text-white" />
                    ) : (
                      <Music2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{post.productName}</h3>
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
                      <div className="flex items-center gap-1 text-gray-900 font-semibold">
                        <Eye className="w-4 h-4 text-gray-400" />
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

