import { Instagram, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { PRPostItem, InstagramAccountWithId } from '@/types';
import { getMeasurementDate, formatDate, formatNumber } from '@/lib/utils';

interface PostDetailModalProps {
  post: PRPostItem;
  instagramAccounts: InstagramAccountWithId[];
  onClose: () => void;
}

export function PostDetailModal({ post, instagramAccounts, onClose }: PostDetailModalProps) {
  return (
    <Modal isOpen={true} onClose={onClose} title="投稿詳細" maxHeight="max-h-[90vh]">
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
            <p className="text-sm text-gray-500">投稿日</p>
            <p className="mt-1 font-semibold text-gray-900">{formatDate(post.postedAt)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">計測日</p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatDate(getMeasurementDate(post.postedAt))}
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
                  {post.status === 'measured' && typeof post.views === 'number'
                    ? `${formatNumber(post.views)} ビュー`
                    : 'ー'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">リーチ数</span>
                <span className="font-semibold text-gray-900">
                  {post.status === 'measured' && typeof post.reach === 'number'
                    ? formatNumber(post.reach)
                    : 'ー'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">保存数</span>
                <span className="font-semibold text-gray-900">
                  {post.status === 'measured' && typeof post.saved === 'number'
                    ? formatNumber(post.saved)
                    : 'ー'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">いいね数</span>
                <span className="font-semibold text-gray-900">
                  {post.status === 'measured' && typeof post.likes === 'number'
                    ? formatNumber(post.likes)
                    : 'ー'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">コメント数</span>
                <span className="font-semibold text-gray-900">
                  {post.status === 'measured' && typeof post.comments === 'number'
                    ? formatNumber(post.comments)
                    : 'ー'}
                </span>
              </div>
              {post.mediaType === 'VIDEO' && (
                <>
                  {typeof post.igReelsAvgWatchTime === 'number' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">平均視聴時間</span>
                      <span className="font-semibold text-gray-900">
                        {post.status === 'measured'
                          ? `${(post.igReelsAvgWatchTime / 1000).toFixed(1)}秒`
                          : 'ー'}
                      </span>
                    </div>
                  )}
                  {typeof post.igReelsVideoViewTotalTime === 'number' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">総視聴時間</span>
                      <span className="font-semibold text-gray-900">
                        {post.status === 'measured'
                          ? `${formatNumber(post.igReelsVideoViewTotalTime / 1000)}秒`
                          : 'ー'}
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
    </Modal>
  );
}
