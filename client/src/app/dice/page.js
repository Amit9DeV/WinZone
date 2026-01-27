'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { Dices } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import HowToPlay from '@/components/HowToPlay';

const DICE_RULES = [
    "Select a 'Target' number using the slider (2-98).",
    "Choose to bet 'Over' or 'Under' that target.",
    "The safer the bet (e.g. Under 90), the lower the multiplier.",
    "The riskier the bet (e.g. Under 10), the higher the payout (up to 990x!).",
    "Click 'Roll Dice'. If the random number matches your condition, you win!"
];

export default function DicePage() {
    const { user, balance, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [target, setTarget] = useState(50);
    const [condition, setCondition] = useState('over');
    const [rolling, setRolling] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    const winChance = condition === 'under' ? target : (100 - target);
    const multiplier = winChance > 0 ? (99 / winChance).toFixed(2) : 0;

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://winzone-final.onrender.com';
        const newSocket = io(`${SOCKET_URL}/dice`);
        setSocket(newSocket);

        newSocket.on('game:result', (data) => {
            setRolling(false);
            setLastResult(data);

            if (data.won) {
                toast.success(`You Won ₹${data.payout.toFixed(2)}!`, { icon: '🎲' });
                if (updateBalance) updateBalance(prev => prev + data.payout);
            } else {
                toast.error('You Lost!');
                if (updateBalance) updateBalance(prev => prev - betAmount);
            }
        });

        newSocket.on('error', (err) => {
            setRolling(false);
            toast.error(err.message);
        });

        return () => newSocket.disconnect();
    }, [betAmount, updateBalance]);

    const handleRoll = () => {
        if (!user) return toast.error('Login to play');
        if (rolling) return;

        setRolling(true);
        setLastResult(null);
        socket.emit('bet:place', {
            amount: betAmount,
            target,
            condition,
            userId: user._id || user.id
        });
    };

    return (
        <MainLayout>
            <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-lg bg-surface-1 border border-white/10 rounded-2xl p-5 md:p-7 shadow-xl relative">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Dices className="text-white" size={20} />
                            </div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">Dice</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-gray-400 text-xs font-mono hidden md:block">Provably Fair</div>
                            <HowToPlay title="Dice Game Rules" rules={DICE_RULES} />
                        </div>
                    </div>

                    {/* Result Display */}
                    <div className="mb-6 relative h-28 md:h-32 bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
                        <div className={`text-5xl md:text-6xl font-black tabular-nums transition-all duration-200 ${rolling ? 'opacity-50' : ''} ${lastResult?.won ? 'text-green-400' : lastResult?.won === false ? 'text-red-400' : 'text-white'}`}>
                            {rolling ? '...' : (lastResult ? lastResult.result.toFixed(2) : '0.00')}
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-500 to-green-500 w-full opacity-20"></div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-5">
                        {/* Target Slider */}
                        <div>
                            <div className="flex justify-between mb-2 text-xs md:text-sm font-medium">
                                <span className="text-gray-400">Target: <span className="text-white">{target}</span></span>
                                <span className="text-gray-400">Multiplier: <span className="text-green-400">x{multiplier}</span></span>
                                <span className="text-gray-400">Win Chance: <span className="text-blue-400">{winChance}%</span></span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="98"
                                step="1"
                                value={target}
                                onChange={(e) => setTarget(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between mt-2 gap-2">
                                <button onClick={() => setCondition('under')} className={`text-xs md:text-sm px-4 py-2 rounded-lg border transition-colors ${condition === 'under' ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-600 text-gray-400 hover:border-purple-500'}`}>Under {target}</button>
                                <button onClick={() => setCondition('over')} className={`text-xs md:text-sm px-4 py-2 rounded-lg border transition-colors ${condition === 'over' ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-600 text-gray-400 hover:border-purple-500'}`}>Over {target}</button>
                            </div>
                        </div>

                        {/* Bet Amount */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bet Amount</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500"
                                />
                                <button onClick={() => setBetAmount(prev => prev * 2)} className="px-4 bg-surface-2 rounded-lg text-gray-400 hover:text-white font-medium transition-colors">2x</button>
                                <button onClick={() => setBetAmount(prev => Math.floor(prev / 2))} className="px-4 bg-surface-2 rounded-lg text-gray-400 hover:text-white font-medium transition-colors">½</button>
                            </div>
                        </div>

                        {/* Roll Button */}
                        <Button
                            onClick={handleRoll}
                            disabled={rolling}
                            className={`w-full py-5 md:py-6 text-lg md:text-xl font-bold transition-all ${rolling ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
                        >
                            {rolling ? 'Rolling...' : `Roll Dice (Win ₹${(betAmount * multiplier).toFixed(2)})`}
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
