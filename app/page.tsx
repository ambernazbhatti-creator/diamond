import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">💎</span>
          <span className="text-white font-bold tracking-tight">EarnsPK</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
          Pakistan's #1 Diamond Earning Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-2xl">
          Earn Daily Diamonds,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            Convert to Cash
          </span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
          Subscribe to a plan, collect your diamonds every 24 hours, and withdraw real money to your JazzCash or Easypaisa account.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
          >
            Start Earning Now
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-sm"
          >
            Login to Account
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-14 border-t border-white/5 pt-10">
          {[
            { value: '4', label: 'Active Plans' },
            { value: '24hr', label: 'Daily Rewards' },
            { value: '100%', label: 'Secure Payouts' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans preview */}
      <div className="px-6 pb-16 max-w-4xl mx-auto w-full">
        <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-6 font-medium">Available Plans</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Starter', price: 199, diamonds: 200, emoji: '🌱' },
            { name: 'Basic', price: 499, diamonds: 300, emoji: '⚡' },
            { name: 'Pro', price: 999, diamonds: 5000, emoji: '🔥' },
            { name: 'Elite', price: 1999, diamonds: 1000, emoji: '👑' },
          ].map(p => (
            <div key={p.name} className="bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-amber-500/30 transition-colors">
              <p className="text-2xl mb-2">{p.emoji}</p>
              <p className="text-white font-semibold text-sm">{p.name}</p>
              <p className="text-amber-400 font-bold mt-1">Rs. {p.price}</p>
              <p className="text-gray-500 text-xs mt-1">{p.diamonds} 💎 /day</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}