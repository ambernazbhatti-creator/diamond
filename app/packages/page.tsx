'use client';

import { useEffect, useState } from 'react';

interface Plan {
  id: number;
  name: string;
  price_rs: number;
  daily_diamonds: number;
  duration_days: number;
}

const planColors: Record<string, string> = {
  Starter: 'from-blue-600 to-blue-800',
  Basic: 'from-violet-600 to-violet-800',
  Pro: 'from-amber-500 to-orange-700',
  Elite: 'from-rose-600 to-pink-800',
};

const planEmoji: Record<string, string> = {
  Starter: '🌱',
  Basic: '⚡',
  Pro: '🔥',
  Elite: '👑',
};

export default function PackagesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(d => setPlans(d.plans || []));
  }, []);

  async function handleBuy() {
    if (!phone || phone.length < 10) return setError('Enter a valid phone number');
    setLoading(true);
    setError('');

    const res = await fetch('/api/user/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: selected!.id, phone, method }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) return setError(data.error);
    setSuccess('Request submitted! Admin will confirm your payment shortly.');
    setSelected(null);
    setPhone('');
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6 md:pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Packages</h1>
          <p className="text-gray-400 text-sm mt-1">Choose a plan and start earning diamonds daily</p>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl px-4 py-3 mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {plans.map(plan => {
            const totalDiamonds = plan.daily_diamonds * plan.duration_days;
            const cashValue = Math.floor(totalDiamonds / 100) * 10;

            return (
              <div
                key={plan.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${planColors[plan.name] ?? 'from-gray-700 to-gray-900'} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{planEmoji[plan.name] ?? '💎'}</span>
                      <div>
                        <p className="text-white font-bold text-lg">{plan.name}</p>
                        <p className="text-white/70 text-xs">{plan.duration_days} days plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">Rs. {plan.price_rs}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-violet-400 font-bold">{plan.daily_diamonds}</p>
                      <p className="text-gray-500 text-xs">Daily 💎</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-violet-400 font-bold">{totalDiamonds.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">Total 💎</p>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3">
                      <p className="text-violet-400 font-bold">Rs. {cashValue}</p>
                      <p className="text-gray-500 text-xs">Cash value</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelected(plan); setSuccess(''); setError(''); }}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buy modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end md:items-center justify-center px-4 pb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
              <h2 className="text-white font-bold text-lg mb-1">Subscribe to {selected.name}</h2>
              <p className="text-gray-400 text-sm mb-4">Send Rs. {selected.price_rs} to our account, then enter your number below.</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethod('jazzcash')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      method === 'jazzcash'
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    JazzCash
                  </button>
                  <button
                    onClick={() => setMethod('easypaisa')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      method === 'easypaisa'
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    Easypaisa
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-1 block">Your {method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} Number</label>
                <input
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
                <p className="text-amber-400 text-xs">
                  💡 After submitting, admin will send a payment request to your number. Just confirm it in your app.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}