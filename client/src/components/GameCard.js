'use client';

import Link from 'next/link';
import { Plane, Trophy, Dices, Gamepad2, Bomb, LayoutGrid, Disc, Coins, Target, Sparkles, Rocket, Grid, Zap, Flame } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function GameCard({ game, onClick }) {
    const { t } = useLanguage();

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
            slots: '/slots',
            limbo: '/limbo',
            keno: '/keno',
        };
        return routes[gameId] || '#';
    };

    const getGameImage = (gameId) => {
        const images = {
            aviator: '/games/aviator.png',
            plinko: '/games/plinko.png',
            mines: '/games/mines.png',
            dice: '/games/dice.png',
            ludo: '/games/ludoexpress.png',
            'coin-flip': '/games/coinflip.png',
            ipl: '/games/ipl.jpg',
            wheel: '/games/wheel1.jpg',
            'color-prediction': '/games/color1.png',
            slots: '/games/slots.png',
            'triple-number': '/games/triple-number.png',
            limbo: '/games/limbo.png',
            keno: '/games/keno.png',
        };
        return images[gameId];
    };

    const GameIcon = () => {
        const icons = {
            aviator: Plane,
            ipl: Trophy,
            dice: Dices,
            mines: Bomb,
            ludo: LayoutGrid,
            plinko: Target,
            'triple-number': Sparkles,
            'coin-flip': Coins,
            wheel: Disc,
            'color-prediction': LayoutGrid,
            limbo: Rocket,
            keno: Grid,
        };
        const Icon = icons[game.gameId] || Gamepad2;
        return <Icon size={48} className="text-white opacity-20" />;
    };

    const gameImage = getGameImage(game.gameId);

    // Dynamic player count simulation
    const playerCount = Math.floor(Math.random() * 3000) + 500;
    const isHot = playerCount > 2000;

    return (
        <Link
            href={getGameRoute(game.gameId)}
            onClick={onClick}
            className="group block w-full relative"
            target={game.gameId === 'aviator' ? '_blank' : undefined}
            rel={game.gameId === 'aviator' ? 'noopener noreferrer' : undefined}
        >
            {/* Card Container */}
            <div className="relative aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden bg-surface-1 border border-white/5 transition-all duration-300 group-hover:border-[var(--primary)] group-hover:shadow-[0_0_20px_rgba(255,0,128,0.3)]">

                {/* Game Image */}
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                    <img
                        src={gameImage}
                        alt={game.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />

                    {/* Fallback Icon */}
                    <div className="hidden absolute inset-0 items-center justify-center bg-surface-2">
                        <GameIcon />
                    </div>
                </div>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                {/* Hot Badge */}
                {isHot && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-600/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-orange-400/30">
                        <Flame size={12} className="text-orange-200 fill-orange-200 animate-pulse" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Hot</span>
                    </div>
                )}

                {/* Live Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_2s_infinite]"></div>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                </div>

                {/* Game Info (Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-black text-white mb-2 leading-none uppercase tracking-tight group-hover:text-[var(--primary)] transition-colors">
                        {game.name}
                    </h3>

                    <div className="flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-300">
                            <User size={12} />
                            <span>{playerCount.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-1 bg-[var(--primary)] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg group-hover:bg-white group-hover:text-black transition-colors">
                            <Zap size={12} className="fill-current" />
                            PLAY
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function User({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
