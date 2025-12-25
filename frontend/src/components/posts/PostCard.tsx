import { Instagram } from 'lucide-react';
import { PRPostItem } from '@/types';
import { getMeasurementDate, formatDate, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PostCardProps {
  post: PRPostItem;
  onClick: () => void;
}

export function PostCard({ post, onClick }: PostCardProps) {
  return (
    <button
      onClick={onClick}
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
                {formatNumber(post.views)} ビュー
              </p>
            ) : (
              <div className="h-5" />
            )}
          </div>
          <p className="text-xs text-gray-500">投稿日: {formatDate(post.postedAt)}</p>
          <p className="text-xs text-gray-400">
            計測日: {formatDate(getMeasurementDate(post.postedAt))}
          </p>
        </div>
        {/* ステータスバッジ */}
        <div className="flex-shrink-0">
          <StatusBadge status={post.status} />
        </div>
      </div>
    </button>
  );
}
