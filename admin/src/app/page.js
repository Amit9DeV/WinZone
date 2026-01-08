'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { adminAPI } from '@/lib/api';
import {
  Users,
  Wallet,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
      <span className={`flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="ml-1">{Math.abs(trend)}%</span>
      </span>
      <span className="text-gray-500 ml-2">vs last month</span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    activeGames: 0,
    pendingRequests: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
        setChartData(response.data.data.chartData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-400">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={12}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Deposits"
          value={`₹${stats.totalDeposits?.toFixed(0) || 0}`}
          icon={Wallet}
          trend={8}
          color="bg-green-500"
        />
        <StatCard
          title="Active Games"
          value={stats.activeGames}
          icon={TrendingUp}
          trend={0}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Activity}
          trend={-5}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Revenue Overview</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">User Activity</h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
