'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { adminAPI, gameAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [walletRequests, setWalletRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Debug: Log user info
  useEffect(() => {
    if (user) {
      console.log('Admin Page - User:', user);
      console.log('Admin Page - User Role:', user.role);
      console.log('Admin Page - isAdmin:', isAdmin);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      router.push('/login');
      return;
    }

    // Check admin status
    const userRole = user.role || user.user?.role;
    if (userRole !== 'ADMIN') {
      toast.error('Admin access required');
      router.push('/');
      return;
    }

    // Fetch data if admin
    fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gamesRes, requestsRes, usersRes, schedulesRes] = await Promise.all([
        gameAPI.getGames().catch(err => ({ data: { success: false, error: err } })),
        adminAPI.getWalletRequests().catch(err => ({ data: { success: false, error: err } })),
        adminAPI.getUsers().catch(err => ({ data: { success: false, error: err } })),
        adminAPI.getSchedules({ used: false }).catch(err => ({ data: { success: false, error: err } })),
      ]);

      if (gamesRes.data?.success) {
        setGames(gamesRes.data.data || []);
      } else {
        console.error('Failed to load games:', gamesRes.data?.error);
      }

      if (requestsRes.data?.success) {
        setWalletRequests(requestsRes.data.data || []);
      } else {
        console.error('Failed to load wallet requests:', requestsRes.data?.error);
      }

      if (usersRes.data?.success) {
        setUsers(usersRes.data.data || []);
      } else {
        console.error('Failed to load users:', usersRes.data?.error);
      }

      if (schedulesRes.data?.success) {
        setSchedules(schedulesRes.data.data || []);
      } else {
        console.error('Failed to load schedules:', schedulesRes.data?.error);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      setError(errorMsg);
      toast.error('Failed to load admin data: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleGame = async (gameId, enabled) => {
    setLoading(true);
    try {
      const response = await adminAPI.toggleGame(gameId, enabled);
      if (response.data.success) {
        toast.success(`Game ${gameId} ${enabled ? 'enabled' : 'disabled'}`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to toggle game');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await adminAPI.approveRequest(requestId, 'Approved');
      if (response.data.success) {
        toast.success('Request approved');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to approve request');
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await adminAPI.rejectRequest(requestId, 'Rejected');
      if (response.data.success) {
        toast.success('Request rejected');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const userRole = user.role || user.user?.role;
  if (userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-2xl font-bold mb-4">Access Denied</div>
          <div className="text-lg mb-2">Admin access required</div>
          <div className="text-sm text-gray-400">
            Your role: {userRole || 'Not set'}
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xl mb-4">Error: {error}</div>
          <button
            onClick={() => {
              setError(null);
              fetchData();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">👑 Admin Panel</h1>
          {loading && (
            <div className="text-white text-sm">Loading data...</div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1">
          {['games', 'wallet', 'users', 'aviator'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Games</h2>
            <div className="space-y-4">
              {games.map((game) => (
                <div
                  key={game.gameId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{game.name}</div>
                    <div className="text-sm text-gray-600">{game.gameId}</div>
                  </div>
                  <button
                    onClick={() => toggleGame(game.gameId, !game.enabled)}
                    className={`px-4 py-2 rounded ${
                      game.enabled
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-400 hover:bg-gray-500 text-white'
                    }`}
                  >
                    {game.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Requests Tab */}
        {activeTab === 'wallet' && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Wallet Requests ({walletRequests.length})
            </h2>
            {walletRequests.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No pending requests</div>
            ) : (
              <div className="space-y-3">
                {walletRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">
                        {request.userId?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {request.userId?.email || ''}
                      </div>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        {request.amount.toFixed(2)} INR
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveRequest(request._id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectRequest(request._id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">Bets</th>
                    <th className="text-left p-2">Wins</th>
                    <th className="text-left p-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 font-semibold">{u.balance?.toFixed(2)} INR</td>
                      <td className="p-2">{u.totalBets || 0}</td>
                      <td className="p-2">{u.totalWins || 0}</td>
                      <td className="p-2">
                        {u.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aviator Admin Tab */}
        {activeTab === 'aviator' && (
          <AviatorAdminPanel schedules={schedules} onRefresh={fetchData} />
        )}
      </div>
    </div>
  );
}

function AviatorAdminPanel({ schedules, onRefresh }) {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    times: '',
    crashAt: '',
  });
  const [loading, setLoading] = useState(false);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const times = scheduleData.times.split(',').map((t) => t.trim());

    if (!scheduleData.date || times.length === 0 || !scheduleData.crashAt) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.createSchedule({
        date: scheduleData.date,
        times,
        crashAt: parseFloat(scheduleData.crashAt),
      });

      if (response.data.success) {
        toast.success('Schedule created successfully');
        setScheduleData({ date: '', times: '', crashAt: '' });
        setShowScheduleForm(false);
        onRefresh();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    setLoading(true);
    try {
      await adminAPI.deleteSchedule(scheduleId);
      toast.success('Schedule deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Aviator Schedules</h2>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          {showScheduleForm ? 'Cancel' : 'Create Schedule'}
        </button>
      </div>

      {showScheduleForm && (
        <form onSubmit={handleScheduleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                required
                value={scheduleData.date}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Times (HH:MM, comma-separated)
              </label>
              <input
                type="text"
                required
                value={scheduleData.times}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, times: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="10:00, 11:00, 12:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crash At (multiplier)
              </label>
              <input
                type="number"
                required
                min="1.01"
                step="0.01"
                value={scheduleData.crashAt}
                onChange={(e) =>
                  setScheduleData({ ...scheduleData, crashAt: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
          >
            Create Schedule
          </button>
        </form>
      )}

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No schedules</div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-semibold text-gray-900">
                  {schedule.date} at {schedule.time}
                </div>
                <div className="text-sm text-gray-600">
                  Crash at: <span className="font-bold">{schedule.crashAt}x</span>
                </div>
                <div className="text-xs text-gray-500">
                  {schedule.used ? 'Used' : 'Pending'}
                </div>
              </div>
              {!schedule.used && (
                <button
                  onClick={() => deleteSchedule(schedule._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

