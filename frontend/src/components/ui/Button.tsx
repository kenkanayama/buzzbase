import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

// =====================================================
// Button コンポーネント
// デザインシステム: フラットデザイン、オレンジ/レッドアクセント
// =====================================================

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    // プライマリ: オレンジ（メインアクション）
    primary: 'text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 shadow-button',
    // セカンダリ: ボーダー付き（サブアクション）
    secondary:
      'text-neutral-700 bg-white border-2 border-neutral-200 hover:border-primary-500 hover:text-primary-500',
    // ゴースト: 透明（テキストリンク風）
    ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    // デンジャー: レッド（削除等の警告アクション）
    danger:
      'text-white bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 shadow-button',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
