'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { Cherry, Sparkles, Coins, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SLOT_SYMBOLS = ['🍒', '🍋', '⭐', '💎', '7️⃣', '🍀'];

const PAYOUTS = {
    '🍒🍒🍒': 5,
    '🍋🍋🍋': 10,
    '⭐⭐⭐': 20,
    '💎💎💎': 50,
    '7️⃣7️⃣7️⃣': 100,
    '🍀🍀🍀': 200,
};

export default function SlotsPage() {
    const { user, balance, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState(['🍒', '🍒', '🍒']);
    const [lastWin, setLastWin] = useState(null);

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://winzone-final.onrender.com';
        const newSocket = io(`${SOCKET_URL}/slots`);
        setSocket(newSocket);

        newSocket.on('game:result', (data) => {
            setSpinning(false);
            setReels(data.symbols);

            if (data.won) {
                setLastWin(data.payout);
                toast.success(`You Won ₹${data.payout}! 🎰`, { icon: '🎉' });
                if (updateBalance) updateBalance(prev => prev + data.payout);
            } else {
                setLastWin(null);
                toast.error('Try Again!');
                if (updateBalance) updateBalance(prev => prev - betAmount);
            }
        });

        newSocket.on('error', (err) => {
            setSpinning(false);
            toast.error(err.message);
        });

        return () => newSocket.disconnect();
    }, [betAmount, updateBalance]);

    const handleSpin = () => {
        if (!user) return toast.error('Login to play');
        if (spinning) return;
        if (betAmount > balance) return toast.error('Insufficient balance');

        setSpinning(true);
        setLastWin(null);

        // Animate spinning
        const spinInterval = setInterval(() => {
            setReels([
                SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
                SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
                SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
            ]);
        }, 100);

        setTimeout(() => clearInterval(spinInterval), 1500);

        socket.emit('bet:place', {
            amount: betAmount,
            userId: user._id || user.id
        });
    };

    return (
        <MainLayout>
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-3 md:p-4">
                <div className="w-full max-w-md bg-surface-1 border border-white/10 rounded-xl p-4 md:p-6 shadow-xl">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                                <Cherry className="text-white" size={16} />
                            </div>
                            <h1 className="text-lg md:text-xl font-bold text-white">Slots</h1>
                        </div>
                        <div className="text-gray-400 text-[10px] md:text-xs font-mono">Match 3!</div>
                    </div>

                    {/* Slot Machine */}
                    <div className="mb-4 bg-gradient-to-b from-yellow-900/20 to-orange-900/20 rounded-lg p-3 md:p-5 border-2 border-yellow-500/30">
                        <div className="flex justify-center gap-2 md:gap-3 mb-3">
                            {reels.map((symbol, i) => (
                                <div
                                    key={i}
                                    className={`w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-lg flex items-center justify-center text-3xl md:text-4xl border-2 border-white/20 ${spinning ? 'animate-spin-slow' : ''}`}
                                >
                                    {symbol}
                                </div>
                            ))}
                        </div>

                        {lastWin && (
                            <div className="text-center">
                                <div className="text-green-400 font-bold text-sm md:text-base">
                                    🎉 Won ₹{lastWin}!
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bet Amount */}
                    <div className="mb-4">
                        <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bet Amount</label>
                        <div className="flex gap-1.5 md:gap-2">
                            <input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                disabled={spinning}
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                            />
                            <button onClick={() => setBetAmount(10)} disabled={spinning} className="px-2.5 md:px-3 py-2.5 bg-surface-2 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50">10</button>
                            <button onClick={() => setBetAmount(50)} disabled={spinning} className="px-2.5 md:px-3 py-2.5 bg-surface-2 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50">50</button>
                            <button onClick={() => setBetAmount(100)} disabled={spinning} className="px-2.5 md:px-3 py-2.5 bg-surface-2 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50">100</button>
                        </div>
                    </div>

                    {/* Spin Button */}
                    <Button
                        onClick={handleSpin}
                        disabled={spinning}
                        className={`w-full py-4 md:py-5 text-base md:text-lg font-bold transition-all ${spinning ? 'bg-gray-600' : 'bg-gradient-to-r from-yellow-600 to-orange-600'}`}
                    >
                        {spinning ? '🎰 Spinning...' : `🎰 Spin (₹${betAmount})`}
                    </Button>

                    {/* Payout Table */}
                    <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/5">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2">Payouts</h3>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] md:text-xs">
                            {Object.entries(PAYOUTS).map(([combo, multiplier]) => (
                                <div key={combo} className="flex justify-between items-center bg-surface-2/50 px-2 py-1 rounded">
                                    <span className="text-xs md:text-sm">{combo}</span>
                                    <span className="text-yellow-400 font-bold text-xs">x{multiplier}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 0.1s linear infinite;
                }
            `}</style>
        </MainLayout>
    );
}
