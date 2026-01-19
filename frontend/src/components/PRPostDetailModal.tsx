import { FC } from 'react';
import { Instagram, X, ExternalLink } from 'lucide-react';
import { PRPostItem, InstagramAccountWithId } from '@/types';
import { formatDateTime, formatMeasurementDateTime, formatNumber } from '@/lib/utils';

interface PRPostDetailModalProps {
  /** 表示する投稿データ */
  post: PRPostItem;
  /** Instagramアカウント一覧（ユーザー名表示用） */
  instagramAccounts: InstagramAccountWithId[];
  /** モーダルを閉じる関数 */
  onClose: () => void;
}

/**
 * PR投稿詳細モーダルコンポーネント
 * PostsPage と DashboardPage で共通利用
 */
export const PRPostDetailModal: FC<PRPostDetailModalProps> = ({
  post,
  instagramAccounts,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="fixed bottom-0 left-0 right-0 top-0 bg-black/50" onClick={onClose} />
      {/* モーダルコンテンツ */}
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* ヘッダー */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-gray-900">投稿詳細</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* サムネイル */}
          <div className="mb-6 aspect-square overflow-hidden rounded-2xl bg-gray-100">
            {post.thumbnailUrl ? (
              <img
                src={post.thumbnailUrl}
                alt={post.campaignName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Instagram className="h-16 w-16 text-gray-300" />
              </div>
            )}
          </div>

          {/* 詳細情報 */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">商品</p>
              <p className="mt-1 font-semibold text-gray-900">{post.campaignName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">投稿日時</p>
              <p className="mt-1 font-semibold text-gray-900">{formatDateTime(post.postedAt)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">計測日時</p>
              <p className="mt-1 font-semibold text-gray-900">
                {formatMeasurementDateTime(post.postedAt)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">アカウント</p>
              <p className="mt-1 font-semibold text-gray-900">
                @{instagramAccounts.find((a) => a.accountId === post.accountId)?.username || '不明'}
              </p>
            </div>

            {/* 計測データ */}
            <div className="border-t border-gray-200 pt-4">
              <p className="mb-3 text-sm font-medium text-gray-900">計測データ</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">再生数</span>
                  <span className="font-semibold text-gray-900">
                    {typeof post.views === 'number' ? `${formatNumber(post.views)} ビュー` : 'ー'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">リーチ数</span>
                  <span className="font-semibold text-gray-900">
                    {typeof post.reach === 'number' ? formatNumber(post.reach) : 'ー'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">保存数</span>
                  <span className="font-semibold text-gray-900">
                    {typeof post.saved === 'number' ? formatNumber(post.saved) : 'ー'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">シェア数</span>
                  <span className="font-semibold text-gray-900">
                    {typeof post.shares === 'number' ? formatNumber(post.shares) : 'ー'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">いいね数</span>
                  <span className="font-semibold text-gray-900">
                    {typeof post.likes === 'number' ? formatNumber(post.likes) : 'ー'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">コメント数</span>
                  <span className="font-semibold text-gray-900">
                    {typeof post.comments === 'number' ? formatNumber(post.comments) : 'ー'}
                  </span>
                </div>
                {post.mediaType === 'VIDEO' && (
                  <>
                    {typeof post.igReelsAvgWatchTime === 'number' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">平均視聴時間</span>
                        <span className="font-semibold text-gray-900">
                          {`${(post.igReelsAvgWatchTime / 1000).toFixed(1)}秒`}
                        </span>
                      </div>
                    )}
                    {typeof post.igReelsVideoViewTotalTime === 'number' && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">総視聴時間</span>
                        <span className="font-semibold text-gray-900">
                          {`${formatNumber(post.igReelsVideoViewTotalTime / 1000)}秒`}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Instagramで見るボタン */}
            {post.permalink && (
              <div className="border-t border-gray-200 pt-4">
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#e5e5e5', color: '#525252' }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Instagramで見る
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
