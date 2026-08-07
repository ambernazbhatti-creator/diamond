'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lock, Users, CheckCircle } from 'lucide-react';

interface WithdrawStatus {
  availableWithdrawals: number;
  withdrawalsUsed: number;
  withdrawalUnlocks: number;
  isUnlocked: boolean;
  cashBalance: number;
}

export default function WithdrawPage() {
  const [status, setStatus] = useState<WithdrawStatus | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [method, setMethod] = useState<'jazzcash' | 'easypaisa'>('jazzcash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchStatus(); }, []);

  async function fetchStatus() {
    const res = await fetch('/api/user/withdraw-status');
    const data = await res.json();
    setStatus(data);
  }

  const balance = parseFloat(status?.cashBalance?.toString() ?? '0');
  const amountNum = parseFloat(amount) || 0;
  const isValid = amountNum >= 100 && amountNum <= balance && accountNumber.length >= 10;

  async function handleWithdraw() {
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/user/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountNum, jazzcashNumber: accountNumber, method }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      if (data.error === 'UNLOCK_REQUIRED') {
        setError(data.message);
      } else {
        setError(data.error);
      }
      return;
    }

    setSuccess('Withdrawal request submitted! Admin will process it shortly.');
    setAmount('');
    fetchStatus();
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:pt-24 pb-28 md:pb-6">
      <div className="max-w-md mx-auto space-y-5">

        <div>
          <h1 className="text-2xl font-bold text-white">Withdraw</h1>
          <p className="text-gray-500 text-sm mt-1">Transfer your earnings to JazzCash or Easypaisa</p>
        </div>

        {/* Balance card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-5 shadow-xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-orange-100 text-xs uppercase tracking-wider font-medium">Available Balance</p>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-base font-semibold text-orange-100 mb-0.5">Rs.</span>
              <span className="text-4xl font-bold text-white">{balance.toFixed(2)}</span>
            </div>
            <p className="text-orange-200 text-xs mt-1">Min withdrawal: Rs. 100</p>
          </div>
        </div>

        {/* Unlock status */}
        <div className={`border rounded-2xl p-4 ${
          status.isUnlocked
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-red-500/5 border-red-500/20'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {status.isUnlocked
              ? <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
              : <Lock size={20} className="text-red-400 flex-shrink-0" />
            }
            <div>
              <p className={`font-semibold text-sm ${status.isUnlocked ? 'text-green-400' : 'text-red-400'}`}>
                {status.isUnlocked ? 'Withdrawals Unlocked' : 'Withdrawals Locked'}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {status.isUnlocked
                  ? `${status.availableWithdrawals} withdrawal${status.availableWithdrawals !== 1 ? 's' : ''} remaining`
                  : 'Refer a friend who buys a plan to unlock'
                }
              </p>
            </div>
          </div>

          {/* Unlock progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Unlocks used</span>
              <span className="text-gray-400">{status.withdrawalsUsed} / {status.withdrawalUnlocks}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  status.isUnlocked ? 'bg-green-500' : 'bg-red-500/50'
                }`}
                style={{
                  width: status.withdrawalUnlocks > 0
                    ? `${(status.withdrawalsUsed / status.withdrawalUnlocks) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </div>

          {!status.isUnlocked && (
            <Link
              href="/referral"
              className="mt-3 flex items-center justify-center gap-2 w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              <Users size={16} />
              Go to My Team → Refer a Friend
            </Link>
          )}
        </div>

        {/* How unlocking works */}
        {!status.isUnlocked && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <p className="text-white font-semibold text-sm mb-3">How to Unlock Withdrawals</p>
            <div className="space-y-2.5">
              {[
                { step: '1', text: 'Go to My Team page', sub: 'Copy your referral link' },
                { step: '2', text: 'Share with a friend', sub: 'They register using your link' },
                { step: '3', text: 'Friend buys any plan', sub: 'You get 10 withdrawal slots unlocked' },
                { step: '4', text: 'Withdraw freely', sub: '1 slot used per withdrawal request' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-400 text-xs font-bold">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.text}</p>
                    <p className="text-gray-500 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Withdrawal form — only show if unlocked */}
        {status.isUnlocked && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-4">

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3">
                ✅ {success}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">Amount (Rs.)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">Rs.</span>
                <input
                  type="number"
                  placeholder="100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={100}
                  className="w-full bg-white/3 border border-white/8 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                />
              </div>
              {amountNum > 0 && amountNum < 100 && (
                <p className="text-red-400 text-xs mt-1">Minimum withdrawal is Rs. 100</p>
              )}
              {amountNum > balance && (
                <p className="text-red-400 text-xs mt-1">Amount exceeds your balance</p>
              )}
            </div>

            {/* Quick amounts */}
            <div className="flex gap-2">
              {[100, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  disabled={balance < val}
                  className="flex-1 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/8 text-gray-400 hover:text-amber-400 text-xs font-medium py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Rs. {val}
                </button>
              ))}
              <button
                onClick={() => setAmount(Math.floor(balance).toString())}
                disabled={balance < 100}
                className="flex-1 bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/8 text-gray-400 hover:text-amber-400 text-xs font-medium py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Max
              </button>
            </div>

            {/* Method */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {(['jazzcash', 'easypaisa'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                      method === m
                        ? m === 'jazzcash'
                          ? 'bg-red-500/15 border-red-500/40 text-red-400'
                          : 'bg-green-500/15 border-green-500/40 text-green-400'
                        : 'bg-white/3 border-white/8 text-gray-400 hover:text-white'
                    }`}
                  >
                    {m === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}
                  </button>
                ))}
              </div>
            </div>

            {/* Account number */}
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2 block">
                Your {method === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} Number
              </label>
              <input
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
              />
            </div>

            {/* Summary */}
            {isValid && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You withdraw</span>
                  <span className="text-white font-semibold">Rs. {amountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sent to</span>
                  <span className="text-white font-semibold">{accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/8">
                  <span className="text-gray-400">Slots remaining after</span>
                  <span className="text-amber-400 font-semibold">{status.availableWithdrawals - 1}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleWithdraw}
              disabled={!isValid || loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
            >
              {loading ? 'Submitting...' : `Withdraw Rs. ${amountNum > 0 ? amountNum.toFixed(2) : '0.00'}`}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}