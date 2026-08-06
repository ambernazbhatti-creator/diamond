'use client';

import { useEffect, useState } from 'react';

interface Collection {
  id: number;
  cash_earned: number;
  collected_at: string;
  plan_name: string;
}

interface Withdrawal {
  id: number;
  amount_rs: number;
  status: string;
  requested_at: string;
  method: string;
}

interface Deposit {
  id: number;
  amount_rs: number;
  status: string;
  requested_at: string;
  plan_name: string;
  method: string;
}

type Tab = 'collections' | 'withdrawals' | 'deposits';

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('collections');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [colRes, wdRes, depRes] = await Promise.all([
      fetch('/api/user/history/collections'),
      fetch('/api/user/history/withdrawals'),
      fetch('/api/user/history/deposits'),
    ]);
    const [colData, wdData, depData] = await Promise.all([
      colRes.json(), wdRes.json(), depRes.json(),
    ]);
    setCollections(colData.collections || []);
    setWithdrawals(wdData.withdrawals || []);
    setDeposits(depData.deposits || []);
    setLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      approved:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
      paid:      'bg-green-500/10 text-green-400 border-green-500/20',
      rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return `text-xs px-2 py-0.5 rounded-full border font-medium ${map[status] ?? 'bg-white/5 text-gray-400 border-white/10'}`;
  }

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'collections', label: 'Earnings', emoji: '💰' },
    { key: 'withdrawals', label: 'Withdrawals', emoji: '💸' },
    { key: 'deposits', label: 'Deposits', emoji: '📦' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-gray-500 text-sm mt-1">All your activity in one place</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/3 border border-white/8 rounded-2xl p-1 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'collections' && (
              <div className="space-y-2">
                {collections.length === 0 ? <Empty text="No earnings yet" /> : collections.map(c => (
                  <div key={c.id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">+Rs. {parseFloat(c.cash_earned?.toString()).toFixed(2)}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{c.plan_name}</p>
                    </div>
                    <p className="text-gray-600 text-xs">{formatDate(c.collected_at)}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'withdrawals' && (
              <div className="space-y-2">
                {withdrawals.length === 0 ? <Empty text="No withdrawals yet" /> : withdrawals.map(w => (
                  <div key={w.id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold">Rs. {parseFloat(w.amount_rs?.toString()).toFixed(2)}</p>
                      <span className={statusBadge(w.status)}>{w.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-xs capitalize">{w.method}</p>
                      <p className="text-gray-600 text-xs">{formatDate(w.requested_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'deposits' && (
              <div className="space-y-2">
                {deposits.length === 0 ? <Empty text="No deposits yet" /> : deposits.map(d => (
                  <div key={d.id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-semibold">{d.plan_name} — Rs. {d.amount_rs}</p>
                      <span className={statusBadge(d.status)}>{d.status}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-500 text-xs capitalize">{d.method}</p>
                      <p className="text-gray-600 text-xs">{formatDate(d.requested_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-3">📭</p>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}