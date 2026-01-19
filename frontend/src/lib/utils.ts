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
 * 投稿日から計測完了日（7日目）を計算する
 * @param postedAt - 投稿日時
 * @returns 計測完了日（投稿日から7日目）
 * @description インサイトデータは投稿登録時〜7日目まで毎日取得されます
 */
export function getMeasurementDate(postedAt: Date): Date {
  const measurementDate = new Date(postedAt);
  measurementDate.setDate(measurementDate.getDate() + 7);
  return measurementDate;
}

/**
 * 日付を日本語形式でフォーマットする
 * @param date - 日付オブジェクト
 * @returns フォーマットされた日付文字列（例: "2024年1月1日"）
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 日時を日本語形式でフォーマットする（投稿詳細用）
 * @param date - 日付オブジェクト
 * @returns フォーマットされた日時文字列（例: "2024年1月15日 14時30分"）
 */
export function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${year}年${month}月${day}日 ${hours}時${minutes}分`;
}

/**
 * 計測日時を日本語形式でフォーマットする（投稿詳細用）
 * 計測日は投稿日から7日後、時刻は投稿日時の時を使用
 * @param postedAt - 投稿日時
 * @returns フォーマットされた計測日時文字列（例: "2024年1月22日 14時頃"）
 */
export function formatMeasurementDateTime(postedAt: Date): string {
  const measurementDate = getMeasurementDate(postedAt);
  const year = measurementDate.getFullYear();
  const month = measurementDate.getMonth() + 1;
  const day = measurementDate.getDate();
  const hours = postedAt.getHours(); // 投稿日時の時を使用
  return `${year}年${month}月${day}日 ${hours}時頃`;
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
