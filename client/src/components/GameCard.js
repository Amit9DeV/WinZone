'use client';

import Link from 'next/link';
import { Play, Users, Plane, Trophy, Dices, Gamepad2, Bomb, LayoutGrid, Disc } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameCard({ game, onClick }) {
    const getGameIcon = (gameId) => {
        const icons = {
            aviator: Plane,
            ipl: Trophy,
            dice: Dices,
            mines: Bomb,
            ludo: LayoutGrid,
            plinko: LayoutGrid,
            'triple-number': Dices,
            'coin-flip': Trophy,
            wheel: Disc, // Changed from Play to Disc for Wheel
            'color-prediction': LayoutGrid,
        };

        const Icon = icons[gameId] || Gamepad2;
        return <Icon size={56} strokeWidth={1.5} className="text-white drop-shadow-lg" />;
    };

    const getGameRoute = (gameId) => {
        const routes = {
            aviator: '/aviator',
            ipl: '/ipl',
            dice: '/dice',
            mines: '/mines',
            ludo: '/ludo',
            plinko: '/plinko',
            'triple-number': '/triple-number',
            'coin-flip': '/coin-flip',
            wheel: '/wheel',
            'color-prediction': '/color-prediction',
        };
        return routes[gameId] || '#';
    };

    const getGradient = (gameId) => {
        const gradients = {
            aviator: 'from-rose-600 to-orange-600',
            ipl: 'from-blue-600 to-cyan-500',
            dice: 'from-violet-600 to-fuchsia-600',
            mines: 'from-emerald-500 to-teal-600',
            ludo: 'from-orange-500 to-red-500',
            plinko: 'from-amber-400 to-orange-500',
            'triple-number': 'from-indigo-500 to-blue-600',
            'coin-flip': 'from-yellow-400 to-orange-500',
            wheel: 'from-pink-500 to-rose-600',
            'color-prediction': 'from-purple-600 to-indigo-600',
        };
        return gradients[gameId] || 'from-gray-700 to-gray-900';
    };

    return (
        <Link
            href={getGameRoute(game.gameId)}
            onClick={onClick}
            className="group relative block w-full h-full"
            target={game.gameId === 'aviator' ? '_blank' : undefined}
            rel={game.gameId === 'aviator' ? 'noopener noreferrer' : undefined}
        >
            {/* Glow Effect Backend */}
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${getGradient(game.gameId)} rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition duration-500 group-hover:duration-200`}></div>

            <div className="relative h-full bg-gray-900 rounded-xl overflow-hidden border border-white/5 shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">

                {/* Image Section with Gradient */}
                <div className={`h-40 relative bg-gradient-to-br ${getGradient(game.gameId)} flex items-center justify-center overflow-hidden`}>
                    {/* Noise Texture */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

                    {/* Radial sheen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                    {/* Animated Icon */}
                    <motion.div
                        className="z-10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        {getGameIcon(game.gameId)}
                    </motion.div>

                    {/* Live Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 shadow-sm z-20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-white tracking-wider">LIVE</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col h-[calc(100%-160px)] bg-gray-900/95 backdrop-blur-sm group-hover:bg-gray-900 transition-colors">

                    {/* Title & Desc */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-colors">
                            {game.name}
                        </h3>
                        <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed font-medium">
                            {game.description || 'Join the action and win big! Instant payouts.'}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] text-gray-400 font-medium">
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <span className="block text-gray-500 uppercase tracking-wider text-[9px] mb-0.5">Min Bet</span>
                            <span className="text-gray-200 text-xs">₹{Math.floor(game.minBet || 0).toLocaleString()}</span>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5 text-right">
                            <span className="block text-gray-500 uppercase tracking-wider text-[9px] mb-0.5">Max Bet</span>
                            <span className="text-gray-200 text-xs">₹{Math.floor(game.maxBet || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center text-gray-500 group-hover:text-gray-300 transition-colors">
                            <Users size={12} className="mr-1.5" />
                            <span className="text-[10px] font-semibold tracking-wide">{Math.floor(Math.random() * 500) + 100} playing</span>
                        </div>

                        <button className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transform transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white shadow-lg shadow-white/5 group-hover:shadow-blue-500/25">
                            <Play size={10} fill="currentColor" />
                            PLAY
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
