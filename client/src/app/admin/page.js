"use client";

import { useEffect, useState } from 'react';
import { Users, DollarSign, Gamepad2, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading verified stats...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        <DashboardCard
          label="Total Deposits"
          value={`₹${stats.totalDeposits?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="text-green-400"
          bg="bg-green-400/10"
        />
        <DashboardCard
          label="Active Games"
          value={stats.activeGames}
          icon={Gamepad2}
          color="text-purple-400"
          bg="bg-purple-400/10"
        />
        <DashboardCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon={AlertTriangle}
          color="text-yellow-400"
          bg="bg-yellow-400/10"
        />
      </div>

      {/* Recent Activity / Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-1 border border-white/10 rounded-xl p-6">
          <h3 className="font-bold mb-4">Revenue Overview</h3>
          <div className="h-64 flex items-center justify-center bg-black/20 rounded-lg text-gray-500 text-sm">
            Chart visualization would go here (Recharts)
          </div>
        </div>

        <div className="bg-surface-1 border border-white/10 rounded-xl p-6">
          <h3 className="font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm transition-colors flex items-center justify-between group">
              <span>Review Wallet Requests</span>
              <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 rounded-full">{stats.pendingRequests}</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm transition-colors">
              Manage Game Configs
            </button>
            <button className="w-full text-left px-4 py-3 bg-surface-2 hover:bg-surface-3 rounded-lg text-sm transition-colors text-red-400 hover:text-red-300">
              Emergency Maintenance Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-surface-1 border border-white/10 p-5 rounded-xl flex items-center justify-between hover:border-white/20 transition-colors">
      <div>
        <div className="text-gray-500 text-xs uppercase font-bold mb-1">{label}</div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  );
}
