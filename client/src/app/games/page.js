'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import GameCard from '@/components/GameCard';
import { gameAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input, Button } from '@/components/ui';

export default function GamesPage() {
    const { user, loading: authLoading } = useAuth();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user) {
            fetchGames();
        }
    }, [user, authLoading]);

    const fetchGames = async () => {
        try {
            const response = await gameAPI.getGames();
            if (response.data.success) {
                setGames(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const handleGameClick = (e) => {
        if (!user) {
            e.preventDefault();
            toast.error('Please login to play games');
            router.push('/login');
        }
    };

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-gray-400 animate-pulse">Loading Games...</div>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-6">All Games</h1>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            icon={Search}
                            placeholder="Search games..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-surface-2 border-white/5 focus:bg-surface-3"
                        />
                    </div>
                    <Button variant="secondary" className="md:w-auto">
                        <Filter size={18} className="mr-2" /> Filters
                    </Button>
                </div>
            </div>

            {/* Games Grid */}
            {filteredGames.length === 0 ? (
                <div className="text-center py-20 bg-surface-1 rounded-2xl border border-white/5">
                    <div className="text-6xl mb-4 opacity-50">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">No games found</h3>
                    <p className="text-gray-400">Try adjusting your search terms</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames.map((game, index) => (
                        <motion.div
                            key={game.gameId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <GameCard game={game} onClick={handleGameClick} />
                        </motion.div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
}
