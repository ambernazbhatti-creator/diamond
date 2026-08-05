'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface UserPlan {
  id: number;
  plan_name: string;
  daily_diamonds: number;
  expires_at: string;
  last_collected_at: string | null;
  status: string;
}

interface User {
  name: string;
  diamond_balance: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [userRes, plansRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/user/plans'),
    ]);
    const userData = await userRes.json();
    const plansData = await plansRes.json();
    setUser(userData.user);
    setPlans(plansData.plans || []);
    setLoading(false);
  }

  function canCollect(last: string | null) {
    if (!last) return true;
    const diff = Date.now() - new Date(last).getTime();
    return diff >= 24 * 60 * 60 * 1000;
  }

  function timeUntilNext(last: string | null) {
    if (!last) return null;
    const diff = 24 * 60 * 60 * 1000 - (Date.now() - new Date(last).getTime());
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  async function handleCollect(userPlanId: number) {
    setCollecting(userPlanId);
    setMessage('');
    const res = await fetch('/api/user/collect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPlanId }),
    });
    const data = await res.json();
    setCollecting(null);
    if (res.ok) {
      setMessage(`+${data.diamonds} 💎 collected!`);
      fetchData();
    } else {
      setMessage(data.error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6 md:pt-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">{user?.name} 👋</h1>
        </div>

        {/* Balance card */}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 mb-6 shadow-lg">
          <p className="text-violet-200 text-sm mb-1">Total Diamond Balance</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-white">{user?.diamond_balance ?? 0}</span>
            <span className="text-2xl mb-1">💎</span>
          </div>
          <p className="text-violet-300 text-xs mt-2">
            ≈ Rs. {Math.floor((user?.diamond_balance ?? 0) / 100) * 10} cash value
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4 text-center">
            {message}
          </div>
        )}

        {/* Active plans */}
        {plans.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-white font-semibold mb-1">No active plans</p>
            <p className="text-gray-400 text-sm mb-4">Subscribe to a package to start earning diamonds daily.</p>
            <Link
              href="/packages"
              className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-white font-semibold text-lg">Your Active Plans</h2>
            {plans.map(plan => {
              const ready = canCollect(plan.last_collected_at);
              const countdown = timeUntilNext(plan.last_collected_at);
              const daysLeft = Math.max(0, Math.ceil((new Date(plan.expires_at).getTime() - Date.now()) / 86400000));

              return (
                <div key={plan.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{plan.plan_name}</p>
                      <p className="text-gray-400 text-xs">{daysLeft} days remaining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-violet-400 font-bold">{plan.daily_diamonds} 💎</p>
                      <p className="text-gray-500 text-xs">per day</p>
                    </div>
                  </div>

                  {ready ? (
                    <button
                      onClick={() => handleCollect(plan.id)}
                      disabled={collecting === plan.id}
                      className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {collecting === plan.id ? 'Collecting...' : '💎 Collect Diamonds'}
                    </button>
                  ) : (
                    <div className="w-full bg-gray-800 text-gray-400 font-semibold py-2.5 rounded-xl text-sm text-center">
                      ⏳ Next collect in {countdown}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        {plans.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Link
              href="/packages"
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-violet-500 transition-colors"
            >
              <p className="text-2xl mb-1">📦</p>
              <p className="text-white text-sm font-medium">Add Plan</p>
            </Link>
            <Link
              href="/withdraw"
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center hover:border-violet-500 transition-colors"
            >
              <p className="text-2xl mb-1">💸</p>
              <p className="text-white text-sm font-medium">Withdraw</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}