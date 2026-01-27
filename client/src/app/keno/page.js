'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { Grid, Trash2, Wand2, History } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import HowToPlay from '@/components/HowToPlay';

const KENO_RULES = [
    "Pick up to 10 numbers from the grid.",
    "Place your bet amount.",
    "Click 'Bet'. We will draw 20 random numbers.",
    "Matching numbers (Hits) determine your payout.",
    "Payouts increase with more hits."
];

export default function KenoPage() {
    const { user, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [selected, setSelected] = useState([]);
    const [drawn, setDrawn] = useState([]);
    const [hits, setHits] = useState([]);
    const [rolling, setRolling] = useState(false);
    const [payouts, setPayouts] = useState({});
    const [lastResult, setLastResult] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Socket connection
        const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
            : 'https://winzone-final.onrender.com';

        const newSocket = io(`${SOCKET_URL}/keno`, {
            query: { userId: user?._id },
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        newSocket.on('init', (data) => {
            setPayouts(data.payouts || {});
        });

        newSocket.on('game:result', (data) => {
            // Animate draw
            let currentDraw = [];
            const interval = 100; // ms per number reveal

            data.draw.forEach((num, index) => {
                setTimeout(() => {
                    setDrawn(prev => [...prev, num]);
                    if (selected.includes(num)) {
                        setHits(prev => [...prev, num]);
                    }

                    // Last number revealed
                    if (index === data.draw.length - 1) {
                        setRolling(false);
                        setLastResult(data);
                        setHistory(prev => [data, ...prev].slice(0, 10));

                        if (data.won) {
                            toast.success(`You Won ₹${data.payout.toFixed(2)}!`, { icon: '🎱' });
                        } else {
                            toast.error(`Matches: ${data.hits.length}. Try again!`, { icon: '💔' });
                        }
                    }
                }, index * interval);
            });
        });

        newSocket.on('error', (err) => {
            setRolling(false);
            toast.error(err.message);
        });

        return () => newSocket.disconnect();
    }, [user, selected]); // Re-attach if selected changes? No, handle selection locally.

    const toggleNumber = (num) => {
        if (rolling) return;
        if (selected.includes(num)) {
            setSelected(prev => prev.filter(n => n !== num));
        } else {
            if (selected.length >= 10) return toast.error('Max 10 numbers!');
            setSelected(prev => [...prev, num]);
        }
    };

    const handleBet = () => {
        console.log('User state:', user);
        if (!user) return toast.error('Login to play');

        // Handle case where _id might be missing or under 'id'
        const userId = user._id || user.id;
        if (!userId) {
            console.error('User ID missing from user object:', user);
            return toast.error('Session invalid. Please relogin.');
        }

        if (rolling) return;
        if (selected.length === 0) return toast.error('Pick at least 1 number');
        if (betAmount <= 0) return toast.error('Invalid bet amount');

        setRolling(true);
        setDrawn([]);
        setHits([]);
        setLastResult(null);

        socket.emit('bet:place', {
            amount: betAmount,
            numbers: selected,
            userId: userId
        });
    };

    const pickRandom = () => {
        if (rolling) return;
        const count = 10;
        const newSelection = [];
        while (newSelection.length < count) {
            const num = Math.floor(Math.random() * 80) + 1;
            if (!newSelection.includes(num)) newSelection.push(num);
        }
        setSelected(newSelection);
    };

    // Calculate potential payouts for current selection
    const currentPayouts = payouts[selected.length] || [];

    return (
        <MainLayout>
            <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Game Grid */}
                    <div className="lg:col-span-3 bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                                    <Grid size={20} />
                                </div>
                                <h1 className="text-2xl font-bold text-white">Keno</h1>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <div className="text-gray-400 text-xs uppercase">Hits</div>
                                    <div className="text-xl font-bold text-green-400">{hits.length}</div>
                                </div>
                                <HowToPlay title="Keno Rules" rules={KENO_RULES} />
                            </div>
                        </div>

                        {/* Valid Selection Warning */}
                        {selected.length === 0 && (
                            <div className="text-center text-yellow-500 mb-4 animate-pulse">Pick at least 1 number to start!</div>
                        )}

                        {/* Grid */}
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 mb-8">
                            {Array.from({ length: 80 }, (_, i) => i + 1).map(num => {
                                const isSelected = selected.includes(num);
                                const isDrawn = drawn.includes(num);
                                const isHit = isSelected && isDrawn;
                                const isMiss = !isSelected && isDrawn;

                                return (
                                    <button
                                        key={num}
                                        onClick={() => toggleNumber(num)}
                                        disabled={rolling}
                                        className={`
                                            aspect-square rounded-lg font-bold text-sm sm:text-base transition-all duration-200
                                            flex items-center justify-center relative
                                            ${isHit ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.8)] scale-110 z-10' :
                                                isMiss ? 'bg-gray-700 text-gray-500' :
                                                    isSelected ? 'bg-purple-600 text-white shadow-lg scale-105' :
                                                        'bg-white/5 hover:bg-white/10 text-gray-400'}
                                        `}
                                    >
                                        {/* Hit Marker */}
                                        {isHit && <span className="absolute inset-0 rounded-lg border-2 border-white animate-ping"></span>}
                                        {num}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full bg-surface-2 p-4 rounded-xl border border-white/5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bet Amount (₹)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value)))}
                                        className="flex-1 bg-black/40 border-none rounded-lg px-4 py-2 text-white font-mono text-lg focus:ring-1 focus:ring-purple-500"
                                    />
                                    <button onClick={() => setBetAmount(prev => prev * 2)} className="px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400">2x</button>
                                    <button onClick={() => setBetAmount(prev => prev / 2)} className="px-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-gray-400">½</button>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button onClick={pickRandom} disabled={rolling} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300 transition-colors">
                                    <Wand2 size={24} />
                                </button>
                                <button onClick={() => setSelected([])} disabled={rolling} className="p-4 bg-white/5 hover:bg-red-500/20 rounded-xl text-gray-300 hover:text-red-400 transition-colors">
                                    <Trash2 size={24} />
                                </button>
                                <Button
                                    onClick={handleBet}
                                    disabled={rolling}
                                    className={`flex-1 md:w-48 py-4 text-xl font-bold rounded-xl shadow-lg transition-all ${rolling ? 'bg-gray-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'
                                        }`}
                                >
                                    {rolling ? 'Drawing...' : 'Bet'}
                                </Button>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar: Payouts & History */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Payout Table */}
                        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Payouts</h3>
                            <div className="space-y-1">
                                {currentPayouts.map((multiplier, hits) => {
                                    if (multiplier === 0) return null;
                                    return (
                                        <div key={hits} className={`flex justify-between text-sm py-1 px-2 rounded ${hits === lastResult?.hits?.length ? 'bg-green-500/20 text-green-400 font-bold' : 'text-gray-400'}`}>
                                            <span>{hits} Hits</span>
                                            <span>{multiplier}x</span>
                                        </div>
                                    );
                                })}
                                {currentPayouts.every(p => p === 0) && (
                                    <div className="text-gray-600 text-xs italic">Select numbers to see payouts</div>
                                )}
                            </div>
                        </div>

                        {/* History */}
                        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 flex-1">
                            <div className="flex items-center gap-2 mb-4 text-gray-400 font-bold uppercase text-sm tracking-wider">
                                <History size={16} /> History
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {history.map((item, i) => (
                                    <div key={item.betId || i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                        <div>
                                            <div className={`text-sm font-bold ${item.won ? 'text-green-500' : 'text-gray-500'}`}>
                                                {item.hits.length} Hits
                                            </div>
                                            <div className="text-xs text-gray-600 font-mono">{item.multiplier}x</div>
                                        </div>
                                        {item.won && (
                                            <div className="text-green-400 text-sm font-mono font-bold">
                                                +₹{item.payout.toFixed(0)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
