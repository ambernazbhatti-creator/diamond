'use client';

import { useEffect, useState } from 'react';
import { Copy, CheckCircle, Users, TrendingUp, Gift } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  created_at: string;
  bought_plan: boolean;
}

interface Bonus {
  bonus_type: string;
  amount_rs: number;
  team_size_at_time: number;
  created_at: string;
  referred_name: string;
}

interface ReferralData {
  referralCode: string;
  referralEarnings: number;
  teamSize: number;
  currentBonusPerAction: number;
  nextTier: { at: number; bonus: number } | null;
  team: TeamMember[];
  bonuses: Bonus[];
}

type Tab = 'overview' | 'team' | 'bonuses';

export default function ReferralPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    fetch('/api/user/referral')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const referralLink = data
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${data.referralCode}`
    : '';

  async function copyLink() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function shareLink() {
    if (navigator.share) {
      await navigator.share({
        title: 'Join EarnsPK',
        text: `Join EarnsPK and start earning daily cash! Use my referral link:`,
        url: referralLink,
      });
    } else {
      copyLink();
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const tierProgress = data.teamSize < 11
    ? { current: data.teamSize, target: 11, label: 'Tier 2 (Rs. 20/action)', pct: (data.teamSize / 11) * 100 }
    : data.teamSize < 31
    ? { current: data.teamSize, target: 31, label: 'Tier 3 (Rs. 30/action)', pct: ((data.teamSize - 11) / 20) * 100 }
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 md:pt-24">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Team</h1>
          <p className="text-gray-500 text-sm mt-1">Invite friends, build your team, earn bonuses</p>
        </div>

        {/* Earnings card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl shadow-amber-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <p className="text-orange-100 text-xs uppercase tracking-wider font-medium">Total Referral Earnings</p>
            <div className="flex items-end gap-1 mt-1 mb-4">
              <span className="text-lg font-semibold text-orange-100 mb-0.5">Rs.</span>
              <span className="text-5xl font-bold text-white">
                {parseFloat(data.referralEarnings?.toString() ?? '0').toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/20 pt-4">
              <div>
                <p className="text-white font-bold text-xl">{data.teamSize}</p>
                <p className="text-orange-200 text-xs">Team members</p>
              </div>
              <div>
                <p className="text-white font-bold text-xl">Rs. {data.currentBonusPerAction}</p>
                <p className="text-orange-200 text-xs">Per action now</p>
              </div>
              <div>
                <p className="text-white font-bold text-xl">{data.bonuses.length}</p>
                <p className="text-orange-200 text-xs">Bonuses paid</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier progress */}
        {tierProgress && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-400" />
                <p className="text-white text-sm font-semibold">Progress to {tierProgress.label}</p>
              </div>
              <p className="text-gray-500 text-xs">{tierProgress.current}/{tierProgress.target} members</p>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                style={{ width: `${Math.min(tierProgress.pct, 100)}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {tierProgress.target - tierProgress.current} more members to unlock Rs. {data.nextTier?.bonus}/action
            </p>
          </div>
        )}

        {tierProgress === null && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Max Tier Reached!</p>
              <p className="text-gray-400 text-xs">You earn Rs. 30 per action — the highest bonus tier.</p>
            </div>
          </div>
        )}

        {/* Referral link */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-1">Your Referral Link</p>
          <p className="text-gray-500 text-xs mb-3">Share this link — earn Rs. {data.currentBonusPerAction} when they sign up + Rs. {data.currentBonusPerAction} when they buy a plan</p>

          <div className="bg-black/30 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between mb-3">
            <p className="text-amber-400 text-sm font-mono truncate mr-3">{referralLink}</p>
            <button onClick={copyLink} className="text-gray-400 hover:text-white transition-colors flex-shrink-0">
              {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyLink}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 text-white font-medium py-2.5 rounded-xl text-sm transition-all"
            >
              {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareLink}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold py-2.5 rounded-xl text-sm transition-all"
            >
              <Gift size={16} />
              Share Link
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
          <p className="text-white font-semibold text-sm mb-4">How Bonuses Work</p>
          <div className="space-y-3">
            {[
              { tier: '1–10 members', signup: 'Rs. 10', plan: 'Rs. 10', color: 'text-amber-400' },
              { tier: '11–30 members', signup: 'Rs. 20', plan: 'Rs. 20', color: 'text-orange-400' },
              { tier: '31+ members', signup: 'Rs. 30', plan: 'Rs. 30', color: 'text-rose-400' },
            ].map((row, i) => {
              const isActive =
                (i === 0 && data.teamSize <= 10) ||
                (i === 1 && data.teamSize >= 11 && data.teamSize <= 30) ||
                (i === 2 && data.teamSize >= 31);
              return (
                <div
                  key={row.tier}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/2 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isActive && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />}
                    <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{row.tier}</p>
                    {isActive && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">Current</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={isActive ? row.color : 'text-gray-600'}>+{row.signup} signup</span>
                    <span className={isActive ? row.color : 'text-gray-600'}>+{row.plan} plan</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/3 border border-white/8 rounded-2xl p-1">
          {([
            { key: 'overview', label: 'Overview' },
            { key: 'team', label: `Team (${data.teamSize})` },
            { key: 'bonuses', label: 'Bonuses' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-amber-500 text-black font-semibold shadow-lg shadow-amber-500/20'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Signed Up', value: data.teamSize, icon: '👥', sub: 'total referrals' },
              { label: 'Bought Plans', value: data.team.filter(m => m.bought_plan).length, icon: '📦', sub: 'active members' },
              { label: 'From Signups', value: `Rs. ${data.bonuses.filter(b => b.bonus_type === 'signup').reduce((s, b) => s + parseFloat(b.amount_rs.toString()), 0).toFixed(0)}`, icon: '🎯', sub: 'signup bonuses' },
              { label: 'From Plans', value: `Rs. ${data.bonuses.filter(b => b.bonus_type === 'plan_purchase').reduce((s, b) => s + parseFloat(b.amount_rs.toString()), 0).toFixed(0)}`, icon: '💰', sub: 'plan bonuses' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/3 border border-white/8 rounded-2xl p-4">
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Team tab */}
        {tab === 'team' && (
          <div className="space-y-2">
            {data.team.length === 0 ? (
              <div className="text-center py-12">
                <Users size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No team members yet</p>
                <p className="text-gray-600 text-xs mt-1">Share your link to start building your team</p>
              </div>
            ) : data.team.map((member, i) => (
              <div key={member.id} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-sm">#{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{member.name}</p>
                    <p className="text-gray-500 text-xs">Joined {formatDate(member.created_at)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  member.bought_plan
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-white/5 text-gray-500 border-white/8'
                }`}>
                  {member.bought_plan ? 'Active' : 'No plan'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bonuses tab */}
        {tab === 'bonuses' && (
          <div className="space-y-2">
            {data.bonuses.length === 0 ? (
              <div className="text-center py-12">
                <Gift size={32} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No bonuses yet</p>
                <p className="text-gray-600 text-xs mt-1">Bonuses appear here when your team takes action</p>
              </div>
            ) : data.bonuses.map((bonus, i) => (
              <div key={i} className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">
                    {bonus.bonus_type === 'signup' ? '🎯 Signup bonus' : '📦 Plan purchase bonus'}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    from {bonus.referred_name} · team was {bonus.team_size_at_time} members
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">+Rs. {parseFloat(bonus.amount_rs.toString()).toFixed(0)}</p>
                  <p className="text-gray-600 text-xs">{formatDate(bonus.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}