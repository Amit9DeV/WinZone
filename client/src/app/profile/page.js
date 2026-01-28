"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/MainLayout';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, History, User, Wallet, Edit2, Save } from 'lucide-react';
import AvatarSelector from '@/components/Profile/AvatarSelector';
import UserAvatar from '@/components/Chat/UserAvatar';
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const { user, login, setUser } = useAuth(); // login used to refresh user data

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/users/stats`, { headers }),
        fetch(`${API_URL}/users/bets?limit=20`, { headers })
      ]);

      const statsData = await statsRes.json();
      const historyData = await historyRes.json();

      if (statsData.success) setStats(statsData.data);
      if (historyData.success) setHistory(historyData.data.bets);

    } catch (error) {
      console.error("Profile load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = async (newAvatar) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';

      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ avatar: newAvatar })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Avatar updated!');
        setEditingAvatar(false);
        // Instant update without reload
        const updatedUser = { ...user, avatar: newAvatar };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Ensure persistence

        // Also reload window as a fallback to ensure server sync if needed, 
        // but now the local state is correct immediately.
        // window.location.reload(); // Removed to prevent jarring UX
      } else {
        toast.error(data.message || 'Failed to update avatar');
      }
    } catch (error) {
      console.error("Avatar update error:", error);
      toast.error('Failed to update avatar');
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </MainLayout>
  );

  const overall = stats?.overall || {};

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(num);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">

        {/* Header Section */}
        <div className="bg-surface-1 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />

          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="rounded-full border-4 border-surface-2 shadow-xl">
              <UserAvatar user={user} size="xl" showLevel={true} level={overall.level || 1} />
            </div>
            <button
              onClick={() => {
                setTempAvatar(user.avatar);
                setEditingAvatar(true);
              }}
              className="absolute bottom-0 right-0 bg-surface-2 p-2 rounded-full border border-white/10 hover:bg-surface-3 transition-colors shadow-lg"
            >
              <Edit2 size={14} className="text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <h1 className="text-3xl font-black italic text-white truncate">{user.name}</h1>
            <p className="text-text-muted text-sm flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
              <span className="bg-surface-3 px-2 py-0.5 rounded-md text-xs font-bold border border-white/5">USER</span>
              <span>Member since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
            </p>
          </div>

          {/* Balance Big Display */}
          <div className="bg-black/30 px-6 py-4 rounded-xl border border-white/5 text-right w-full md:w-auto mt-4 md:mt-0">
            <div className="text-text-muted text-xs uppercase font-bold mb-1">Total Balance</div>
            <div className="text-3xl font-black text-primary truncate">₹{user.balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Avatar Editor Modal */}
        {editingAvatar && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingAvatar(false)}
          >
            <div className="bg-surface-1 p-6 rounded-2xl max-w-md w-full border border-white/10" onClick={e => e.stopPropagation()}>
              <AvatarSelector
                currentAvatar={tempAvatar || user.avatar}
                onSelect={setTempAvatar}
              />
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setEditingAvatar(false)}
                  className="bg-black/40 py-3 rounded-xl font-bold hover:bg-black/60 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAvatarUpdate(tempAvatar)}
                  disabled={!tempAvatar || tempAvatar === user.avatar}
                  className="bg-primary py-3 rounded-xl font-bold hover:bg-primary/90 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Wagered" value={`₹${formatNumber(overall.totalWagered || 0)}`} icon={Wallet} color="text-purple-400" />
          <StatCard label="Total Bets" value={formatNumber(overall.totalBets || 0)} icon={History} color="text-blue-400" />
          <StatCard label="Total Won" value={`₹${formatNumber(overall.totalWon || 0)}`} icon={TrendingUp} color="text-green-400" />
          <StatCard label="Net Profit" value={`₹${formatNumber((overall.totalWon || 0) - (overall.totalWagered || 0))}`} icon={TrendingUp} color={((overall.totalWon || 0) - (overall.totalWagered || 0)) >= 0 ? "text-green-400" : "text-red-400"} />
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Win Rate Chart (Simplified Visual) */}
          <div className="bg-surface-1 rounded-2xl border border-white/10 p-6 md:col-span-1">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Win Rate
            </h3>
            <div className="aspect-square relative flex items-center justify-center">
              {/* Circular Progress CSS would go here, simplified for now */}
              <div className="w-40 h-40 rounded-full border-8 border-surface-2 flex items-center justify-center relative">
                <span className="text-3xl font-black text-white">
                  {(overall.winPercentage || 0).toFixed(1)}%
                </span>
                <div className="absolute text-xs text-text-muted bottom-8">WIN RATE</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <ProgressBar label="Won" value={overall.totalWins} total={overall.totalBets} color="bg-green-500" />
              <ProgressBar label="Lost" value={overall.totalLosses} total={overall.totalBets} color="bg-red-500" />
            </div>
          </div>

          {/* Bet History */}
          <div className="bg-surface-1 rounded-2xl border border-white/10 p-6 md:col-span-2">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <History size={18} className="text-blue-400" />
              Recent Bets
            </h3>
            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-3">
              {history.map((bet) => (
                <div key={bet._id} className="bg-surface-2/50 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full bg-surface-3 ${bet.result === 'WON' ? 'text-green-400' : 'text-gray-500'}`}>
                      {bet.result === 'WON' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <div className="font-bold text-white capitalize text-sm">{bet.gameId}</div>
                      <div className="text-[10px] text-gray-500">{new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm ${bet.result === 'WON' ? 'text-green-400' : 'text-gray-400'}`}>
                      {bet.result === 'WON' ? `+₹${Number(bet.payout).toFixed(2)}` : `-₹${bet.amount}`}
                    </div>
                    {bet.multiplier && (
                      <div className="text-[10px] text-blue-400 font-bold">
                        {Number(bet.multiplier).toFixed(2)}x
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">No recent bets found</div>
              )}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase text-gray-500 font-bold border-b border-white/5">
                  <tr>
                    <th className="pb-2 pl-2">Game</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2 text-right">Bet</th>
                    <th className="pb-2 text-right">Multiplier</th>
                    <th className="pb-2 text-right pr-2">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((bet) => (
                    <tr key={bet._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pl-2 font-medium text-white capitalize">{bet.gameId}</td>
                      <td className="py-3 text-gray-500 whitespace-nowrap">{new Date(bet.createdAt).toLocaleTimeString()}</td>
                      <td className="py-3 text-right text-white">₹{bet.amount}</td>
                      <td className="py-3 text-right text-blue-400 font-bold">
                        {bet.multiplier ? `${Number(bet.multiplier).toFixed(2)}x` : '-'}
                      </td>
                      <td className={`py-3 text-right font-bold pr-2 ${bet.result === 'WON' ? 'text-green-400' : 'text-gray-600'}`}>
                        {bet.result === 'WON' ? `+₹${Number(bet.payout).toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">No recent bets found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-surface-1 border border-white/10 p-4 rounded-xl flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-xs text-gray-500 uppercase font-bold mb-1 truncate">{label}</div>
        <div className={`text-xl font-black ${color} truncate`}>{value}</div>
      </div>
      <div className={`p-3 rounded-lg bg-surface-2 ${color} bg-opacity-10 shrink-0 ml-2`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percent = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value} ({percent.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
