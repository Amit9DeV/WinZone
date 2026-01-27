'use client';

import Link from 'next/link';
import { Plane, Trophy, Dices, Gamepad2, Bomb, LayoutGrid, Disc, Coins, Target, Sparkles, Rocket, Grid } from 'lucide-react';
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

    return (
        <Link
            href={getGameRoute(game.gameId)}
            onClick={onClick}
            className="game-card block w-full"
            target={game.gameId === 'aviator' ? '_blank' : undefined}
            rel={game.gameId === 'aviator' ? 'noopener noreferrer' : undefined}
        >
            <div className="relative aspect-[3/4] md:aspect-square rounded-xl overflow-hidden bg-surface-2 border border-white/5">

                {/* Game Image */}
                <div className="absolute inset-0">
                    <img
                        src={gameImage}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />

                    {/* Fallback Icon */}
                    <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-surface-2 to-surface-1">
                        <GameIcon />
                    </div>
                </div>

                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                {/* Live Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-medium text-white/90 uppercase">Live</span>
                </div>

                {/* Game Info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-base md:text-lg font-bold text-white mb-1">
                        {game.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>{Math.floor(Math.random() * 3000) + 500} Playing</span>
                        <div className="bg-primary text-black font-bold px-3 py-1 rounded-full">
                            Play
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .game-card {
                    transition: transform 0.2s ease;
                }
                .game-card:hover {
                    transform: translateY(-4px);
                }
                .game-card:active {
                    transform: translateY(-2px);
                }
            `}</style>
        </Link>
    );
}
