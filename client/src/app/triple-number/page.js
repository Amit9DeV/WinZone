'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import HowToPlay from '@/components/HowToPlay';

const TRIPLE_RULES = [
    "Choose a number: 1, 2, or 3.",
    "Place your bet before time runs out.",
    "Server picks a winning number every 20 seconds.",
    "Matches pay x2.8!"
];

export default function TripleNumberPage() {
    const { user, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [timer, setTimer] = useState(20);
    const [gameState, setGameState] = useState('IDLE');
    const [history, setHistory] = useState([]);
    const [betAmount, setBetAmount] = useState(10);
    const [lastResult, setLastResult] = useState(null);
    const [hasBet, setHasBet] = useState(false); // Track single bet limit

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://winzone-final.onrender.com';
        const url = `${SOCKET_URL}/triple-number`;
        const newSocket = io(url);
        setSocket(newSocket);

        newSocket.on('init', (data) => {
            setTimer(data.timer);
            setGameState(data.gameState);
            setHistory(data.history);
            setHasBet(false);
        });

        newSocket.on('timer', (data) => {
            setTimer(data.timer);
            setGameState(data.gameState);
        });

        newSocket.on('game:result', (data) => {
            setHistory(prev => [data, ...prev].slice(0, 20)); // data contains result & time
            setLastResult(data.result);
            setTimeout(() => setLastResult(null), 3000); // Hide large result after 3s
            toast.success(`Result: ${data.result}`);
            setHasBet(false);
        });

        newSocket.on('bet:win', (data) => {
            toast.success(`You Won ₹${data.amount}!`);
            if (updateBalance) updateBalance(data.balance);
        });

        newSocket.on('bet:confirmed', (data) => {
            if (updateBalance) updateBalance(data.balance);
            toast.success('Bet Placed!');
            setHasBet(true);
        });

        newSocket.on('bet:loss', (data) => {
            toast.error(`You Lost ₹${data.amount}`);
            if (updateBalance && data.balance !== undefined) updateBalance(data.balance);
        });

        newSocket.on('error', (err) => toast.error(err.message));

        return () => newSocket.disconnect();
    }, []);

    const handleBet = (selection) => {
        if (!user) return toast.error('Login to play');
        if (gameState !== 'BETTING' || timer < 3) return toast.error('Betting closed');
        if (hasBet) return toast.error('Only 1 bet allowed per round');

        socket.emit('bet:place', {
            userId: user._id || user.id,
            selection,
            amount: betAmount
        });
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-900 pb-20 p-4">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start md:items-center gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-3xl font-black text-white italic tracking-tighter">TRIPLE NUMBER</h1>
                                <HowToPlay title="Triple Number Rules" rules={TRIPLE_RULES} />
                            </div>
                            <p className="text-blue-200 text-xs md:text-sm mt-1">Pick 1, 2, or 3. Win 2.8x!</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className={`text-2xl md:text-4xl font-mono font-bold ${timer < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {timer}s
                            </div>
                            <div className="text-[10px] md:text-xs text-blue-300 uppercase font-bold tracking-widest">{gameState}</div>
                        </div>
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="max-w-md mx-auto relative">

                    {/* Floating Result Animation */}
                    <AnimatePresence>
                        {lastResult && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-yellow-400 w-32 h-32 md:w-48 md:h-48 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.6)] border-2 md:border-4 border-white">
                                    <span className="text-6xl md:text-9xl font-black text-black">{lastResult}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Betting Buttons */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
                        {[1, 2, 3].map(num => (
                            <button
                                key={num}
                                onClick={() => handleBet(num)}
                                disabled={gameState !== 'BETTING' || hasBet}
                                className={`
                                    aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-4xl md:text-6xl font-black shadow-lg transition-all
                                    hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
                                    ${num === 1 ? 'bg-cyan-500 shadow-cyan-500/30' : ''}
                                    ${num === 2 ? 'bg-pink-500 shadow-pink-500/30' : ''}
                                    ${num === 3 ? 'bg-yellow-500 shadow-yellow-500/30' : ''}
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Bet Amount */}
                    <div className="bg-gray-800 p-3 md:p-4 rounded-lg md:rounded-xl mb-4 md:mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm font-bold">Wager Amount</span>
                            <span className="text-white font-mono">₹{betAmount}</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="5000"
                            step="10"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between mt-2 gap-1.5 md:gap-2">
                            {[10, 50, 100, 500].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setBetAmount(amt)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white text-[10px] md:text-xs font-bold py-1 px-2 md:px-3 rounded"
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent History */}
                    <div>
                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Recent Results
                        </h3>
                        <div className="flex gap-2 overflow-x-auto pb-4">
                            {history.map((h, i) => (
                                <div
                                    key={i}
                                    className={`
                                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-black border-2 border-white/10
                                        ${h.result === 1 ? 'bg-cyan-500' : h.result === 2 ? 'bg-pink-500' : 'bg-yellow-500'}
                                    `}
                                >
                                    {h.result}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
