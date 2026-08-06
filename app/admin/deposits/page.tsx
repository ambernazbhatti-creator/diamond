'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface Deposit {
  id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  amount_rs: number;
  user_phone: string;
  method: string;
  transaction_id: string;
  screenshot_url: string | null;
  notes: string | null;
  status: string;
  requested_at: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending');
  const [acting, setActing] = useState<number | null>(null);

  useEffect(() => { fetchDeposits(); }, []);

  async function fetchDeposits() {
    const res = await fetch('/api/admin/deposits');
    const data = await res.json();
    setDeposits(data.deposits || []);
    setLoading(false);
  }

  async function handleAction(depositId: number, action: 'confirm' | 'reject') {
    setActing(depositId);
    await fetch('/api/admin/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action }),
    });
    setActing(null);
    fetchDeposits();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      confirmed: 'bg-green-500/10 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return `text-xs px-2 py-0.5 rounded-full border ${map[status] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`;
  }

  const filtered = deposits.filter(d => filter === 'all' || d.status === filter);

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Deposits</h1>
        <p className="text-gray-400 text-sm mt-1">Review and approve payment requests</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['pending', 'confirmed', 'rejected', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-amber-500 text-white'
                : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
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
          <p className="text-gray-400">No {filter} deposits</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(dep => (
            <div key={dep.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{dep.user_name}</p>
                  <p className="text-gray-500 text-xs">{dep.user_email}</p>
                </div>
                <span className={statusBadge(dep.status)}>{dep.status}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Plan</p>
                  <p className="text-white text-sm font-medium">{dep.plan_name}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Amount</p>
                  <p className="text-white text-sm font-medium">Rs. {dep.amount_rs}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Method</p>
                  <p className="text-white text-sm font-medium capitalize">{dep.method}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Their Number</p>
                  <p className="text-white text-sm font-medium">{dep.user_phone}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5 col-span-2 md:col-span-2">
                  <p className="text-gray-500 text-xs">Transaction ID</p>
                  <p className="text-amber-400 text-sm font-bold">{dep.transaction_id}</p>
                </div>
              </div>

              {dep.screenshot_url && (
                <a
                  href={dep.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-xs mb-3 transition-colors"
                >
                  <ExternalLink size={14} />
                  View Payment Screenshot
                </a>
              )}

              {dep.notes && (
                <div className="bg-gray-800 rounded-xl px-3 py-2 mb-3">
                  <p className="text-gray-500 text-xs">User note: <span className="text-gray-300">{dep.notes}</span></p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">{formatDate(dep.requested_at)}</p>
                {dep.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(dep.id, 'reject')}
                      disabled={acting === dep.id}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(dep.id, 'confirm')}
                      disabled={acting === dep.id}
                      className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      {acting === dep.id ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}