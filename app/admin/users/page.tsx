'use client';

import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  cash_balance: number;
  active_plans: number;
  total_deposits: number;
  total_deposited: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      setUsers(d.users || []);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-400 text-sm mt-1">{users.length} total registered users</p>
      </div>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors mb-6"
      />

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{u.name}</p>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                </div>
                <p className="text-amber-400 font-bold">Rs. {parseFloat(u.cash_balance?.toString() ?? '0').toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-white text-sm font-bold">{u.active_plans}</p>
                  <p className="text-gray-500 text-xs">Active Plans</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-white text-sm font-bold">{u.total_deposits}</p>
                  <p className="text-gray-500 text-xs">Deposits</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-white text-sm font-bold">Rs. {u.total_deposited}</p>
                  <p className="text-gray-500 text-xs">Total Paid</p>
                </div>
              </div>

              <p className="text-gray-600 text-xs mt-3">Joined {formatDate(u.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}