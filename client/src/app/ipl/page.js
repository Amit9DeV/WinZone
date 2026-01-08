'use client';

import { motion, AnimatePresence } from 'framer-motion';
import HowToPlay from '@/components/HowToPlay';

const IPL_RULES = [
    "Select a match from the available list.",
    "Predict the Toss Winner (Team A or Team B).",
    "Wait for the live toss result.",
    "Win 1.9x your bet amount if correct!"
];
import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { Trophy, Coins, RotateCcw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function IPLPage() {
    const { user, updateBalance } = useAuth(); // Assuming updateBalance exists or we refetch
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState('READY'); // READY, FLIPPING, RESULT
    const [selectedSide, setSelectedSide] = useState(null); // HEADS | TAILS
    const [betAmount, setBetAmount] = useState(100);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:50001'}/ipl`, {
            // In real app, pass auth token here
        });

        setSocket(newSocket);

        newSocket.on('connect', () => console.log('Connected to IPL Toss'));

        newSocket.on('bet:accepted', () => {
            setGameState('FLIPPING');
        });

        newSocket.on('game:result', (data) => {
            setResult(data);
            setGameState('RESULT');
            if (data.won) {
                toast.success(`You Won ₹${data.payout}!`);
                if (updateBalance) updateBalance(prev => prev + data.payout);
                // Note: AuthContext might need a refreshBalance instead
            } else {
                toast.error('You Lost!');
                if (updateBalance) updateBalance(prev => prev - betAmount);
            }
        });

        return () => newSocket.disconnect();
    }, []);

    const handleBet = (side) => {
        if (!user) return toast.error('Login to play');
        if (gameState === 'FLIPPING') return;

        setSelectedSide(side);
        socket.emit('bet:place', { amount: betAmount, choice: side });
    };

    const resetGame = () => {
        setGameState('READY');
        setResult(null);
        setSelectedSide(null);
    };

    return (
        <MainLayout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-10">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                        IPL Super Toss
                    </h1>
                    <p className="text-gray-400">Heads or Tails? Double your money instantly!</p>
                </div>

                {/* Coin Visual */}
                <div className="relative w-48 h-48 mb-12 perspective-1000">
                    <div className={`w-full h-full rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center text-4xl font-bold text-yellow-900 shadow-[0_0_50px_rgba(234,179,8,0.5)] transition-transform duration-[2000ms] ${gameState === 'FLIPPING' ? 'animate-[spin_0.5s_linear_infinite]' : ''}`}
                        style={{ transform: gameState === 'RESULT' ? (result?.result === 'HEADS' ? 'rotateY(0deg)' : 'rotateY(180deg)') : 'rotateY(0deg)' }}>
                        {gameState === 'FLIPPING' ? '?' :
                            gameState === 'RESULT' ? (result?.result === 'HEADS' ? 'H' : 'T') :
                                'IPL'}
                    </div>
                </div>

                {gameState === 'READY' && (
                    <div className="space-y-8 w-full max-w-md">
                        {/* Bet Amount */}
                        <div className="flex justify-center gap-4">
                            {[50, 100, 500, 1000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setBetAmount(amt)}
                                    className={`px-4 py-2 rounded-lg font-mono font-bold transition-all ${betAmount === amt ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' : 'bg-surface-2 text-gray-400 hover:bg-surface-3'}`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        {/* Betting Buttons */}
                        <div className="grid grid-cols-2 gap-6">
                            <button
                                onClick={() => handleBet('HEADS')}
                                className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl border border-blue-400/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all transform hover:-translate-y-1"
                            >
                                <div className="text-2xl mb-2">🦁</div>
                                <div className="font-bold text-xl text-white">HEADS (CSK)</div>
                                <div className="text-xs text-blue-200 mt-1">Multiplier 1.9x</div>
                            </button>

                            <button
                                onClick={() => handleBet('TAILS')}
                                className="group relative bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-2xl border border-red-400/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all transform hover:-translate-y-1"
                            >
                                <div className="text-2xl mb-2">🦅</div>
                                <div className="font-bold text-xl text-white">TAILS (MI)</div>
                                <div className="text-xs text-red-200 mt-1">Multiplier 1.9x</div>
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'FLIPPING' && (
                    <div className="text-2xl text-yellow-400 font-bold animate-pulse">
                        Flipping...
                    </div>
                )}

                {gameState === 'RESULT' && (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                        <div className="text-4xl font-bold mb-4 text-white">
                            It's {result?.result}!
                        </div>
                        <div className={`text-2xl font-bold mb-8 ${result?.won ? 'text-green-400' : 'text-red-400'}`}>
                            {result?.won ? `YOU WON ₹${result.payout}!` : 'Try Again!'}
                        </div>
                        <Button onClick={resetGame} size="lg" className="bg-white text-black hover:bg-gray-200">
                            <RotateCcw className="mr-2" size={20} /> Play Again
                        </Button>
                    </div>
                )}

            </div>
        </MainLayout>
    );
}
