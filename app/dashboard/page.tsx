'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Package, ArrowDownCircle, Clock } from 'lucide-react';

interface UserPlan {
  id: number;
  plan_name: string;
  daily_cash: number;
  expires_at: string;
  last_collected_at: string | null;
  status: string;
}

interface User {
  name: string;
  cash_balance: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchData(); }, []);

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
    return Date.now() - new Date(last).getTime() >= 24 * 60 * 60 * 1000;
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
      setMessage(`+Rs. ${data.cash} added to your balance`);
      fetchData();
    } else {
      setMessage(data.error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const balance = parseFloat(user?.cash_balance?.toString() ?? '0');
  const readyPlans = plans.filter(p => canCollect(p.last_collected_at));

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:pt-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Good day,</p>
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          </div>
          {readyPlans.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              {readyPlans.length} reward{readyPlans.length > 1 ? 's' : ''} ready
            </div>
          )}
        </div>

        {/* Balance card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-orange-100 text-xs font-medium uppercase tracking-wider">Available Balance</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-lg font-semibold text-orange-100 mb-1">Rs.</span>
                  <span className="text-5xl font-bold text-white">{balance.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5">
                <TrendingUp size={20} className="text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/20 pt-4">
              <p className="text-orange-100 text-xs">Min withdrawal: Rs. 100</p>
              <Link
                href="/withdraw"
                className="bg-black/25 hover:bg-black/40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Withdraw →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Plans', value: plans.length, icon: Package, href: '/packages' },
            { label: 'Withdrawable', value: balance >= 100 ? 'Yes' : 'No', icon: ArrowDownCircle, href: '/withdraw' },
            { label: 'History', value: 'View all', icon: Clock, href: '/history' },
          ].map(stat => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white/3 hover:bg-white/6 border border-white/8 hover:border-amber-500/30 rounded-xl p-3 transition-all"
            >
              <stat.icon size={16} className="text-amber-400 mb-2" />
              <p className="text-white font-semibold text-sm">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 text-center">
            ✅ {message}
          </div>
        )}

        {/* Plans */}
        {plans.length === 0 ? (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-amber-400" />
            </div>
            <p className="text-white font-semibold mb-1">No active plans</p>
            <p className="text-gray-500 text-sm mb-5">Subscribe to a package to start earning cash every day.</p>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Browse Packages →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white font-semibold">Active Plans</p>
            {plans.map(plan => {
              const ready = canCollect(plan.last_collected_at);
              const countdown = timeUntilNext(plan.last_collected_at);
              const daysLeft = Math.max(0, Math.ceil((new Date(plan.expires_at).getTime() - Date.now()) / 86400000));
              const progress = ((30 - daysLeft) / 30) * 100;

              return (
                <div
                  key={plan.id}
                  className={`bg-white/3 border rounded-2xl p-4 transition-all ${
                    ready ? 'border-amber-500/30 shadow-lg shadow-amber-500/5' : 'border-white/8'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">{plan.plan_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{daysLeft} days remaining</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-bold">Rs. {parseFloat(plan.daily_cash?.toString()).toFixed(2)}</p>
                      <p className="text-gray-600 text-xs">per day</p>
                    </div>
                  </div>

                  <div className="h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {ready ? (
                    <button
                      onClick={() => handleCollect(plan.id)}
                      disabled={collecting === plan.id}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black font-bold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-amber-500/20"
                    >
                      {collecting === plan.id ? 'Collecting...' : '💰 Collect Rs. ' + parseFloat(plan.daily_cash?.toString()).toFixed(2)}
                    </button>
                  ) : (
                    <div className="w-full bg-white/5 text-gray-500 font-medium py-2.5 rounded-xl text-sm text-center">
                      ⏳ Next collect in {countdown}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {plans.length > 0 && (
          <Link
            href="/packages"
            className="flex items-center justify-center gap-2 w-full bg-white/3 hover:bg-white/6 border border-white/8 hover:border-amber-500/30 text-gray-400 hover:text-white font-medium py-3 rounded-xl text-sm transition-all"
          >
            <Package size={16} />
            Add Another Plan
          </Link>
        )}
      </div>
    </div>
  );
}