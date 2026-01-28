'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import StatsCard from '@/components/Analytics/StatsCard';
import ProfitChart from '@/components/Analytics/ProfitChart';
import GamePerformance from '@/components/Analytics/GamePerformance';
import {
  Users,
  Wallet,
  TrendingUp,
  Activity,
  DollarSign,
  Gamepad2,
  PieChart,
  RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    allTime: { ggr: 0, totalWagered: 0, totalPayout: 0, betCount: 0, rtp: 0 },
    today: { ggr: 0, totalWagered: 0, totalPayout: 0, betCount: 0 },
    activeUsers24h: 0
  });
  const [gameStats, setGameStats] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [user, authLoading, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, gamesRes, chartRes] = await Promise.all([
        adminAPI.getAnalyticsDashboard(),
        adminAPI.getGamePerformance(),
        adminAPI.getPnlChart()
      ]);

      if (dashRes.data.success) setStats(dashRes.data.data);
      if (gamesRes.data.success) setGameStats(gamesRes.data.data);
      if (chartRes.data.success) setChartData(chartRes.data.data);

    } catch (error) {
      console.error('Analytics Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;
  if (loading) return <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">Initializing Mission Control...</div>;

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            MISSION <span className="text-[var(--primary)] neon-text-glow">CONTROL</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Real-time command center.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg text-sm text-[var(--primary)] font-bold transition-all border border-[var(--primary)]/20 hover:shadow-[0_0_10px_var(--primary-glow)]"
        >
          <RefreshCcw size={16} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Gross Gaming Revenue"
          value={`₹${stats.allTime.ggr.toLocaleString()}`}
          subtext={`Margin: ${(100 - stats.allTime.rtp).toFixed(2)}%`}
          icon={DollarSign}
          color={stats.allTime.ggr >= 0 ? 'green' : 'red'}
          delay={0}
        />
        <StatsCard
          title="Total Wagered"
          value={`₹${stats.allTime.totalWagered.toLocaleString()}`}
          subtext={`${stats.allTime.betCount.toLocaleString()} Total Bets`}
          icon={Wallet}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="Today's GGR"
          value={`₹${stats.today.ggr.toLocaleString()}`}
          subtext={`Vol: ₹${stats.today.totalWagered.toLocaleString()}`}
          icon={TrendingUp}
          color={stats.today.ggr >= 0 ? 'purple' : 'orange'}
          delay={0.2}
        />
        <StatsCard
          title="Active Players (24h)"
          value={stats.activeUsers24h}
          subtext="Unique bettors"
          icon={Users}
          color="white"
          delay={0.3}
        />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profit Chart (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex gap-2 items-center">
              <Activity className="text-[var(--success)]" size={20} />
              Profit & Loss (7 Days)
            </h3>
          </div>
          <ProfitChart data={chartData} />
        </motion.div>

        {/* Top/Bottom Games or Quick Stats (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-6 flex gap-2 items-center">
            <PieChart className="text-[var(--secondary)]" size={20} />
            Platform Health
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2 text-[var(--text-muted)]">
                <span>Global RTP (Return to Player)</span>
                <span className="text-white font-bold">{stats.allTime.rtp.toFixed(2)}%</span>
              </div>
              <div className="h-3 bg-[var(--surface-1)] rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full ${stats.allTime.rtp > 100 ? 'bg-[var(--danger)] shadow-[0_0_10px_var(--danger-glow)]' : 'bg-[var(--primary)] shadow-[0_0_10px_var(--primary-glow)]'}`}
                  style={{ width: `${Math.min(stats.allTime.rtp, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 opacity-70">
                Target RTP: 96% - 99%. Values {'>'} 100% mean the house is losing money.
              </p>
            </div>

            <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-white/5">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">System Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_5px_var(--success-glow)] animate-pulse"></div>
                <span className="text-sm font-bold text-white">Operational</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Game Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-panel rounded-2xl p-6 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex gap-2 items-center">
            <Gamepad2 className="text-[var(--primary)]" size={20} />
            Game Performance
          </h3>
        </div>
        <GamePerformance data={gameStats} />
      </motion.div>

    </div>
  );
}
