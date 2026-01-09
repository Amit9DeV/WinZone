'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Coins, Trophy, History } from 'lucide-react';

export default function CoinFlipPage() {
    const { user, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [flipping, setFlipping] = useState(false);
    const [result, setResult] = useState(null); // 'HEADS' or 'TAILS'
    const [betAmount, setBetAmount] = useState(10);
    const [choice, setChoice] = useState(null); // 'HEADS' or 'TAILS'
    const [lastWin, setLastWin] = useState(null);

    // Initialize Socket
    useEffect(() => {
      const url = 'https://winzone-final.onrender.com';
        const newSocket = io(`${url}/coin-flip`, {
            path: '/socket.io',
            transports: ['websocket'],
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('CoinFlip: Connected to socket');
            newSocket.emit('join-game', 'coin-flip');
        });

        newSocket.on('user:balance', (balance) => {
            updateBalance(balance);
        });

        newSocket.on('bet:result', (data) => {
            // handle result animation
            handleResult(data);
        });

        newSocket.on('error', (msg) => {
            toast.error(msg);
            setFlipping(false);
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [updateBalance]);

    const handleResult = (data) => {
        // data: { result: 'HEADS', won: boolean, payout: number, balance: number }

        // Final Flip Animation
        // Ensure the visual coin lands on the result
        // We handle this by setting 'result' state after a delay or controlling the animation ref.

        setTimeout(() => {
            setResult(data.result);
            setFlipping(false);

            if (data.won) {
                toast.success(`You Won ₹${data.payout}!`);
                setLastWin(data.payout);
                // Play win sound?
            } else {
                toast.error('You Lost!');
                setLastWin(null);
            }
        }, 1000); // Wait for minimum animation time
    };

    const placeBet = (selectedChoice) => {
        if (!user) return toast.error('Please login to play');
        if (flipping) return;
        if (user.balance < betAmount) return toast.error('Insufficient balance');

        setChoice(selectedChoice);
        setFlipping(true);
        setResult(null);
        setLastWin(null);

        socket.emit('bet:place', {
            amount: betAmount,
            choice: selectedChoice
        });

        // Timeout Safety (Server not responding)
        setTimeout(() => {
            setFlipping(prev => {
                if (prev === true) {
                    toast.error('Server not responding. Please restart backend.');
                    return false;
                }
                return false;
            });
        }, 5000);
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-900 flex flex-col items-center py-12 px-4">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center justify-center gap-3">
                        <Coins className="text-yellow-400" size={40} />
                        COIN <span className="text-yellow-400">FLIP</span>
                    </h1>
                    <p className="text-gray-400 mt-2">Double your money in a flip!</p>
                </div>

                {/* Game Area */}
                <div className="w-full max-w-md relative">

                    {/* Coin Container */}
                    <div className="bg-surface-2 aspect-square rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden mb-8">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent"></div>

                        {/* The Coin */}
                        <motion.div
                            animate={flipping ? { rotateY: 1800 } : { rotateY: result === 'TAILS' ? 180 : 0 }}
                            transition={flipping ? { duration: 1, ease: "linear", repeat: Infinity } : { duration: 0.5, type: "spring" }}
                            className="w-48 h-48 relative preserve-3d"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Heads Side */}
                            <div className="absolute inset-0 w-full h-full rounded-full bg-yellow-400 border-4 border-yellow-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center backface-hidden z-20">
                                <div className="text-yellow-700 font-bold text-5xl flex flex-col items-center">
                                    <Trophy size={60} />
                                    <span className="mt-2 text-2xl tracking-widest">HEADS</span>
                                </div>
                            </div>

                            {/* Tails Side */}
                            <div className="absolute inset-0 w-full h-full rounded-full bg-slate-300 border-4 border-slate-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                                <div className="text-slate-600 font-bold text-5xl flex flex-col items-center">
                                    <div className="text-4xl font-serif">₹</div>
                                    <span className="mt-2 text-2xl tracking-widest">TAILS</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Win Overlay */}
                        <AnimatePresence>
                            {lastWin && !flipping && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30"
                                >
                                    <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl text-center transform rotate-[-5deg]">
                                        <div className="text-sm font-bold uppercase tracking-wider">You Won</div>
                                        <div className="text-4xl font-black">₹{lastWin}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="bg-surface-1 p-6 rounded-2xl border border-white/5 space-y-6">
                        {/* Bet Amount */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bet Amount</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {[10, 50, 100, 500].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(amt)}
                                        disabled={flipping}
                                        className={`py-2 rounded-lg font-mono font-bold text-sm transition-colors ${betAmount === amt ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                    >
                                        ₹{amt}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                disabled={flipping}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => placeBet('HEADS')}
                                disabled={flipping}
                                className={`
                                    py-4 rounded-xl font-black text-lg shadow-lg transform transition-all active:scale-95
                                    ${flipping ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-400 text-yellow-900 hover:shadow-yellow-500/20'}
                                `}
                            >
                                HEADS
                            </button>
                            <button
                                onClick={() => placeBet('TAILS')}
                                disabled={flipping}
                                className={`
                                    py-4 rounded-xl font-black text-lg shadow-lg transform transition-all active:scale-95
                                    ${flipping ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-slate-300 hover:bg-white text-slate-800 hover:shadow-white/20'}
                                `}
                            >
                                TAILS
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}
