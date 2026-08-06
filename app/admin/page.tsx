'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingRefunds: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d.stats));
  }, []);

  const cards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, emoji: '👥', href: '/admin/users' },
    { label: 'Total Collected', value: `Rs. ${stats.totalDeposits}`, emoji: '💰', href: '/admin/deposits' },
    { label: 'Total Paid Out', value: `Rs. ${stats.totalWithdrawals}`, emoji: '💸', href: '/admin/withdrawals' },
    { label: 'Pending Deposits', value: stats.pendingDeposits, emoji: '⏳', href: '/admin/deposits', alert: Number(stats.pendingDeposits) > 0 },
    { label: 'Pending Withdrawals', value: stats.pendingWithdrawals, emoji: '🔔', href: '/admin/withdrawals', alert: Number(stats.pendingWithdrawals) > 0 },
  ] : [];

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">EarnsPK platform summary</p>
      </div>

      {!stats ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(card => (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-gray-900 border rounded-2xl p-5 hover:border-amber-500 transition-colors ${card.alert ? 'border-amber-500/50' : 'border-gray-800'
                }`}
            >
              <p className="text-2xl mb-2">{card.emoji}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
              {card.alert && (
                <p className="text-amber-400 text-xs mt-1">Action needed</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}