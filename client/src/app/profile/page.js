'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Shield, Key, Camera } from 'lucide-react';
import { userAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import ProfitChart from '@/components/Charts/ProfitChart';
import WinRateChart from '@/components/Charts/WinRateChart';

export default function ProfilePage() {
  const { user, balance, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bets, setBets] = useState([]);
  const [chartData, setChartData] = useState({ daily: [], summary: {} });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const token = localStorage.getItem('token');

      const [statsRes, betsRes, chartRes] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getBets({ limit: 20 }),
        fetch(`${API_URL}/stats/chart?period=7d`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data.stats);
      }
      if (betsRes.data.success) {
        setBets(betsRes.data.data.bets);
      }
      if (chartRes.ok) {
        const data = await chartRes.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile data', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await userAPI.uploadAvatar(formData);
      if (response.data.success) {
        toast.success('Profile picture updated successfully!');
        // Update user context with new avatar
        setUser({ ...user, avatar: response.data.data.avatar });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.avatar) return;

    try {
      const response = await userAPI.deleteAvatar();
      if (response.data.success) {
        toast.success('Profile picture removed successfully!');
        setUser({ ...user, avatar: '' });
      }
    } catch (error) {
      console.error('Avatar delete error:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-8 md:mb-20">
          <div className="h-32 md:h-48 rounded-3xl bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 px-4 md:px-8 -mt-16 md:-mt-0 relative md:absolute md:-bottom-16 md:left-8 w-full">
            <div className="relative group shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-surface-1 p-1 shadow-xl">
                {user?.avatar ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                    alt={user?.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl md:text-4xl font-bold text-white">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload/Change Avatar Button */}
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-primary hover:bg-primary-hover p-2 rounded-full cursor-pointer shadow-lg border-2 border-surface-1 transition-all duration-200 hover:scale-110 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Change profile picture"
              >
                <Camera size={16} className="text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="hidden"
              />
            </div>

            <div className="mb-0 md:mb-4 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{user?.name}</h1>
              <div className="text-sm md:text-base text-gray-400">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-24 md:mt-0">
          {/* Stats Column */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="bg-surface-2 p-3 rounded flex justify-between items-center">
                  <span className="text-gray-400">Balance</span>
                  <span className="font-bold text-green-400">₹{Math.floor(balance || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300">Total Bets</span>
                  <span className="font-bold text-white">{stats?.totalBets || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300">Total Wins</span>
                  <span className="font-bold text-green-400">{stats?.totalWins || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300">Total Losses</span>
                  <span className="font-bold text-red-400">{stats?.totalLosses || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300">Total Wagered</span>
                  <span className="font-bold text-white">₹{Math.floor(stats?.totalWagered || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300">Biggest Win</span>
                  <span className="font-bold text-green-400">₹{Math.floor(stats?.biggestWin || 0)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-300">Win Rate</span>
                  <span className="font-bold text-blue-400">{stats?.winPercentage?.toFixed(1) || '0.0'}%</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Security</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.error('Change Password feature coming soon')}>
                  <Key size={16} className="mr-2" /> Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.error('2FA feature coming soon')}>
                  <Shield size={16} className="mr-2" /> 2FA Settings
                </Button>
              </div>
            </Card>
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <Input
                    icon={User}
                    defaultValue={user?.name}
                    readOnly
                    className="bg-surface-2/50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <Input
                    icon={Mail}
                    defaultValue={user?.email}
                    readOnly
                    className="bg-surface-2/50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Role</label>
                  <Input
                    defaultValue={user?.role}
                    readOnly
                    className="bg-surface-2/50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Joined</label>
                  <Input
                    defaultValue={new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                    readOnly
                    className="bg-surface-2/50 cursor-not-allowed"
                  />
                </div>
              </div>

              {user?.avatar && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <Button
                    variant="outline"
                    className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                    onClick={handleDeleteAvatar}
                  >
                    Remove Profile Picture
                  </Button>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2/50">
                  <div>
                    <div className="font-medium text-white">Email Notifications</div>
                    <div className="text-sm text-gray-400">Receive updates about new games and bonuses</div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer" onClick={() => toast.error('Preference settings coming soon')}>
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2/50">
                  <div>
                    <div className="font-medium text-white">Sound Effects</div>
                    <div className="text-sm text-gray-400">Play sounds during games</div>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer" onClick={() => toast.error('Preference settings coming soon')}>
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Analytics Charts Section */}
        {chartData.daily && chartData.daily.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfitChart data={chartData.daily} />
            <WinRateChart
              wins={chartData.summary?.wins || 0}
              losses={chartData.summary?.losses || 0}
            />
          </div>
        )}

        {/* Bet History Section */}
        <div className="mt-8">
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">Bet History</h2>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="py-3 px-4">Game</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Multiplier</th>
                    <th className="py-3 px-4">Payout</th>
                    <th className="py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="6" className="py-8 text-center text-gray-400">Loading history...</td></tr>
                  ) : bets.length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-gray-400">No bets found</td></tr>
                  ) : (
                    bets.map((bet) => (
                      <tr key={bet._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 capitalize">{bet.gameId}</td>
                        <td className="py-3 px-4 text-gray-400">{new Date(bet.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4">₹{bet.amount}</td>
                        <td className="py-3 px-4">{bet.multiplier ? `${Number(bet.multiplier).toFixed(2)}x` : '-'}</td>
                        <td className="py-3 px-4 font-medium text-green-400">
                          {bet.payout > 0 ? `₹${bet.payout.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${bet.result === 'WON' ? 'bg-green-500/20 text-green-400' :
                            bet.result === 'LOST' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {bet.result}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {loading ? (
                <div className="py-8 text-center text-gray-400">Loading history...</div>
              ) : bets.length === 0 ? (
                <div className="py-8 text-center text-gray-400">No bets found</div>
              ) : (
                bets.map((bet) => (
                  <div key={bet._id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold capitalize text-white">{bet.gameId}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${bet.result === 'WON' ? 'bg-green-500/20 text-green-400' :
                        bet.result === 'LOST' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {bet.result}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-gray-400">Amount</div>
                      <div className="text-right text-white">₹{bet.amount}</div>

                      <div className="text-gray-400">Multiplier</div>
                      <div className="text-right text-white">{bet.multiplier ? `${Number(bet.multiplier).toFixed(2)}x` : '-'}</div>

                      <div className="text-gray-400">Payout</div>
                      <div className="text-right font-medium text-green-400">
                        {bet.payout > 0 ? `₹${bet.payout.toFixed(2)}` : '-'}
                      </div>

                      <div className="text-gray-400 col-span-2 text-xs mt-2 border-t border-white/5 pt-2">
                        {new Date(bet.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>
    </MainLayout>
  );
}
