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
 * 投稿日から計測日（7日後）を計算する
 * @param postedAt - 投稿日時
 * @returns 計測日時（投稿日から7日後）
 */
export function getMeasurementDate(postedAt: Date): Date {
  const measurementDate = new Date(postedAt);
  measurementDate.setDate(measurementDate.getDate() + 7);
  return measurementDate;
}

/**
 * Format date in English locale
 * @param date - Date object
 * @returns Formatted date string (e.g., "Jan 1, 2024")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 数値を短縮形式でフォーマットする（再生数など）
 * @param num - 数値
 * @returns フォーマットされた数値文字列（例: "1.2K", "1.5M"）
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}
