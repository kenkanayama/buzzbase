import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'ホーム' },
  { to: '/post/new', icon: PlusCircle, label: '投稿登録' },
  { to: '/profile', icon: User, label: 'マイページ' },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden glass border-t border-gray-200/50 safe-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-brand-500'
                  : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

