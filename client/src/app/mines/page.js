'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { Bomb, Gem, Grip, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HowToPlay from '@/components/HowToPlay';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const MINES_RULES = [
    "Select your bet amount and number of mines (1-24).",
    "Click 'Bet' to start the game.",
    "Click on tiles to reveal them.",
    "💎 Diamonds increase your multiplier.",
    "💣 Bombs end the game and you lose your bet.",
    "Cash out at any time to secure your winnings!"
];

export default function MinesPage() {
    const { user, balance, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);

    const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, CASHED_OUT, BOOM
    const [betAmount, setBetAmount] = useState(10);
    const [mineCount, setMineCount] = useState(3);
    const [grid, setGrid] = useState(Array(25).fill({ revealed: false, isMine: false }));

    const [currentMultiplier, setCurrentMultiplier] = useState(1.00);
    const [currentPayout, setCurrentPayout] = useState(0);

    useEffect(() => {
        // Use the same IP as api.js for mobile compatibility
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://winzone-final.onrender.com';
        const url = `${SOCKET_URL}/mines`;
        console.log('Connecting to Mines Socket:', url);
        const newSocket = io(url);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Mines Socket Connected:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Mines Socket Connection Error:', err);
            toast.error('Connection Error: ' + err.message);
        });

        newSocket.on('game:started', (data) => {
            setGameState('PLAYING');
            setGrid(Array(25).fill({ revealed: false, isMine: false }));
            setCurrentMultiplier(1.00);
            setCurrentPayout(betAmount);
            // Balance deduction is broadcasted via separate wallet event or assumed handled
            if (updateBalance) updateBalance(data.balance);
            toast.success('Game Started! Good Luck 🍀');
        });

        newSocket.on('tile:revealed', (data) => {
            // Update Grid
            setGrid(prev => {
                const newGrid = [...prev];
                // Mark this tile as revealed and SAFE
                newGrid[data.index] = { revealed: true, isMine: false };
                return newGrid;
            });
            setCurrentMultiplier(data.multiplier);
            setCurrentPayout(data.currentPayout);
        });

        newSocket.on('game:over', (data) => {
            if (data.won) {
                setGameState('CASHED_OUT');
                toast.success(`Broadcasting Win: ₹${data.payout}!`);
                if (updateBalance) updateBalance(data.balance);
            } else {
                setGameState('BOOM');
                toast.error('Boom! Game Over 💥');
                // Reveal All Mines
                setGrid(prev => {
                    const newGrid = [...prev];
                    // Ensure data.mines is valid array before iterating
                    if (Array.isArray(data.mines)) {
                        data.mines.forEach(idx => {
                            newGrid[idx] = { revealed: true, isMine: true };
                        });
                    }
                    return newGrid;
                });
            }
        });

        newSocket.on('error', (err) => toast.error(err.message));

        return () => newSocket.disconnect();
    }, []);

    const startGame = () => {
        console.log('startGame called', { user, betAmount, balance: balance });
        if (!user) return toast.error('Login to play');
        if (betAmount > balance) return toast.error('Insufficient Balance');

        // Reset grid locally to hidden for nice transition
        setGrid(Array(25).fill({ revealed: false, isMine: false }));

        console.log('Emitting game:start');
        socket.emit('game:start', {
            userId: user._id || user.id,
            betAmount,
            mineCount
        });
    };

    const handleTileClick = (index) => {
        console.log('Tile clicked', index, 'State:', gameState);
        if (gameState !== 'PLAYING' || grid[index].revealed) {
            console.log('Click ignored: State not playing or already revealed');
            return;
        }
        socket.emit('game:reveal', { index });
    };

    const handleCashout = () => {
        console.log('Cashout clicked');
        socket.emit('game:cashout');
    };

    return (
        <MainLayout>
            <div className="min-h-[calc(100vh-80px)] p-4 md:p-8 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">

                {/* Sidebar Controls */}
                <div className="w-full md:w-80 flex-shrink-0 bg-surface-1 border border-white/10 rounded-3xl p-6 h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-white font-bold text-xl">
                            <Bomb className="text-red-500" /> Mines
                        </div>
                        <HowToPlay title="Mines Rules" rules={MINES_RULES} />
                    </div>

                    <div className="space-y-6">
                        {/* Bet Amount */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Bet Amount</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        value={betAmount}
                                        onChange={(e) => setBetAmount(Number(e.target.value))}
                                        disabled={gameState === 'PLAYING'}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500 disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {[100, 500, 1000].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(amt)}
                                        disabled={gameState === 'PLAYING'}
                                        className="flex-1 py-1 text-xs bg-surface-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors disabled:opacity-50"
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mine Count */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Mines (1-24)</label>
                            <div className="relative">
                                <input
                                    type="range" min="1" max="24"
                                    value={mineCount}
                                    onChange={(e) => setMineCount(Number(e.target.value))}
                                    disabled={gameState === 'PLAYING'}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                                />
                                <div className="flex justify-between mt-2 text-sm text-gray-400 font-mono">
                                    <span>1</span>
                                    <span className="text-white font-bold">{mineCount}</span>
                                    <span>24</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {gameState === 'PLAYING' ? (
                            <Button
                                onClick={handleCashout}
                                className="w-full py-6 text-xl font-bold bg-green-500 hover:bg-green-600 shadow-green-500/20 shadow-lg animate-pulse"
                            >
                                Cashout ₹{Math.floor(currentPayout)}
                            </Button>
                        ) : (
                            <Button
                                onClick={startGame}
                                className="w-full py-6 text-xl font-bold bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 shadow-lg"
                            >
                                Bet ₹{betAmount}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Game Grid */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] bg-black/20 rounded-3xl border border-white/5 relative overflow-hidden p-8">
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20"></div>

                    <div className={`grid grid-cols-5 gap-2 md:gap-3 w-full max-w-md aspect-square ${gameState === 'BOOM' ? 'animate-shake' : ''}`}>
                        {grid.map((tile, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: !tile.revealed && gameState === 'PLAYING' ? 1.05 : 1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTileClick(i)}
                                disabled={gameState !== 'PLAYING' || tile.revealed}
                                className={`
                            relative rounded-xl border-b-4 transition-all duration-300 flex items-center justify-center text-3xl
                            ${tile.revealed
                                        ? (tile.isMine ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50')
                                        : 'bg-surface-2 border-white/10 hover:bg-surface-3 cursor-pointer'}
                            ${gameState === 'IDLE' && 'opacity-70'}
                        `}
                            >
                                {tile.revealed && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: 180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        type="spring"
                                    >
                                        {tile.isMine ? '💣' : '💎'}
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    {/* Game Over / Win Overlay */}
                    {(gameState === 'BOOM' || gameState === 'CASHED_OUT') && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-x-8 bottom-8 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 flex justify-between items-center z-10"
                        >
                            <div>
                                <div className="text-sm text-gray-400 font-bold uppercase">{gameState === 'BOOM' ? 'BUSTED!' : 'CASHED OUT!'}</div>
                                <div className={`text-2xl font-black ${gameState === 'BOOM' ? 'text-red-500' : 'text-green-400'}`}>
                                    {gameState === 'BOOM' ? `Lost ₹${betAmount}` : `Won ₹${Math.floor(currentPayout)}`}
                                </div>
                            </div>
                            <Button onClick={() => setGameState('IDLE')} variant="outline">
                                <RefreshCcw size={18} className="mr-2" /> Play Again
                            </Button>
                        </motion.div>
                    )}

                    {/* Stats Header */}
                    <div className="absolute top-8 flex gap-8">
                        <div className="text-center">
                            <div className="text-xs text-gray-500 uppercase font-bold">Multiplier</div>
                            <div className="text-2xl font-black text-white">x{currentMultiplier}</div>
                        </div>
                    </div>
                </div>

            </div>
            <div className="flex justify-between items-center mb-8 bg-surface-1 p-4 rounded-xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                    <Bomb className="text-red-500" size={32} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Mines Rush</h1>
                        <p className="text-xs text-gray-400">Find diamonds, avoid bombs</p>
                    </div>
                </div>
                <HowToPlay title="Mines: How to Play" rules={MINES_RULES} />
            </div>

        </MainLayout>
    );
}
