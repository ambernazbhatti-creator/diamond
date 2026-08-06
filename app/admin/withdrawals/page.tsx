'use client';

import { useEffect, useState } from 'react';

interface Withdrawal {
  id: number;
  user_name: string;
  user_email: string;
  diamonds_spent: number;
  amount_rs: number;
  ads_watched: number;
  jazzcash_number: string;
  method: string;
  status: string;
  requested_at: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid' | 'rejected'>('pending');
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => { fetchWithdrawals(); }, []);

  async function fetchWithdrawals() {
    const res = await fetch('/api/admin/withdrawals');
    const data = await res.json();
    setWithdrawals(data.withdrawals || []);
    setLoading(false);
  }

  async function handleAction(withdrawalId: number, action: 'approve' | 'paid' | 'reject') {
    setActing(withdrawalId);
    await fetch('/api/admin/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ withdrawalId, action }),
    });
    setActing(null);
    fetchWithdrawals();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      approved: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      paid: 'bg-green-500/10 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return `text-xs px-2 py-0.5 rounded-full border ${map[status] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`;
  }

  const filtered = withdrawals.filter(w => filter === 'all' || w.status === filter);

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-gray-400 text-sm mt-1">Approve and process cash withdrawals</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['pending', 'approved', 'paid', 'rejected', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-amber-600 text-white' : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-400">No {filter} withdrawals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(wr => (
            <div key={wr.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{wr.user_name}</p>
                  <p className="text-gray-500 text-xs">{wr.user_email}</p>
                </div>
                <span className={statusBadge(wr.status)}>{wr.status}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Amount</p>
                  <p className="text-white text-sm font-medium">Rs. {wr.amount_rs}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Diamonds</p>
                  <p className="text-white text-sm font-medium">{wr.diamonds_spent} 💎</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Send To</p>
                  <p className="text-white text-sm font-medium">{wr.jazzcash_number}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Method</p>
                  <p className="text-white text-sm font-medium capitalize">{wr.method}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">{formatDate(wr.requested_at)}</p>
                <div className="flex gap-2">
                  {wr.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(wr.id, 'reject')}
                        disabled={acting === wr.id}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(wr.id, 'approve')}
                        disabled={acting === wr.id}
                        className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                      >
                        {acting === wr.id ? 'Processing...' : 'Approve'}
                      </button>
                    </>
                  )}
                  {wr.status === 'approved' && (
                    <button
                      onClick={() => handleAction(wr.id, 'paid')}
                      disabled={acting === wr.id}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      {acting === wr.id ? 'Processing...' : 'Mark as Paid'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}