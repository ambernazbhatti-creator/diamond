'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, ArrowDownCircle, Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/withdraw', label: 'Withdraw', icon: ArrowDownCircle },
  { href: '/history', label: 'History', icon: Clock },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const hideOn = ['/', '/login', '/register', '/admin'];
  if (hideOn.some(p => pathname === p || pathname.startsWith('/admin'))) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 flex md:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors ${
                active ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-8 h-16 items-center justify-between">
        <span className="text-violet-400 font-bold text-lg">💎 EarnsPK</span>
        <div className="flex items-center gap-6">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  active ? 'text-violet-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}