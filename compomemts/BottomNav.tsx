'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, ArrowDownCircle, Clock, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/withdraw', label: 'Withdraw', icon: ArrowDownCircle },
  { href: '/history', label: 'History', icon: Clock },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const hideOn = ['/', '/login', '/register'];
  if (hideOn.some(p => pathname === p) || pathname.startsWith('/admin')) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-[#111]/95 backdrop-blur-xl border-t border-white/8 flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs transition-colors ${
                  active ? 'text-amber-400' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                <span className={active ? 'font-semibold' : ''}>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs text-gray-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={21} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#111]/95 backdrop-blur-xl border-b border-white/8 px-8 h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💎</span>
          <span className="text-white font-bold tracking-tight">EarnsPK</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-amber-500/10 text-amber-400 font-medium'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors ml-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}