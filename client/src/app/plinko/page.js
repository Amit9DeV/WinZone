'use client';

import { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import { LayoutGrid, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import HowToPlay from '@/components/HowToPlay';
import { useAuth } from '@/context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PLINKO_RULES = [
    "Choose your bet amount.",
    "Select risk level (Low/Medium/High).",
    "Select number of rows (8-16).",
    "Click 'Bet' to drop a ball.",
    "Ball bounces left or right at each peg.",
    "Winnings = Bet × Multiplier where the ball lands."
];

// Difficulty colors
const RISK_COLORS = {
    Low: 'from-green-400 to-green-600',
    Medium: 'from-yellow-400 to-yellow-600',
    High: 'from-red-600 to-red-800'
};

export default function PlinkoPage() {
    const { user, balance, updateBalance } = useAuth();
    const [difficulty, setDifficulty] = useState('medium');
    const [betAmount, setBetAmount] = useState(100);
    const [risk, setRisk] = useState('Medium');
    const [rows, setRows] = useState(16);
    const [muted, setMuted] = useState(false);
    const [socket, setSocket] = useState(null);

    // Game State
    const [dropping, setDropping] = useState(false);
    const [activeBalls, setActiveBalls] = useState([]); // Array of { id, path, payout, multiplier, resultIndex }
    const [history, setHistory] = useState([]);

    // Multipliers (Visual only - Server calculates actual)
    // We just need these for the bottom row display
    // In a real app we'd fetch these from config, for now using the same mock map as backend roughly
    const getMultipliers = (r, risk) => {
        // Simplified visual map
        // This should ideally match server. putting placeholders.
        if (r === 16) return [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];
        if (r === 8) return [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6];
        // Fallback generator
        const count = r + 1;
        return Array.from({ length: count }, (_, i) => {
            const dist = Math.abs(i - r / 2);
            return (dist > r / 3 ? dist * 2 : 1 / (dist || 1)).toFixed(1);
        });
    };

    const currentMultipliers = getMultipliers(rows, risk);

    useEffect(() => {
        const url = `${process.env.NEXT_PUBLIC_SOCKET_URL}/plinko`;
        const newSocket = io(url);
        setSocket(newSocket);

        newSocket.on('connect_error', (err) => {
            toast.error('Connection Error: ' + err.message);
        });

        newSocket.on('game:result', (data) => {
            // Drop a new ball with the server-determined path
            spawnBall(data);
        });

        newSocket.on('error', (err) => {
            setDropping(false);
            toast.error(err.message);
        });

        return () => newSocket.disconnect();
    }, []); // Empty dependency array fixed

    const handleBet = () => {
        if (!user) return toast.error('Login to play');
        if (betAmount > balance) return toast.error('Insufficient funds');
        if (activeBalls.length >= 10) return toast.error('Wait for balls to finish'); // Using activeBalls.length for inGameBalls
        // But for safety, maybe throttle slightly
        // setDropping(true); // Don't block UI, allow multiple drops

        socket.emit('bet:place', {
            userId: user._id || user.id,
            betAmount,
            rows,
            risk
        });
    };

    const spawnBall = (data) => {
        const id = Date.now() + Math.random();
        setActiveBalls(prev => [...prev, {
            id,
            path: data.path,
            payout: data.payout,
            multiplier: data.multiplier,
            balance: data.balance,
            slotIndex: data.slotIndex
        }]);
    };

    const handleBallComplete = (ballId, payout, multiplier, balance) => {
        // Remove active ball
        setActiveBalls(prev => prev.filter(b => b.id !== ballId));

        // Show result
        // Show result
        const profit = payout - betAmount;
        if (payout > betAmount) {
            toast.success(
                <div>
                    <div className="font-bold">You Won!</div>
                    <div className="text-sm">Paid: ₹{payout} (Profit: +₹{Math.floor(profit)})</div>
                </div>,
                { icon: '🟢', duration: 4000 }
            );
        } else if (payout > 0) {
            toast(
                <div>
                    <div className="font-bold text-yellow-500">Partial Return</div>
                    <div className="text-sm">Paid: ₹{payout} (Loss: -₹{Math.abs(profit)})</div>
                </div>,
                { icon: '🟡', duration: 3000 }
            );
        } else {
            toast(
                <div>
                    <div className="font-bold text-gray-400">Better luck next time</div>
                    <div className="text-sm">Loss: -₹{betAmount}</div>
                </div>,
                { icon: '🔴', duration: 2000 }
            );
        }

        // Update balance
        if (updateBalance) updateBalance(balance);

        // Add to history
        setHistory(prev => [{ payout, multiplier, time: Date.now() }, ...prev].slice(0, 10));
    };

    return (
        <MainLayout>
            <div className="min-h-[calc(100vh-80px)] p-4 md:p-8 flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

                {/* Controls Sidebar */}
                <div className="w-full lg:w-80 flex-shrink-0 bg-surface-1 border border-white/10 rounded-3xl p-6 h-fit order-2 lg:order-1 z-20 relative">
                    <div className="flex justify-between items-center mb-8 bg-surface-1 p-4 rounded-xl border border-white/10 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <LayoutGrid className="text-yellow-500" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Plinko</h1>
                                <p className="text-xs text-gray-400">Drop & Win</p>
                            </div>
                        </div>
                        <HowToPlay title="Plinko Rules" rules={PLINKO_RULES} />
                    </div>

                    <div className="space-y-6">
                        {/* Bet Amount */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Bet Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* Risk Level */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Risk Level</label>
                            <div className="bg-black/40 p-1 rounded-xl flex">
                                {['Low', 'Medium', 'High'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setRisk(r)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${risk === r ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rows */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Rows ({rows})</label>
                            <input
                                type="range" min="8" max="16" step="1"
                                value={rows}
                                onChange={(e) => setRows(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>

                        <Button
                            onClick={handleBet}
                            className={`w-full py-6 text-xl font-bold bg-green-500 hover:bg-green-600 shadow-green-500/20 shadow-lg active:scale-95 transition-transform`}
                        >
                            Bet ₹{betAmount}
                        </Button>

                        {/* History Tiny */}
                        <div className="pt-4 border-t border-white/10">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Last Drops</label>
                            <div className="flex gap-2 overflow-hidden mask-linear-fade">
                                {history.map((h, i) => (
                                    <div key={i} className={`
                                        flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold text-white
                                        ${h.multiplier >= 1 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-700/50 text-gray-500'}
                                    `}>
                                        {h.multiplier}x
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 order-1 lg:order-2 flex flex-col items-center justify-center p-4 lg:p-12 relative overflow-hidden min-h-[600px]">
                    <PlinkoBoard
                        rows={rows}
                        activeBalls={activeBalls}
                        onBallComplete={handleBallComplete}
                        multipliers={currentMultipliers}
                        risk={risk}
                    />
                </div>

            </div>
        </MainLayout>
    );
}

// Sub-component for the visual board
function PlinkoBoard({ rows, activeBalls, onBallComplete, multipliers, risk }) {
    // Board config
    const boardRef = useRef(null);
    const [scale, setScale] = useState(1);
    const boardWidth = 600;
    const boardHeight = 500;
    const padding = 40;

    useEffect(() => {
        const handleResize = () => {
            if (boardRef.current) {
                const parentWidth = boardRef.current.parentElement.offsetWidth;
                const newScale = Math.min(1, (parentWidth - 32) / boardWidth); // 32px padding safety
                setScale(newScale);
            }
        };

        handleResize(); // Initial calculation
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate geometries
    const rowGap = (boardHeight - padding * 2) / rows;
    const pinGap = rowGap * 1.0;

    // ... logic remains same ...

    // Generate Pins
    const pins = [];
    for (let r = 0; r < rows; r++) {
        const pinCount = r + 3; // 3, 4, 5...
        for (let c = 0; c < pinCount; c++) {
            const rowWidth = (pinCount - 1) * pinGap;
            const x = (boardWidth / 2) - (rowWidth / 2) + (c * pinGap);
            const y = padding + (r * rowGap);
            pins.push({ x, y });
        }
    }

    return (
        <div
            ref={boardRef}
            className="relative flex justify-center w-full"
            style={{ height: (boardHeight + 100) * scale }}
        >
            <div
                className="relative origin-top bg-black/40 rounded-3xl border border-white/5 shadow-2xl"
                style={{
                    width: boardWidth,
                    height: boardHeight + 100,
                    transform: `scale(${scale})`
                }}
            >
                {/* Pins */}
                {pins.map((p, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]"
                        style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)' }}
                    />
                ))}

                {/* Bins */}
                <div className="absolute top-[100%] left-0 w-full flex justify-center gap-1" style={{ top: padding + (rows * rowGap) + 10 }}>
                    {multipliers.map((m, i) => {
                        // Align bins with the gaps of the last row
                        // Last row has 'rows + 2' pins
                        // Creating 'rows + 1' gaps (bins)
                        // wait, plinko engine output is 0..rows. So rows+1 bins.
                        // e.g. 8 rows -> 9 outcomes.
                        // The last row pins index is `rows-1`. It has `rows-1 + 3` = `rows+2` pins.
                        // The gaps are `rows+1`. Correct.

                        // Calculate X position of this bin to ensure alignment
                        const lastRowPinCount = rows + 3;
                        const lastRowWidth = (lastRowPinCount - 1) * pinGap;
                        const startX = (boardWidth / 2) - (lastRowWidth / 2);
                        // Bin `i` corresponds to gap between pin `i` and `i+1` of the imaginary next row?
                        // Actually, simplified: offset by pinGap
                        const x = startX + (i * pinGap) + (pinGap / 2);

                        const isHigh = m >= 10;
                        const isLoss = m < 1;

                        return (
                            <div
                                key={i}
                                className={`
                                rounded-md flex items-center justify-center text-[10px] font-bold text-black shadow-lg shadow-black/50
                                ${isHigh ? 'bg-gradient-to-b from-red-500 to-red-700 animate-pulse' :
                                        isLoss ? 'bg-gradient-to-b from-neutral-400 to-neutral-600 opacity-80' :
                                            'bg-gradient-to-b from-yellow-400 to-amber-600'}
                            `}
                                style={{
                                    width: pinGap - 4,
                                    height: 30,
                                    // left: x, 
                                    // position: 'absolute',
                                    // transform: 'translateX(-50%)'
                                    // actually flex is easier if widths match
                                }}
                            >
                                {m}x
                            </div>
                        );
                    })}
                </div>

                {/* Active Balls */}
                <AnimatePresence>
                    {activeBalls.map(ball => (
                        <PlinkoBall
                            key={ball.id}
                            ball={ball}
                            rowGap={rowGap}
                            pinGap={pinGap}
                            rows={rows}
                            boardWidth={boardWidth}
                            startPadding={padding}
                            onComplete={onBallComplete}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function PlinkoBall({ ball, rowGap, pinGap, rows, boardWidth, startPadding, onComplete }) {
    // Compute frames
    // Start position: between the top two pins of row 0?
    // Row 0 has 3 pins. Inteval 0 and 1.
    // Center is middle pin (index 1).
    // Ball starts at Center X, Top Y.

    // We define "Steps".
    // Step 0: Initial Drop.
    // Step 1..N: Hit pin and move L or R.

    // Path logic:
    // Path array [0, 1, 0...]
    // 0 = Left, 1 = Right.
    // Current X starts at boardWidth / 2.
    // For each step, X shifts by +/- (pinGap / 2).
    // Y shifts by rowGap.

    // But we need to account for the triangular spread.
    // Actually, simple logic:
    // Current X += (dir === 1 ? 0.5 : -0.5) * pinGap + (random jitter)

    const variants = {
        initial: { x: boardWidth / 2, y: 0, opacity: 0 },
        animate: { opacity: 1 }
    };

    // Construct keyframes
    const xValues = [boardWidth / 2];
    const yValues = [startPadding - rowGap]; // Start slightly above

    let currentX = boardWidth / 2;
    // Initial drop to first gap (Row 0 is hitting pins? or gaps?)
    // Usually Row 0 pins split the ball.
    // So ball hits Row 0 Y.

    // Let's assume ball starts at top center.
    // It falls to Row 0.
    // It hits a pin or goes through?
    // Let's assume it hits pins at Row 0, 1, 2...
    // At each hit, it deviates.

    // Adjust start:
    // Row 0 pins are at Y = startPadding.
    // Ball starts above.

    for (let i = 0; i < ball.path.length; i++) {
        const dir = ball.path[i]; // 0 or 1

        // Move down to next row
        yValues.push(startPadding + (i * rowGap));

        // Move X
        // Standard plinko physics: on hit, it moves half a gap left or right
        const offset = (dir === 1 ? 0.5 : -0.5) * pinGap;
        // Add some random bounce noise for realism
        const noise = (Math.random() - 0.5) * (pinGap * 0.2);

        currentX += offset + noise;
        xValues.push(currentX);
    }

    // Final drop to bucket
    yValues.push(startPadding + (rows * rowGap) + 15); // Into the bin
    xValues.push(currentX);

    return (
        <motion.div
            className="absolute w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_rgba(255,0,255,1)] z-10"
            initial={{ x: xValues[0], y: yValues[0] }}
            animate={{ x: xValues, y: yValues }}
            transition={{
                duration: rows * 0.4, // Slower speed (was 0.15)
                ease: "linear",
                times: xValues.map((_, i) => i / (xValues.length - 1)) // linear spacing
            }}
            onAnimationComplete={() => onComplete(ball.id, ball.payout, ball.multiplier, ball.balance)}
        />
    );
}

