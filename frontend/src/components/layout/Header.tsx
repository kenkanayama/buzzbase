import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="glass sticky top-0 z-50 border-b border-gray-200/50">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        {/* ロゴ */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <span className="font-display text-xl font-bold text-gray-900">
            Buzz<span className="text-brand-500">Base</span>
          </span>
        </div>

        {/* ユーザーメニュー */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 text-sm text-gray-600 md:flex">
            <User className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{user?.email}</span>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">ログアウト</span>
          </button>
        </div>
      </div>
    </header>
  );
}
