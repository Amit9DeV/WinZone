'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { Rocket, Trophy, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import HowToPlay from '@/components/HowToPlay';

const LIMBO_RULES = [
    "Set a 'Target Multiplier' (e.g. 2.00x).",
    "Place your bet amount.",
    "Click 'Bet'. We generate a random multiplier.",
    "If the result is HIGHER than your target, you win!",
    "Win Amount = Bet × Target Multiplier."
];

export default function LimboPage() {
    const { user, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [target, setTarget] = useState(2.00);
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    // Calculate Win Chance
    const winChance = target > 0 ? (99 / target).toFixed(2) : 0;
    const potentialWin = (betAmount * target).toFixed(2);

    useEffect(() => {
        // Socket connection
        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
            : 'https://winzone-final.onrender.com';

        const newSocket = io(`${SOCKET_URL}/limbo`, {
            query: { userId: user?._id },
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        newSocket.on('game:result', (data) => {
            setRolling(false);
            setResult(data);

            // Add to history
            setHistory(prev => [data, ...prev].slice(0, 10));

            if (data.won) {
                toast.success(`You Won ₹${data.payout.toFixed(2)}!`, { icon: '🚀' });
                // Balance update handled by AuthContext listening to user:balance
                // But we can optimistically update if needed, though AuthContext is better source of truth
            } else {
                toast.error('You Lost!');
            }
        });

        newSocket.on('error', (err) => {
            setRolling(false);
            toast.error(err.message);
        });

        return () => newSocket.disconnect();
    }, [user]);

    const handleBet = () => {
        if (!user) return toast.error('Login to play');

        const userId = user._id || user.id;
        if (!userId) return toast.error('Session invalid. Please relogin.');

        if (rolling) return;
        if (betAmount <= 0) return toast.error('Invalid bet amount');
        if (target < 1.01) return toast.error('Minimum target is 1.01x');

        setRolling(true);
        setResult(null); // Clear previous result or keep it? Maybe dim it.

        socket.emit('bet:place', {
            amount: betAmount,
            targetMultiplier: parseFloat(target),
            userId: userId
        });
    };

    return (
        <MainLayout>
            <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Game Controls & Display */}
                    <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                                    <Rocket size={20} />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Limbo</h1>
                            </div>
                            <HowToPlay title="Limbo Rules" rules={LIMBO_RULES} />
                        </div>

                        {/* Main Display */}
                        <div className="h-64 flex flex-col items-center justify-center relative bg-black/50 rounded-xl border border-white/5 mb-8">
                            {/* Background Elements */}
                            <div className="absolute inset-0 overflow-hidden">
                                {result && result.won && (
                                    <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                                )}
                                {result && !result.won && (
                                    <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                                )}
                            </div>

                            <div className="relative z-10 text-center">
                                <div className={`text-7xl md:text-8xl font-black tabular-nums transition-all duration-300 transform ${rolling ? 'scale-110 animate-bounce text-gray-400' : ''} ${!result ? 'text-white' : result.won ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'text-red-500'
                                    }`}>
                                    {rolling ? '...' : (result ? `${result.result.toFixed(2)}x` : '0.00x')}
                                </div>
                                {result && (
                                    <div className="mt-4 text-sm font-medium text-gray-400 uppercase tracking-widest">
                                        Target: {result.target.toFixed(2)}x
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {/* Bet Amount */}
                            <div className="bg-surface-2 p-4 rounded-xl border border-white/5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bet Amount (₹)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value)))}
                                        className="flex-1 bg-black/40 border-none rounded-lg px-4 py-2 text-white font-mono text-lg focus:ring-1 focus:ring-green-500"
                                    />
                                    <button onClick={() => setBetAmount(prev => prev / 2)} className="px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400">½</button>
                                    <button onClick={() => setBetAmount(prev => prev * 2)} className="px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400">2x</button>
                                </div>
                            </div>

                            {/* Target Multiplier */}
                            <div className="bg-surface-2 p-4 rounded-xl border border-white/5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Target Multiplier</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={target}
                                        onChange={(e) => setTarget(Math.max(1.01, parseFloat(e.target.value)))}
                                        className="flex-1 bg-black/40 border-none rounded-lg px-4 py-2 text-white font-mono text-lg focus:ring-1 focus:ring-green-500"
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs">
                                    <span className="text-gray-500">Win Chance: <span className="text-white">{winChance}%</span></span>
                                    <span className="text-gray-500">Payout: <span className="text-green-400">₹{potentialWin}</span></span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleBet}
                            disabled={rolling}
                            className={`w-full mt-6 py-4 text-xl font-bold rounded-xl shadow-lg transition-all transform active:scale-95 ${rolling ? 'bg-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
                                }`}
                        >
                            {rolling ? 'Betting...' : 'Bet'}
                        </Button>

                    </div>

                    {/* History Sidebar */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold uppercase text-sm tracking-wider">
                            <History size={16} /> Recent Bets
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {history.length === 0 ? (
                                <div className="text-center text-gray-600 py-10 italic">No bets yet</div>
                            ) : (
                                history.map((item, i) => (
                                    <div key={item.betId || i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <div className={`text-sm font-bold ${item.won ? 'text-green-500' : 'text-gray-500'}`}>
                                                {item.result.toFixed(2)}x
                                            </div>
                                            <div className="text-xs text-gray-600">Target: {item.target.toFixed(2)}x</div>
                                        </div>
                                        {item.won && (
                                            <div className="text-green-400 text-sm font-mono font-bold">
                                                +₹{item.payout.toFixed(0)}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
