'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Disc, ChevronDown } from 'lucide-react';

// Segments Config (Must match Backend)
const SEGMENTS = [
    { color: 'RED', multiplier: 2, colorCode: '#ef4444' },     // Red-500
    { color: 'BLUE', multiplier: 2, colorCode: '#3b82f6' },    // Blue-500
    { color: 'GREEN', multiplier: 3, colorCode: '#22c55e' },   // Green-500
    { color: 'YELLOW', multiplier: 3, colorCode: '#eab308' },  // Yellow-500
    { color: 'ORANGE', multiplier: 5, colorCode: '#f97316' },  // Orange-500
    { color: 'PURPLE', multiplier: 5, colorCode: '#a855f7' }   // Purple-500
];

// Calculate rotation per segment (6 segments = 60 degrees each)
const DEG_PER_SEGMENT = 360 / 6;

export default function WheelPage() {
    const { user, updateBalance } = useAuth();
    const [socket, setSocket] = useState(null);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [betAmount, setBetAmount] = useState(10);
    const [lastWin, setLastWin] = useState(null);

    // Initialize Socket
    useEffect(() => {
        const url = 'https://winzone-final.onrender.com';
        const newSocket = io(`${url}/wheel`, {
            path: '/socket.io',
            transports: ['websocket'],
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.on('connect', () => {
            console.log('Wheel: Connected to socket');
            newSocket.emit('join-game', 'wheel');
        });

        newSocket.on('user:balance', (balance) => {
            updateBalance(balance);
        });

        newSocket.on('bet:result', (data) => {
            handleResult(data);
        });

        newSocket.on('error', (msg) => {
            toast.error(msg);
            setSpinning(false);
        });

        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, [updateBalance]);

    const handleResult = (data) => {
        // data: { result: 'RED', multiplier: 2, won: boolean, payout: number }

        // Calculate target rotation
        // We want the wheel to spin at least 5 times (1800 deg)
        // Find the index of the result color
        const targetIndex = SEGMENTS.findIndex(s => s.color === data.result);

        // Wheel setup: Index 0 is at 0 degrees (Top? Right?). 
        // Let's assume standard CSS rotation (0 is top).
        // To land index i at the top pointer (0 deg), we need to rotate:
        // - (i * 60) degrees? 
        // Let's verify:
        // Index 0 (Red) at 0 deg. Rotation 0.
        // Index 1 (Blue) at 60 deg. To bring it to top (0), we rotate -60 (or 300).
        // So target rotation = - (targetIndex * 60).
        // Add random jitter +/- 20 deg for realism (inside the segment).
        // Add extra spins (360 * 5).

        const segmentCenter = -(targetIndex * DEG_PER_SEGMENT);
        const randomOffset = (Math.random() * 40) - 20; // +/- 20 deg
        const extraSpins = 360 * 5;

        const finalRotation = rotation + extraSpins + (segmentCenter - (rotation % 360)) + randomOffset;

        setRotation(finalRotation);

        setTimeout(() => {
            setSpinning(false);
            if (data.won) {
                toast.success(`You Won ₹${data.payout}!`);
                setLastWin(data.payout);
            } else {
                toast.error(`Landed on ${data.result}. Try again!`);
                setLastWin(null);
            }
        }, 3000); // 3s spin duration matching CSS transition
    };

    const placeBet = (color) => {
        if (!user) return toast.error('Please login to play');
        if (spinning) return;
        if (user.balance < betAmount) return toast.error('Insufficient balance');

        setSpinning(true);
        setLastWin(null);

        socket.emit('bet:place', {
            amount: betAmount,
            color: color
        });

        // Timeout Safety
        setTimeout(() => {
            setSpinning(prev => {
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
            <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8 px-4">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center justify-center gap-3">
                        <Disc className="text-pink-500" size={40} />
                        COLOR <span className="text-pink-500">WHEEL</span>
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start max-w-6xl w-full">

                    {/* The Wheel */}
                    <div className="relative flex-1 flex flex-col items-center">
                        {/* Pointer */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 text-white drop-shadow-lg">
                            <ChevronDown size={48} fill="white" />
                        </div>

                        {/* Wheel Circle */}
                        <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]">
                            <motion.div
                                className="w-full h-full rounded-full border-8 border-gray-800 shadow-2xl relative overflow-hidden"
                                animate={{ rotate: rotation }}
                                transition={{ duration: 3, ease: "circOut" }}
                                style={{
                                    background: `conic-gradient(
                                        ${SEGMENTS[0].colorCode} 0deg 60deg,
                                        ${SEGMENTS[1].colorCode} 60deg 120deg,
                                        ${SEGMENTS[2].colorCode} 120deg 180deg,
                                        ${SEGMENTS[3].colorCode} 180deg 240deg,
                                        ${SEGMENTS[4].colorCode} 240deg 300deg,
                                        ${SEGMENTS[5].colorCode} 300deg 360deg
                                    )`
                                }}
                            >
                                {/* Inner Lines/Decorations */}
                                {SEGMENTS.map((seg, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-full h-[1px] bg-black/20 top-1/2 left-0 origin-center"
                                        style={{ transform: `rotate(${i * 60}deg)` }}
                                    ></div>
                                ))}

                                {/* Center Cap */}
                                <div className="absolute inset-0 m-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-700 z-10">
                                    <span className="text-white font-bold text-xs">WINZONE</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Win Notification */}
                        <AnimatePresence>
                            {lastWin && !spinning && (
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    className="mt-6 bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-lg border border-white/20"
                                >
                                    WON ₹{lastWin}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 w-full max-w-md bg-surface-1 p-6 rounded-2xl border border-white/5">
                        {/* Bet Amount */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bet Amount</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {[10, 50, 100, 500].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(amt)}
                                        disabled={spinning}
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
                                disabled={spinning}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Betting Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {SEGMENTS.map((seg) => (
                                <button
                                    key={seg.color}
                                    onClick={() => placeBet(seg.color)}
                                    disabled={spinning}
                                    className="relative group overflow-hidden rounded-xl p-4 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: seg.colorCode }}
                                >
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    <div className="relative z-10 flex justify-between items-center text-white text-shadow">
                                        <span className="font-bold text-sm tracking-widest">{seg.color}</span>
                                        <span className="font-mono font-black text-xl bg-black/20 px-2 py-1 rounded">{seg.multiplier}x</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-center text-gray-500">
                            Select a color to spin the wheel!
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
