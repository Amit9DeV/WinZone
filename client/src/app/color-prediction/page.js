'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trophy, X, Check, Clock, TrendingUp } from 'lucide-react';
import HowToPlay from '@/components/HowToPlay';

const COLOR_RULES = [
    "Predict the result color.",
    "Green (1,3,7,9) pays x2.",
    "Red (2,4,6,8) pays x2.",
    "Violet (0,5) pays x4.5.",
    "Simple Rules: If the color matches, you win!"
];

export default function ColorPredictionPage() {
    const { user, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [timer, setTimer] = useState(30);
    const [gameState, setGameState] = useState('IDLE');
    const [periodId, setPeriodId] = useState('---');
    const [history, setHistory] = useState([]);
    const [myBets, setMyBets] = useState([]); // List of my bets
    const [hasBet, setHasBet] = useState(false); // Track if user has bet in current round

    // Betting Modal State
    const [showBetModal, setShowBetModal] = useState(false);
    const [selectedSelection, setSelectedSelection] = useState(null); // 'green', 'violet', 'red', 0-9
    const [contractMoney, setContractMoney] = useState(10); // 10, 100, 1000, 10000
    const [contractCount, setContractCount] = useState(1); // Multiplier

    const [activeTab, setActiveTab] = useState('game'); // 'game' | 'my'

    useEffect(() => {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://winzone-final.onrender.com';
        const url = `${SOCKET_URL}/color-prediction`;
        const newSocket = io(url);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (user) {
                newSocket.emit('history:fetch', { userId: user._id || user.id });
            }
        });

        newSocket.on('init', (data) => {
            setTimer(data.timer);
            setGameState(data.gameState);
            setPeriodId(data.periodId);
            setHistory(data.history);
            setHasBet(false); // Reset on init/reconnect
        });

        newSocket.on('history:data', (data) => {
            setMyBets(data);
        });

        newSocket.on('timer', (data) => {
            setTimer(data.timer);
            setGameState(data.gameState);
        });

        newSocket.on('game:result', (data) => {
            setHistory(prev => [data.result, ...prev].slice(0, 20));
            setHasBet(false); // New round starts

            // Update my pending bets to show result locally? 
            // Ideally we re-fetch or backend broadcasts individual update.
            // For now, let's just trigger a re-fetch after a slight delay
            if (user) {
                setTimeout(() => newSocket.emit('history:fetch', { userId: user._id || user.id }), 1000);
            }

            // Toast
            const isViolet = data.result.colors.includes('violet');
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-surface-2 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xl text-white ${data.result.colors.includes('green') ? 'bg-green-500' : 'bg-red-500'} ${isViolet ? 'bg-gradient-to-r from-purple-500' : ''}`}>
                                    {data.result.number}
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-white">Period {data.result.periodId?.slice(-4)} Ended</p>
                                <p className="mt-1 text-sm text-gray-400">Result: {data.result.colors.join(' & ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 4000 });
        });

        newSocket.on('bet:confirmed', (data) => {
            if (updateBalance) updateBalance(data.balance);
            setMyBets(prev => [data.bet, ...prev]);
            toast.success('Bet Placed Successfully!');
            setShowBetModal(false);
            setHasBet(true);
        });

        newSocket.on('bet:win', (data) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-green-900 border border-green-500 shadow-2xl rounded-2xl pointer-events-auto flex items-center p-4 ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1">
                        <p className="font-bold text-green-400 text-lg">You Won ₹{data.amount}!</p>
                        <p className="text-xs text-green-200">Congratulations!</p>
                    </div>
                    <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">🎉</div>
                </div>
            ), { duration: 4000 });
            if (updateBalance) updateBalance(data.balance);
            // Re-fetch handled by game:result
        });

        newSocket.on('bet:loss', (data) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl pointer-events-auto flex items-center p-4 ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1">
                        <p className="font-bold text-gray-300 text-lg">Better luck next time</p>
                        <p className="text-xs text-gray-500">Don't give up!</p>
                    </div>
                    <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-500">😔</div>
                </div>
            ), { duration: 4000 });
            if (updateBalance && data.balance !== undefined) updateBalance(data.balance);
        });

        newSocket.on('error', (err) => toast.error(err.message));

        return () => newSocket.disconnect();
    }, [user]);

    const openBetModal = (selection) => {
        if (!user) return toast.error('Login to play');
        if (gameState !== 'BETTING' || timer < 5) return toast.error('Betting is closed');
        if (hasBet) return toast.error('You have already placed a bet for this round');

        setSelectedSelection(selection);
        setContractMoney(10);
        setContractCount(1);
        setShowBetModal(true);
    };

    const confirmBet = () => {
        const totalAmount = contractMoney * contractCount;
        if (totalAmount > user.balance) return toast.error('Insufficient Balance');

        socket.emit('bet:place', {
            userId: user._id || user.id,
            selection: selectedSelection,
            amount: totalAmount
        });
    };

    // Helper for colors
    const getSelectionColor = (sel) => {
        if (sel === 'green') return 'bg-green-500';
        if (sel === 'violet') return 'bg-purple-500';
        if (sel === 'red') return 'bg-red-500';
        // Numbers
        if ([1, 3, 7, 9].includes(sel)) return 'bg-green-500';
        if ([2, 4, 6, 8].includes(sel)) return 'bg-red-500';
        return 'bg-purple-500';
    };

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-900 pb-24">

                {/* Header Info */}
                <div className="bg-surface-1 p-4 rounded-b-3xl shadow-lg border-b border-white/10 sticky top-0 z-10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-white font-bold opacity-50 text-sm">Color Prediction</h2>
                        <HowToPlay title="Game Rules" rules={COLOR_RULES} />
                    </div>
                    <div className="max-w-md mx-auto flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Period</span>
                            <span className="text-2xl font-mono font-bold text-white">{periodId?.slice(-4) || '....'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 font-bold uppercase mb-1 tracking-wider">Count Down</span>
                            <div className="flex gap-1">
                                {[0, 0, ':', ...timer.toString().padStart(2, '0').split('')].map((char, i) => (
                                    <div key={i} className={`
                                        w-6 h-8 flex items-center justify-center rounded bg-gray-800 text-white font-bold font-mono text-lg shadow-inner
                                        ${char === ':' ? 'bg-transparent w-2 shadow-none' : ''}
                                        ${timer <= 5 && char !== ':' ? 'text-red-500 bg-red-900/20' : ''}
                                    `}>
                                        {char}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-md mx-auto p-4 space-y-6">

                    {/* Big Color Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => openBetModal('green')}
                            disabled={gameState !== 'BETTING' || timer < 5 || hasBet}
                            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 py-4 rounded-xl shadow-[0_4px_0_rgb(21,128,61)] text-white font-bold text-lg transition-all active:shadow-none active:translate-y-[4px] flex flex-col items-center disabled:cursor-not-allowed"
                        >
                            <span>Green</span>
                            <span className="text-xs font-normal opacity-80 backdrop-blur-sm bg-black/10 px-2 py-0.5 rounded-full mt-1">x2</span>
                        </button>
                        <button
                            onClick={() => openBetModal('violet')}
                            disabled={gameState !== 'BETTING' || timer < 5 || hasBet}
                            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 py-4 rounded-xl shadow-[0_4px_0_rgb(126,34,206)] text-white font-bold text-lg transition-all active:shadow-none active:translate-y-[4px] flex flex-col items-center disabled:cursor-not-allowed"
                        >
                            <span>Violet</span>
                            <span className="text-xs font-normal opacity-80 backdrop-blur-sm bg-black/10 px-2 py-0.5 rounded-full mt-1">x4.5</span>
                        </button>
                        <button
                            onClick={() => openBetModal('red')}
                            disabled={gameState !== 'BETTING' || timer < 5 || hasBet}
                            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 py-4 rounded-xl shadow-[0_4px_0_rgb(185,28,28)] text-white font-bold text-lg transition-all active:shadow-none active:translate-y-[4px] flex flex-col items-center disabled:cursor-not-allowed"
                        >
                            <span>Red</span>
                            <span className="text-xs font-normal opacity-80 backdrop-blur-sm bg-black/10 px-2 py-0.5 rounded-full mt-1">x2</span>
                        </button>
                    </div>

                    {/* Tabs: Game Record vs My Bets */}
                    <div className="mt-8">
                        <div className="flex rounded-lg bg-surface-1 p-1 mb-4 border border-white/5">
                            <button
                                onClick={() => setActiveTab('game')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'game' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Game History
                            </button>
                            <button
                                onClick={() => setActiveTab('my')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'my' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                My Bets
                            </button>
                        </div>

                        {activeTab === 'game' ? (
                            <div className="bg-surface-1 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-black/40 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Period</th>
                                            <th className="px-4 py-3">Number</th>
                                            <th className="px-4 py-3 text-right">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {history.map((h, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-mono text-gray-400">{h.periodId?.slice(-4)}</td>
                                                <td className="px-4 py-3 font-bold text-white text-lg">
                                                    <span className={`bg-gradient-to-br ${[1, 3, 7, 9].includes(h.number) ? 'from-green-400 to-green-600' : [2, 4, 6, 8].includes(h.number) ? 'from-red-400 to-red-600' : 'from-purple-400 to-purple-600'} bg-clip-text text-transparent`}>
                                                        {h.number}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 flex justify-end gap-1">
                                                    {h.colors.map(c => (
                                                        <div key={c} className={`w-3 h-3 rounded-full ${c === 'green' ? 'bg-green-500' : c === 'red' ? 'bg-red-500' : 'bg-purple-500'} shadow-[0_0_8px_rgba(255,255,255,0.3)]`}></div>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="bg-surface-1 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                                {myBets.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-sm">No bets yet</div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {myBets.map((bet, i) => (
                                            <div key={i} className="p-3 hover:bg-white/5 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs text-gray-400 font-mono">Period {bet.roundId?.slice(-4)}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bet.result === 'WON' ? 'bg-green-500/20 text-green-400' : bet.result === 'LOST' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                        {bet.result}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-300 text-sm">Select</span>
                                                        <div className={`px-2 py-0.5 rounded text-xs font-bold text-white capitalize ${isNaN(bet.metadata?.selection) ? (bet.metadata?.selection === 'green' ? 'bg-green-600' : bet.metadata?.selection === 'red' ? 'bg-red-600' : 'bg-purple-600') : 'bg-blue-600'}`}>
                                                            {bet.metadata?.selection}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-bold">₹{bet.amount}</div>
                                                        {bet.result === 'WON' && <div className="text-green-400 text-xs">+₹{bet.payout}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Betting Modal */}
                <AnimatePresence>
                    {showBetModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowBetModal(false)}
                        >
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`w-full max-w-md bg-surface-1 rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 p-6 ${getSelectionColor(selectedSelection)}`}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="bg-white/10 -m-6 mb-6 p-4 rounded-t-3xl sm:rounded-t-3xl">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-2 capitalize">
                                        Join {selectedSelection}
                                        <span className="text-xs font-normal opacity-80 bg-black/20 px-2 py-1 rounded">
                                            Current Period: {periodId?.slice(-4)}
                                        </span>
                                    </h3>
                                </div>

                                <div className="bg-surface-2 rounded-xl p-4 space-y-4">
                                    {/* Contract Money */}
                                    <div>
                                        <p className="text-sm text-gray-400 mb-2">Contract Money</p>
                                        <div className="flex gap-2">
                                            {[10, 100, 1000, 10000].map(amt => (
                                                <button
                                                    key={amt}
                                                    onClick={() => setContractMoney(amt)}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${contractMoney === amt ? 'bg-gray-200 text-black shadow-lg scale-105' : 'bg-black/40 text-gray-400'}`}
                                                >
                                                    {amt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Multiplier */}
                                    <div>
                                        <p className="text-sm text-gray-400 mb-2">Number</p>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setContractCount(Math.max(1, contractCount - 1))}
                                                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
                                            >
                                                -
                                            </button>
                                            <span className="flex-1 text-center text-2xl font-bold text-white">{contractCount}</span>
                                            <button
                                                onClick={() => setContractCount(contractCount + 1)}
                                                className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="flex gap-2 mt-2 justify-center">
                                            {[1, 5, 10, 20].map(mult => (
                                                <button
                                                    key={mult}
                                                    onClick={() => setContractCount(mult)}
                                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${contractCount === mult ? 'bg-primary text-white' : 'bg-black/20 text-gray-500'}`}
                                                >
                                                    x{mult}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 py-2">
                                        <input type="checkbox" defaultChecked className="rounded bg-black/40 border-gray-600" />
                                        <span className="text-xs text-gray-400">I agree to the presale management rule</span>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-4 items-center">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-300">Total Contract Money</p>
                                        <p className="text-2xl font-bold text-white">₹{contractMoney * contractCount}</p>
                                    </div>
                                    <button
                                        onClick={confirmBet}
                                        className="flex-1 bg-white text-black font-bold py-3 rounded-xl shadow-lg hover:bg-gray-100 active:scale-95 transition-transform"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
