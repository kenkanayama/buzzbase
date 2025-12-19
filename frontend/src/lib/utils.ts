import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名をマージするユーティリティ
 * clsx + tailwind-merge の組み合わせで競合を解決
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付をフォーマット
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * 数値を簡略表記（1000 -> 1K）
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * 7日後の日付を計算
 */
export function getDateAfter7Days(startDate: Date): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + 7);
  return result;
}

/**
 * 投稿から何日経過したか計算
 */
export function getDaysSincePost(postDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - postDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

