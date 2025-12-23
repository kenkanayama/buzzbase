import { NavLink } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'ホーム' },
  { to: '/profile', icon: User, label: 'マイページ' },
];

export function MobileNav() {
  return (
    <nav className="glass safe-bottom fixed bottom-0 left-0 right-0 border-t border-gray-200/50 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 transition-colors',
                isActive ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'
              )
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
