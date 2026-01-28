"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowDownCircle, ArrowUpCircle, History, Clock, CheckCircle, XCircle, CreditCard, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/MainLayout';

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('deposit'); // deposit, withdraw, history
  const [depositAmount, setDepositAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchBalance = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const res = await fetch(`${API_URL}/wallet/balance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.data.balance);
      }
    } catch (error) {
      console.error("Balance fetch error", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const res = await fetch(`${API_URL}/wallet/requests`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("History fetch error", error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const res = await fetch(`${API_URL}/wallet/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(depositAmount), utr })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Deposit Request Submitted!");
        setDepositAmount('');
        setUtr('');
        setActiveTab('history');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to submit deposit");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (parseFloat(withdrawAmount) > balance) {
        toast.error("Insufficient Balance");
        setLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://winzone-final.onrender.com/api';
      const res = await fetch(`${API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), upiId })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Withdrawal Request Submitted!");
        setWithdrawAmount('');
        setUpiId('');
        fetchBalance(); // Balance deducted immediately
        setActiveTab('history');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to submit withdrawal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 lg:px-8">

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/20 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden backdrop-blur-xl mb-4 md:mb-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
          <p className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-wider mb-1 md:mb-2">Total Balance</p>
          <h1 className="text-4xl md:text-6xl font-black text-white font-mono tracking-tighter">
            <span className="text-green-500">₹</span>
            {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row p-1 bg-surface-1 rounded-xl border border-white/5 mb-4 md:mb-6 gap-1 sm:gap-0">
          {[
            { id: 'deposit', label: 'Deposit', icon: ArrowDownCircle },
            { id: 'withdraw', label: 'Withdraw', icon: ArrowUpCircle },
            { id: 'history', label: 'History', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                ? 'bg-green-500 text-black shadow-lg shadow-green-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-surface-1 border border-white/5 rounded-2xl p-4 md:p-6 min-h-[400px]">

          {/* DEPOSIT TAB */}
          {activeTab === 'deposit' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-2 md:p-4 rounded-xl w-40 h-40 md:w-48 md:h-48 mx-auto flex items-center justify-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=test@upi&pn=WinZone&cu=INR" alt="QR Code" className="w-full h-full object-contain" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-bold text-lg md:text-xl">Scan QR to Pay</p>
                <p className="text-xs text-gray-400">Merchant: WinZone Gaming</p>
              </div>

              <form onSubmit={handleDeposit} className="space-y-4 max-w-md mx-auto w-full">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="500"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-green-500 outline-none transition-colors"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      required
                      min="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">UTR / Reference No.</label>
                  <input
                    type="text"
                    placeholder="12 digit UTR number"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500 outline-none transition-colors"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    required
                    minLength="12"
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : <><CreditCard size={20} /> Submit Deposit Request</>}
                </button>
              </form>
            </motion.div>
          )}

          {/* WITHDRAW TAB */}
          {activeTab === 'withdraw' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-md mx-auto py-4 md:py-8 w-full">
              <div className="text-center space-y-2 mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-white">Withdraw Winnings</h2>
                <p className="text-sm text-gray-400">Funds will be transferred to your UPI ID instantly after approval.</p>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Withdraw Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-green-500 outline-none transition-colors"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      min="100"
                    />
                  </div>
                  <p className="text-right text-xs text-gray-500 mt-1">Available: ₹{balance}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">UPI ID</label>
                  <input
                    type="text"
                    placeholder="username@okaxis"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-green-500 outline-none transition-colors"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>
                <button
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : <><Send size={20} /> Request Withdrawal</>}
                </button>
              </form>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">No transaction history found</div>
                ) : (
                  history.map(item => (
                    <div key={item._id} className="bg-black/20 border border-white/5 p-3 md:p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`p-2 md:p-3 rounded-full ${item.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                          {item.type === 'DEPOSIT' ? <ArrowDownCircle size={18} className="md:w-5 md:h-5" /> : <ArrowUpCircle size={18} className="md:w-5 md:h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white capitalize text-sm md:text-base">{item.type.toLowerCase()}</h4>
                          <p className="text-[10px] md:text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                          {item.utr && <p className="text-[9px] md:text-[10px] text-gray-600 font-mono hidden sm:block">UTR: {item.utr}</p>}
                          {item.upiId && <p className="text-[9px] md:text-[10px] text-gray-600 font-mono hidden sm:block">TO: {item.upiId}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-bold text-sm md:text-base ${item.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                          {item.type === 'DEPOSIT' ? '+' : '-'}₹{item.amount}
                        </p>
                        <div className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded mt-1 ${item.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                          item.status === 'REJECTED' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                          {item.status === 'APPROVED' && <CheckCircle size={10} />}
                          {item.status === 'REJECTED' && <XCircle size={10} />}
                          {item.status === 'PENDING' && <Clock size={10} />}
                          {item.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
