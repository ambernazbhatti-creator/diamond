'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', referralCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setForm(f => ({ ...f, referralCode: ref.toUpperCase() }));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error);
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">💎</h1>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 mt-1 text-sm">Start earning cash today</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/3 rounded-2xl p-6 space-y-4 border border-white/8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {form.referralCode && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <span>🎯</span>
              <span>Referral code applied: <strong>{form.referralCode}</strong></span>
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1.5 block">
              Referral Code <span className="text-gray-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Enter referral code"
              value={form.referralCode}
              onChange={e => setForm({ ...form, referralCode: e.target.value.toUpperCase() })}
              className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition-colors text-sm font-mono tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}