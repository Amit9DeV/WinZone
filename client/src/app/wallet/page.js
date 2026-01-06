'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { walletAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user, balance, updateBalance, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState([]);
  const [requestAmount, setRequestAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchRequests();
    }
  }, [user, authLoading]);

  const fetchRequests = async () => {
    try {
      const response = await walletAPI.getRequests();
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    const amount = parseFloat(requestAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.requestBalance(amount);
      if (response.data.success) {
        toast.success('Balance request submitted. Waiting for admin approval.');
        setRequestAmount('');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Wallet</h1>

        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Balance</h2>
          <div className="text-5xl font-bold text-green-600 mb-2">
            💰 {balance.toFixed(2)} INR
          </div>
          <p className="text-gray-600">Available balance for gaming</p>
        </div>

        {/* Request Balance Form */}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Balance</h2>
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (INR)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-4">
            Your request will be reviewed by an admin. You'll be notified once it's processed.
          </p>
        </div>

        {/* Request History */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request History</h2>
          {requests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No requests yet</div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {request.amount.toFixed(2)} INR
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                    {request.adminNotes && (
                      <div className="text-sm text-gray-500 mt-1">
                        Note: {request.adminNotes}
                      </div>
                    )}
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
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

