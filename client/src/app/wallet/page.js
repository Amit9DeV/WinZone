'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, CreditCard } from 'lucide-react';
import { walletAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await walletAPI.getRequests();
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.requestDeposit(Number(amount));
      if (response.data.success) {
        toast.success('Deposit request submitted successfully!');
        setAmount('');
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Balance & Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Balance Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-2xl shadow-purple-500/20 group">
            {/* Card Texture/Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
              <Wallet size={150} />
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-blue-100 font-medium tracking-wide">Total Balance</div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    INR
                  </div>
                </div>
                <div className="text-5xl md:text-6xl font-bold mb-8 tracking-tight drop-shadow-md">
                  ₹{Math.floor(user?.balance || 0).toLocaleString()}
                </div>
              </div>

              <div className="flex gap-4 mt-auto">
                <Button
                  onClick={() => setActiveTab('deposit')}
                  className={`flex-1 py-4 text-base font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${activeTab === 'deposit' ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}
                >
                  <ArrowDownLeft className="mr-2" size={20} /> Deposit
                </Button>
                <div className="flex-1 py-4 bg-black/20 text-gray-400 rounded-xl flex items-center justify-center cursor-not-allowed border border-white/5 backdrop-blur-sm">
                  <ArrowUpRight className="mr-2" size={20} /> Withdraw (Soon)
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <Card>
            <h2 className="text-xl font-bold text-white mb-6">
              Add Funds
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Amount (₹)</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[500, 1000, 2000, 5000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className="py-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-sm text-gray-300 transition-colors"
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Payment Method</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['UPI', 'Card', 'Crypto'].map((method) => (
                    <div
                      key={method}
                      className="border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/5 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                          <CreditCard size={20} />
                        </div>
                        <span className="font-medium text-gray-300 group-hover:text-white">{method}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full py-4 text-lg mt-4"
                onClick={handleDeposit}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History size={20} className="text-gray-400" />
                History
              </h2>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {requests.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No transaction history</div>
              ) : (
                requests.map((req) => (
                  <div key={req._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-2/50 hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
                        <ArrowDownLeft size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-white">Deposit Request</div>
                        <div className="text-xs text-gray-500">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">
                        +₹{Math.floor(req.amount)}
                      </div>
                      <div className={`text-xs capitalize ${req.status === 'APPROVED' ? 'text-green-500' :
                        req.status === 'REJECTED' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                        {req.status.toLowerCase()}
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
