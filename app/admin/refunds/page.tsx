'use client';

import { useEffect, useState } from 'react';

interface Refund {
  id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  price_rs: number;
  started_at: string;
  expires_at: string;
  refund_status: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchRefunds(); }, []);

  async function fetchRefunds() {
    const res = await fetch('/api/admin/refunds');
    const data = await res.json();
    setRefunds(data.refunds || []);
    setLoading(false);
  }

  async function handleRefund(planId: number) {
    setActing(planId);
    await fetch('/api/admin/refunds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    setActing(null);
    setSuccess('Refund marked as completed');
    fetchRefunds();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Refunds</h1>
        <p className="text-gray-400 text-sm mt-1">Expired plans awaiting refund</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : refunds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-400">No pending refunds</p>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map(r => (
            <div key={r.id} className="bg-gray-900 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{r.user_name}</p>
                  <p className="text-gray-500 text-xs">{r.user_email}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/30">
                  pending refund
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Plan</p>
                  <p className="text-white text-sm font-medium">{r.plan_name}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Refund Amount</p>
                  <p className="text-green-400 text-sm font-bold">Rs. {r.price_rs}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5">
                  <p className="text-gray-500 text-xs">Expired On</p>
                  <p className="text-white text-sm font-medium">{formatDate(r.expires_at)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-xs">Started {formatDate(r.started_at)}</p>
                <button
                  onClick={() => handleRefund(r.id)}
                  disabled={acting === r.id}
                  className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
                >
                  {acting === r.id ? 'Processing...' : '✅ Mark Refunded'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}