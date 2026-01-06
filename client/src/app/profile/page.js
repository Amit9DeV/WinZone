'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { userAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        userAPI.getStats(),
        userAPI.getActivity({ limit: 20 }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (activityRes.data.success) {
        setActivity(activityRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const getActivityIcon = (type) => {
    const icons = {
      BET_PLACED: '🎲',
      BET_WON: '✅',
      BET_LOST: '❌',
      CASHOUT: '💰',
      PREDICTION_PLACED: '📊',
      PREDICTION_WON: '🎯',
      PREDICTION_LOST: '💔',
      WALLET_DEPOSIT: '➕',
      WALLET_WITHDRAWAL: '➖',
    };
    return icons[type] || '📝';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Profile & Statistics</h1>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-600">Name</div>
              <div className="text-xl font-semibold">{user.name}</div>
            </div>
            <div>
              <div className="text-gray-600">Email</div>
              <div className="text-xl font-semibold">{user.email}</div>
            </div>
            <div>
              <div className="text-gray-600">Balance</div>
              <div className="text-xl font-semibold text-green-600">
                💰 {user.balance?.toFixed(2) || '0.00'} INR
              </div>
            </div>
            <div>
              <div className="text-gray-600">Role</div>
              <div className="text-xl font-semibold">
                {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.overall?.totalBets || 0}
                </div>
                <div className="text-gray-600">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.overall?.totalWins || 0}
                </div>
                <div className="text-gray-600">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {stats.overall?.totalLosses || 0}
                </div>
                <div className="text-gray-600">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.overall?.winPercentage?.toFixed(1) || '0.0'}%
                </div>
                <div className="text-gray-600">Win Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Game-specific Stats */}
        {stats && stats.games && Object.keys(stats.games).length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Statistics</h2>
            <div className="space-y-4">
              {Object.entries(stats.games).map(([gameId, gameStats]) => (
                <div key={gameId} className="border-b pb-4 last:border-0">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 capitalize">
                    {gameId}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Bets</div>
                      <div className="font-semibold">{gameStats.totalBets || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Wins</div>
                      <div className="font-semibold text-green-600">{gameStats.wins || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Losses</div>
                      <div className="font-semibold text-red-600">{gameStats.losses || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Win Rate</div>
                      <div className="font-semibold">{gameStats.winPercentage?.toFixed(1) || '0.0'}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No activity yet</div>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getActivityIcon(item.type)}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.amount > 0 && (
                      <div className="text-sm text-gray-600">
                        Amount: {item.amount.toFixed(2)} INR
                      </div>
                    )}
                    {item.payout > 0 && (
                      <div className="text-sm font-semibold text-green-600">
                        Won: {item.payout.toFixed(2)} INR
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Balance: {item.balanceAfter?.toFixed(2) || '0.00'} INR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

