import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-950 text-center">
      <h1 className="text-6xl mb-4">💎</h1>
      <h2 className="text-3xl font-bold text-white mb-2">EarnsPK</h2>
      <p className="text-gray-400 mb-8 max-w-sm">
        Subscribe to a plan, collect diamonds daily, and convert them to real cash.
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors border border-gray-700"
        >
          Login
        </Link>
      </div>
    </div>
  );
}