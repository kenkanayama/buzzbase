import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Calendar, ArrowLeft, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPRPostsFlat } from '@/lib/firestore/prPosts';
import { getUserProfile } from '@/lib/firestore/users';
import { PRPostItem, InstagramAccountWithId } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getMeasurementDate, formatDate, formatNumber } from '@/lib/utils';

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
        console.error('Failed to fetch data:', error);
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
          <h1 className="text-lg font-semibold text-gray-900">PR Posts</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {prPosts.length === 0 ? (
          <div className="card py-10 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#fff8ed' }}
            >
              <Calendar className="h-7 w-7" style={{ color: '#f29801' }} />
            </div>
            <h3 className="mb-2 font-medium text-gray-900">No PR Posts Yet</h3>
            <p className="mb-5 text-sm text-gray-500">
              Register your first post from the dashboard
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#f29801' }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e38500')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f29801')}
            >
              Back to Dashboard
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
                    {/* 再生数表示（計測完了時）または空のスペース（計測待ち時） */}
                    <div className="h-5">
                      {post.status === 'measured' && post.views !== undefined ? (
                        <p className="text-sm font-semibold" style={{ color: '#f87171' }}>
                          {formatNumber(post.views)} views
                        </p>
                      ) : (
                        <div className="h-5" /> // Empty div to maintain height
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Posted: {formatDate(post.postedAt)}</p>
                    <p className="text-xs text-gray-400">
                      Measurement Date: {formatDate(getMeasurementDate(post.postedAt))}
                    </p>
                  </div>
                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    {post.status === 'measured' ? (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
                      >
                        Measured
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        style={{ backgroundColor: '#fff8ed', color: '#f29801' }}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* PR Post Detail Popup */}
      {selectedPost && (
        <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="fixed bottom-0 left-0 right-0 top-0 bg-black/50"
            onClick={() => setSelectedPost(null)}
          />
          {/* Modal Content */}
          <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-gray-900">Post Details</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Thumbnail */}
              <div className="mb-6 aspect-square overflow-hidden rounded-2xl bg-gray-100">
                {selectedPost.thumbnailUrl ? (
                  <img
                    src={selectedPost.thumbnailUrl}
                    alt={selectedPost.campaignName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Instagram className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="mt-1 font-semibold text-gray-900">{selectedPost.campaignName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Posted Date</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatDate(selectedPost.postedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Measurement Date</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatDate(getMeasurementDate(selectedPost.postedAt))}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    @
                    {instagramAccounts.find((a) => a.accountId === selectedPost.accountId)
                      ?.username || 'Unknown'}
                  </p>
                </div>

                {/* Measurement Data */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="mb-3 text-sm font-medium text-gray-900">Measurement Data</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Views</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPost.status === 'measured' &&
                        typeof selectedPost.views === 'number'
                          ? `${formatNumber(selectedPost.views)} views`
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reach</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPost.status === 'measured' &&
                        typeof selectedPost.reach === 'number'
                          ? formatNumber(selectedPost.reach)
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Saves</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPost.status === 'measured' &&
                        typeof selectedPost.saved === 'number'
                          ? formatNumber(selectedPost.saved)
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPost.status === 'measured' &&
                        typeof selectedPost.likes === 'number'
                          ? formatNumber(selectedPost.likes)
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Comments</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPost.status === 'measured' &&
                        typeof selectedPost.comments === 'number'
                          ? formatNumber(selectedPost.comments)
                          : '-'}
                      </span>
                    </div>
                    {selectedPost.mediaType === 'VIDEO' && (
                      <>
                        {typeof selectedPost.igReelsAvgWatchTime === 'number' && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Avg. Watch Time</span>
                            <span className="font-semibold text-gray-900">
                              {selectedPost.status === 'measured'
                                ? `${(selectedPost.igReelsAvgWatchTime / 1000).toFixed(1)}s`
                                : '-'}
                            </span>
                          </div>
                        )}
                        {typeof selectedPost.igReelsVideoViewTotalTime === 'number' && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Watch Time</span>
                            <span className="font-semibold text-gray-900">
                              {selectedPost.status === 'measured'
                                ? `${formatNumber(selectedPost.igReelsVideoViewTotalTime / 1000)}s`
                                : '-'}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* View on Instagram Button */}
                {selectedPost.permalink && (
                  <div className="border-t border-gray-200 pt-4">
                    <a
                      href={selectedPost.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                      style={{ borderColor: '#e5e5e5', color: '#525252' }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Instagram
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
