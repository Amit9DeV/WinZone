'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { Play, RotateCcw, Home, Trophy } from 'lucide-react';

// --- Constants ---
const PLAYERS = ['blue', 'red', 'green', 'yellow'];
// Positions on the 15x15 grid (0-indexed)
// This is a simplified path map. A real 15x15 grid mapping is complex.
// We will use a visual grid and map tokens to coordinates.

export default function LudoPage() {
    const { user, updateBalance } = useAuth();
    const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, FINISHED
    const [diceValue, setDiceValue] = useState(null);
    const [turn, setTurn] = useState(0); // 0=Blue, 1=Red, 2=Green, 3=Yellow
    const [tokens, setTokens] = useState(initialTokens());
    const [rolling, setRolling] = useState(false);

    // --- Initial State Setup ---
    function initialTokens() {
        // 4 players, 4 tokens each
        // status: 'base', 'active', 'finished'
        // position: 0-51 (main path) + home path steps
        return PLAYERS.map(color =>
            Array(4).fill(null).map((_, i) => ({ id: i, status: 'base', position: -1 }))
        );
    }

    // --- Ludo Logic Helpers ---



    // --- Ludo Logic Helpers ---

    const getCoordinates = (playerIndex, step) => {
        // Base positions
        if (step === -1) {
            const bases = [
                { r: 11, c: 2 }, // Blue Base (BL)
                { r: 2, c: 2 },  // Red Base (TL)
                { r: 2, c: 11 }, // Green Base (TR)
                { r: 11, c: 11 } // Yellow Base (BR)
            ];
            const base = bases[playerIndex];
            return { r: base.r, c: base.c };
        }

        // Main Path (52 steps)
        // Global Path relative to Board, starting Red Start R7 C2
        const mainPath = [
            // Red Wing (Left)
            { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
            { r: 6, c: 7 }, { r: 5, c: 7 }, { r: 4, c: 7 }, { r: 3, c: 7 }, { r: 2, c: 7 }, { r: 1, c: 7 },
            { r: 1, c: 8 }, { r: 1, c: 9 },
            { r: 2, c: 9 }, { r: 3, c: 9 }, { r: 4, c: 9 }, { r: 5, c: 9 }, { r: 6, c: 9 },
            // Green Wing (Top) -> Right
            { r: 7, c: 10 }, { r: 7, c: 11 }, { r: 7, c: 12 }, { r: 7, c: 13 }, { r: 7, c: 14 }, { r: 7, c: 15 },
            { r: 8, c: 15 }, { r: 9, c: 15 },
            { r: 9, c: 14 }, { r: 9, c: 13 }, { r: 9, c: 12 }, { r: 9, c: 11 }, { r: 9, c: 10 },
            // Yellow Wing (Right) -> Bottom
            { r: 10, c: 9 }, { r: 11, c: 9 }, { r: 12, c: 9 }, { r: 13, c: 9 }, { r: 14, c: 9 }, { r: 15, c: 9 },
            { r: 15, c: 8 }, { r: 15, c: 7 },
            { r: 14, c: 7 }, { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 },
            // Blue Wing (Bottom) -> Left
            { r: 9, c: 6 }, { r: 9, c: 5 }, { r: 9, c: 4 }, { r: 9, c: 3 }, { r: 9, c: 2 }, { r: 9, c: 1 },
            { r: 8, c: 1 }, { r: 7, c: 1 }
        ];

        // Offsets for active path (0-51)
        // Red (P1): 0
        // Green (P2): 13
        // Yellow (P3): 26
        // Blue (P0): 39
        const offsets = [39, 0, 13, 26];

        // Home Paths (Steps 52-56)
        if (step >= 52) {
            const homeIndex = step - 52;
            // Coordinates for home runs
            // Blue (P0): From Bottom (C8) Up: R14->R10
            // Red (P1): From Left (R8) Right: C2->C6
            // Green (P2): From Top (C8) Down: R2->R6
            // Yellow (P3): From Right (R8) Left: C14->C10

            const homePaths = {
                0: [{ r: 14, c: 8 }, { r: 13, c: 8 }, { r: 12, c: 8 }, { r: 11, c: 8 }, { r: 10, c: 8 }, { r: 8, c: 8 }], // Blue
                1: [{ r: 8, c: 2 }, { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 }, { r: 8, c: 8 }], // Red
                2: [{ r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 }, { r: 6, c: 8 }, { r: 8, c: 8 }], // Green
                3: [{ r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 8 }] // Yellow
            };
            return homePaths[playerIndex][homeIndex] || mainPath[0];
        }

        const effectiveStep = (step + offsets[playerIndex]) % 52;
        return mainPath[effectiveStep];
    };

    // --- Bot Logic ---
    useEffect(() => {
        if (turn !== 0 && gameState !== 'FINISHED') {
            // Bot's Turn
            const botPlay = async () => {
                // 1. Roll Dice (delay for realism)
                await new Promise(r => setTimeout(r, 1000));
                setRolling(true);

                let val = 0;
                // Visualize rolling
                for (let i = 0; i < 10; i++) {
                    await new Promise(r => setTimeout(r, 50));
                    setDiceValue(Math.floor(Math.random() * 6) + 1);
                }
                val = Math.floor(Math.random() * 6) + 1;
                setDiceValue(val);
                setRolling(false);

                // 2. Decide Move
                await new Promise(r => setTimeout(r, 800)); // Thinking time

                setTokens(prevTokens => {
                    const newTokens = [...prevTokens];
                    const myTokens = newTokens[turn];

                    // Simple AI:
                    // 1. If 6 rolled, prioritize opening a token if we have < 2 active
                    // 2. Else, move furthest active token
                    // 3. Or just move first possible token

                    let moved = false;

                    // Find moveable tokens
                    const moveableIndices = myTokens.map((t, i) => {
                        if (t.status === 'base' && val === 6) return i;
                        if (t.status === 'active' && t.position + val <= 56) return i;
                        return -1;
                    }).filter(i => i !== -1);

                    if (moveableIndices.length > 0) {
                        // Pick best move
                        // Priority: Open token if 6
                        const openMove = moveableIndices.find(i => myTokens[i].status === 'base');
                        const moveIndex = (val === 6 && openMove !== undefined) ? openMove : moveableIndices[Math.floor(Math.random() * moveableIndices.length)];

                        const token = myTokens[moveIndex];
                        if (token.status === 'base') {
                            token.status = 'active';
                            token.position = 0;
                        } else {
                            token.position += val;
                            // Check win
                            if (token.position === 56) {
                                token.status = 'finished';
                                toast.success(`${PLAYERS[turn]} Token Finished!`);
                            }
                        }
                        moved = true;
                    }

                    if (!moved) {
                        toast(`${PLAYERS[turn]} can't move.`);
                    }

                    return newTokens;
                });

                // 3. Pass Turn (unless 6? Standard rule: 6 gets another turn. Simplified: pass for now)
                // If val === 6, Bot goes again? Let's keep it simple: 1 turn per player for now, or adhere to rule if easy.
                // Let's implement turn passing immediately.
                if (val !== 6) {
                    setTurn(prev => (prev + 1) % 4);
                } else {
                    // Bot rolls again - trigger logic again? 
                    // For simplicity in V1, let's just pass turn to avoid infinite loops if AI is buggy.
                    // Or re-trigger:
                    // We need a way to chain bot moves. 
                    // Let's stick to simple rotation first.
                    setTurn(prev => (prev + 1) % 4);
                }
                setDiceValue(null);
            };

            botPlay();
        }
    }, [turn, gameState]);

    // --- Bot Logic ---
    useEffect(() => {
        if (turn !== 0 && gameState !== 'FINISHED') {
            // Bot's Turn
            const botPlay = async () => {
                // 1. Roll Dice (delay for realism)
                await new Promise(r => setTimeout(r, 1000));
                setRolling(true);

                let val = 0;
                // Visualize rolling
                for (let i = 0; i < 10; i++) {
                    await new Promise(r => setTimeout(r, 50));
                    setDiceValue(Math.floor(Math.random() * 6) + 1);
                }
                val = Math.floor(Math.random() * 6) + 1;
                setDiceValue(val);
                setRolling(false);

                // 2. Decide Move
                await new Promise(r => setTimeout(r, 800)); // Thinking time

                setTokens(prevTokens => {
                    const newTokens = [...prevTokens];
                    const myTokens = newTokens[turn];

                    // Simple AI:
                    // 1. If 6 rolled, prioritize opening a token if we have < 2 active
                    // 2. Else, move furthest active token
                    // 3. Or just move first possible token

                    let moved = false;

                    // Find moveable tokens
                    const moveableIndices = myTokens.map((t, i) => {
                        if (t.status === 'base' && val === 6) return i;
                        if (t.status === 'active' && t.position + val <= 56) return i;
                        return -1;
                    }).filter(i => i !== -1);

                    if (moveableIndices.length > 0) {
                        // Pick best move
                        // Priority: Open token if 6
                        const openMove = moveableIndices.find(i => myTokens[i].status === 'base');
                        const moveIndex = (val === 6 && openMove !== undefined) ? openMove : moveableIndices[Math.floor(Math.random() * moveableIndices.length)];

                        const token = myTokens[moveIndex];
                        if (token.status === 'base') {
                            token.status = 'active';
                            token.position = 0;
                        } else {
                            token.position += val;
                            // Check win
                            if (token.position === 56) {
                                token.status = 'finished';
                                toast.success(`${PLAYERS[turn]} Token Finished!`);
                            }
                        }
                        moved = true;
                    }

                    if (!moved) {
                        toast(`${PLAYERS[turn]} can't move.`);
                    }

                    return newTokens;
                });

                // 3. Turn Passing Rule for Bot
                if (val !== 6) {
                    setTurn(prev => (prev + 1) % 4);
                } else {
                    // Bot rolled 6, gets another turn.
                    // IMPORTANT: In this simplified loop, triggering re-render might cause issues if we don't handle state well.
                    // For V1 stability, let's just pass turn even on 6 for Bots to avoid infinite loops if it gets stuck.
                    // Re-enable this later: setTurn(prev => prev); // Same turn

                    // Actually, if we keep same turn, this useEffect will re-run?
                    // Yes, because `diceValue` changes, but we only depend on [turn, gameState].
                    // We need to trigger botPlay again.
                    // Let's keep it simple: Bot passes turn always for V1.
                    setTurn(prev => (prev + 1) % 4);
                }
                setDiceValue(null);
            };

            botPlay();
        }
    }, [turn, gameState]);

    // --- Interaction ---
    const rollDice = async () => {
        if (rolling || turn !== 0) return; // Only human (Blue) can roll click

        setRolling(true);
        // Simulate roll animation
        let rolls = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            rolls++;
            if (rolls > 10) {
                clearInterval(interval);
                const finalVal = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalVal);
                setRolling(false);
                // Handle move logic here or wait for user to click token
            }
        }, 50);
    };

    // --- Render Helpers ---

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8">

                {/* Header */}
                <div className="w-full max-w-2xl px-4 mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter">LUDO <span className="text-primary">EXPRESS</span></h1>
                        <p className="text-gray-400 text-sm">Beat the bots to win!</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-surface-1 px-4 py-2 rounded-xl border border-white/10 flex flex-col items-end">
                            <span className="text-xs text-gray-400 uppercase font-bold">Wager</span>
                            <span className="font-mono font-bold text-white">₹100</span>
                        </div>
                    </div>
                </div>

                {/* Game Board Wrapper */}
                <div className="relative bg-surface-2 p-2 sm:p-4 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-sm">

                    {/* The Ludo Board (15x15 CSS Grid) */}
                    <div
                        className="bg-white border-4 border-gray-800 aspect-square w-full max-w-[500px] h-auto mx-auto grid shadow-2xl"
                        style={{
                            gridTemplateColumns: 'repeat(15, 1fr)',
                            gridTemplateRows: 'repeat(15, 1fr)'
                        }}
                    >
                        {/* --- TOP LEFT: RED BASE (Row 1-6, Col 1-6) --- */}
                        <div className="col-start-1 col-end-7 row-start-1 row-end-7 bg-red-600 border-r-2 border-b-2 border-gray-800 p-4 relative">
                            <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center relative shadow-inner">
                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-red-600 border-2 border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- TOP VERTICAL PATH (Row 1-6, Col 7-9) --- */}
                        {/* Rows 1-6, Col 7,8,9 */}
                        {/* We generate cells for this section */}
                        {/* This path belongs to Green (if standard) or is shared? Standard: Vertical Path Top is Green's home run? No, Vertical Top is Yellow's path? */}
                        {/* Standard Ludo:
                            TL: Red, TR: Green
                            BL: Blue, BR: Yellow

                            Top Path (Vertical): Green's territory? No, usually TR is Green.
                            Let's map standard:
                            TL: Red
                            TR: Green
                            BL: Blue
                            BR: Yellow

                            Top Middle Cols (7,8,9):
                            Col 7: Open movement
                            Col 8: Green Home Path (starts from top) -> Standard Ludo Green is TR. Usually Top Vertical is Green's home column.
                            Col 9: Open movement
                         */}

                        {/* Simulating Cells for Top Middle (6 rows x 3 cols = 18 cells) */}
                        <div className="col-start-7 col-end-10 row-start-1 row-end-7 grid grid-cols-3 grid-rows-6 border-b-2 border-gray-800">
                            {/* Row 1 */}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            {/* Row 2 */}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            <div className="border-[0.5px] border-gray-400 bg-green-500"></div> {/* Home Path */}
                            <div className="border-[0.5px] border-gray-400 bg-green-500 relative flex justify-center items-center"><Play size={10} className="text-white rotate-180" /></div> {/* Safe/Start? */}
                            {/* Remaining Green Home Path */}
                            {[...Array(4)].map((_, r) => (
                                <>
                                    <div className="border-[0.5px] border-gray-400 bg-white"></div>
                                    <div className="border-[0.5px] border-gray-400 bg-green-500"></div>
                                    <div className="border-[0.5px] border-gray-400 bg-white"></div>
                                </>
                            ))}
                        </div>


                        {/* --- TOP RIGHT: GREEN BASE (Row 1-6, Col 10-15) --- */}
                        <div className="col-start-10 col-end-16 row-start-1 row-end-7 bg-green-600 border-l-2 border-b-2 border-gray-800 p-4">
                            <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center shadow-inner">
                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-green-600 border-2 border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- LEFT HORIZONTAL PATH (Row 7-9, Col 1-6) --- Red's Side */}
                        <div className="row-start-7 row-end-10 col-start-1 col-end-7 grid grid-rows-3 grid-cols-6 border-r-2 border-gray-800">
                            {/* Row 7 */}
                            {[...Array(5)].map((_, c) => <div key={c} className="border-[0.5px] border-gray-400 bg-white"></div>)}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>

                            {/* Row 8 (Red Home Path) */}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            {[...Array(5)].map((_, c) => <div key={c} className="border-[0.5px] border-gray-400 bg-red-500"></div>)}

                            {/* Row 9 */}
                            <div className="border-[0.5px] border-gray-400 bg-red-500 flex justify-center items-center"><Play size={10} className="text-white rotate-90" /></div> {/* Red Start */}
                            {[...Array(5)].map((_, c) => <div key={c} className="border-[0.5px] border-gray-400 bg-white"></div>)}
                        </div>

                        {/* --- CENTER (Row 7-9, Col 7-9) --- */}
                        <div className="col-start-7 col-end-10 row-start-7 row-end-10 bg-gray-800 relative overflow-hidden">
                            {/* Triangles */}
                            <div className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(0 0, 0 100%, 50% 50%)' }}></div>
                            <div className="absolute inset-0 bg-green-500" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 50%)' }}></div>
                            <div className="absolute inset-0 bg-yellow-500" style={{ clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)' }}></div>
                            <div className="absolute inset-0 bg-blue-500" style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 50%)' }}></div>
                            {/* Winner Trophy/Center */}
                            <div className="absolute inset-0 m-auto w-1 w-1 bg-white/20"></div>
                        </div>

                        {/* --- RIGHT HORIZONTAL PATH (Row 7-9, Col 10-15) --- Yellow's Side */}
                        <div className="row-start-7 row-end-10 col-start-10 col-end-16 grid grid-rows-3 grid-cols-6 border-l-2 border-gray-800">
                            {/* Row 7 */}
                            {[...Array(6)].map((_, c) => <div key={c} className="border-[0.5px] border-gray-400 bg-white"></div>)}
                            {/* Row 8 (Yellow Home Path) */}
                            {[...Array(5)].map((_, c) => <div key={c} className="border-[0.5px] border-gray-400 bg-yellow-500"></div>)}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>

                            {/* Row 9 */}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            <div className="border-[0.5px] border-gray-400 bg-yellow-500 flex justify-center items-center"><Play size={10} className="text-white -rotate-90" /></div> {/* Yellow Start */}
                            {[...Array(4)].map((_, c) => <div key={c} className="border-[0.5px] border-gray-400 bg-white"></div>)}
                        </div>

                        {/* --- BOTTOM LEFT: BLUE BASE (Row 10-15, Col 1-6) --- */}
                        <div className="col-start-1 col-end-7 row-start-10 row-end-16 bg-blue-600 border-r-2 border-t-2 border-gray-800 p-4">
                            <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center shadow-inner">
                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-blue-600 border-2 border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* --- BOTTOM VERTICAL PATH (Row 10-15, Col 7-9) --- */}
                        <div className="col-start-7 col-end-10 row-start-10 row-end-16 grid grid-cols-3 grid-rows-6 border-t-2 border-gray-800">
                            {/* Bottom Path (Blue) */}
                            {[...Array(4)].map((_, r) => (
                                <>
                                    <div className="border-[0.5px] border-gray-400 bg-white"></div>
                                    <div className="border-[0.5px] border-gray-400 bg-blue-500"></div>
                                    <div className="border-[0.5px] border-gray-400 bg-white"></div>
                                </>
                            ))}
                            {/* Row 14 */}
                            <div className="border-[0.5px] border-gray-400 bg-blue-500 flex justify-center items-center"><Play size={10} className="text-white" /></div> {/* Blue Start */}
                            <div className="border-[0.5px] border-gray-400 bg-blue-500"></div>
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            {/* Row 15 */}
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                            <div className="border-[0.5px] border-gray-400 bg-white"></div>
                        </div>

                        {/* --- BOTTOM RIGHT: YELLOW BASE (Row 10-15, Col 10-15) --- */}
                        <div className="col-start-10 col-end-16 row-start-10 row-end-16 bg-yellow-500 border-l-2 border-t-2 border-gray-800 p-4">
                            <div className="w-full h-full bg-white rounded-3xl flex items-center justify-center shadow-inner">
                                <div className="grid grid-cols-2 gap-4">
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"></div>
                                    ))}
                                </div>
                            </div>
                        </div>



                        {/* --- TOKENS RENDERING --- */}
                        {tokens.map((playerTokens, pIndex) => (
                            playerTokens.map((token, tIndex) => {
                                // Calculate Position
                                let pos = { r: 1, c: 1 };
                                if (token.status === 'base') {
                                    const baseOrigins = [
                                        { r: 12, c: 3 }, // Blue Base (BL)
                                        { r: 3, c: 3 },  // Red Base (TL)
                                        { r: 3, c: 12 }, // Green Base (TR)
                                        { r: 12, c: 12 } // Yellow Base (BR)
                                    ];
                                    const origin = baseOrigins[pIndex];
                                    // Local 2x2 grid offsets
                                    const dr = Math.floor(tIndex / 2);
                                    const dc = tIndex % 2;
                                    pos = { r: origin.r + dr, c: origin.c + dc };
                                } else {
                                    pos = getCoordinates(pIndex, token.position);
                                }

                                const isTurn = turn === pIndex;
                                const canMove = isTurn && !rolling && diceValue && (
                                    (token.status === 'base' && diceValue === 6) ||
                                    (token.status === 'active')
                                );

                                return (
                                    <motion.div
                                        key={`${pIndex}-${tIndex}`}
                                        layout
                                        initial={false}
                                        animate={{
                                            gridRowStart: pos.r,
                                            gridRowEnd: pos.r + 1,
                                            gridColumnStart: pos.c,
                                            gridColumnEnd: pos.c + 1
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className={`
                                            relative z-20 flex items-center justify-center w-full h-full
                                            ${canMove ? 'cursor-pointer z-30' : ''}
                                        `}
                                        onClick={() => {
                                            if (canMove) {
                                                // Placeholder Move
                                                const newTokens = [...tokens];
                                                const currentToken = newTokens[pIndex][tIndex];

                                                if (currentToken.status === 'base') {
                                                    currentToken.status = 'active';
                                                    currentToken.position = 0; // Start
                                                } else {
                                                    currentToken.position += diceValue;
                                                    if (currentToken.position > 56) {
                                                        currentToken.position = 56;
                                                        currentToken.status = 'finished';
                                                        toast.success("Token Finished!");
                                                    }
                                                }

                                                setTokens(newTokens);

                                                // User Turn Passing Rule
                                                if (diceValue !== 6) {
                                                    setTurn((turn + 1) % 4);
                                                } else {
                                                    toast("Rolled 6! Roll again.");
                                                }
                                                setDiceValue(null);
                                            }
                                        }}
                                    >
                                        <div className={`
                                            w-[70%] h-[70%] rounded-full shadow-lg border-2 border-white
                                            ${pIndex === 0 ? 'bg-blue-600' : pIndex === 1 ? 'bg-red-600' : pIndex === 2 ? 'bg-green-600' : 'bg-yellow-500'}
                                            ${canMove ? 'animate-bounce ring-4 ring-white/50' : ''}
                                        `}></div>
                                    </motion.div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="mt-8 flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={turn}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`p-6 rounded-2xl border-2 ${turn === 0 ? 'bg-blue-900/50 border-blue-500' : 'bg-gray-800 border-gray-700'}`}
                        >
                            <p className="text-gray-300 text-sm mb-2 font-bold uppercase tracking-wider text-center">
                                {turn === 0 ? "Your Turn (Blue)" : `${PLAYERS[turn]}'s Turn`}
                            </p>

                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={rollDice}
                                    disabled={turn !== 0 || rolling || diceValue}
                                    className={`
                                        w-20 h-20 rounded-xl flex items-center justify-center text-4xl font-black shadow-lg transition-all
                                        ${turn === 0 && !diceValue ? 'bg-white text-blue-600 hover:scale-105 active:scale-95 cursor-pointer' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}
                                        ${rolling ? 'animate-spin' : ''}
                                    `}
                                >
                                    {diceValue || <Play size={32} />}
                                </button>

                                {diceValue && (
                                    <div className="text-white text-sm max-w-[120px]">
                                        Rolled a <span className="font-bold text-xl text-yellow-400">{diceValue}</span>!
                                        {diceValue === 6 ? ' Pick a token to open or move!' : ' Pick a token to move.'}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div >
        </MainLayout >
    );
}

