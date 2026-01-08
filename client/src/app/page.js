'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { gameAPI, userAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import GameCard from '@/components/GameCard';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Flame, Trophy, Star, Clock } from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState([]);
  const [topBets, setTopBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [gamesRes, topBetsRes] = await Promise.all([
        gameAPI.getGames(),
        userAPI.getTopBets('day')
      ]);

      if (gamesRes.data.success) {
        setGames(gamesRes.data.data);
      }
      if (topBetsRes.data.status) {
        setTopBets(topBetsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
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

  const scrollToGames = () => {
    document.getElementById('games-grid').scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400 animate-pulse">Loading WinZone...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8 md:mb-12 min-h-[400px] md:h-[500px] group shadow-2xl shadow-purple-900/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-purple-900 to-blue-900">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>

          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[url('https://assets.codepen.io/1462889/grid.png')] opacity-10 bg-repeat"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-16 max-w-4xl pt-8 pb-8 md:pt-0 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs md:text-sm font-medium text-purple-300 mb-6 hover:bg-white/10 transition-colors cursor-default"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              New Game Available
            </motion.span>

            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Play <span className="animate-shine font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Aviator</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Win Big Today!</span>
            </h1>

            <p className="text-base md:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed drop-shadow-md">
              Experience the thrill of the world's most popular crash game.
              Multiplier goes up, cash out before it flies away!
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="px-8 py-6 text-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 transform hover:-translate-y-1"
                onClick={scrollToGames}
              >
                <div className="flex items-center gap-2">
                  <Flame className="animate-pulse text-orange-400" />
                  Play Now
                </div>
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-lg border-white/10 hover:bg-white/5 backdrop-blur-sm"
              >
                Learn How to Play
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="hidden md:block absolute right-4 bottom-12 md:right-20 md:top-1/2 md:-translate-y-1/2 opacity-60 md:opacity-100 filter drop-shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform duration-500">
          <div className="text-[100px] md:text-[200px]">✈️</div>
        </div>
      </div>

      {/* Games Grid */}
      <div id="games-grid" className="mb-20 md:mb-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">All Games</h2>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-20 bg-surface-1 rounded-2xl border border-white/5">
            <div className="text-6xl mb-4 opacity-50">🎮</div>
            <h3 className="text-xl font-bold text-white mb-2">No games available</h3>
            <p className="text-gray-400">Check back later for new games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {games.map((game, index) => (
              <div key={game.gameId}>
                <GameCard game={game} onClick={handleGameClick} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Wins Ticker */}
      {topBets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-1/90 backdrop-blur-md border-t border-white/5 py-2 z-50 block shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
          <div className="container mx-auto flex items-center gap-4 md:gap-8 overflow-hidden whitespace-nowrap">
            <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider pl-4">Live Wins:</span>
            <div className="flex gap-8 animate-marquee">
              {topBets.map((bet, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">{bet.userinfo[0]?.userName || 'User'}</span>
                  <span className="text-green-400 font-bold">won ₹{Math.floor(bet.betAmount * bet.cashoutAt)}</span>
                  <span className="text-gray-500 text-xs">in Aviator ({bet.cashoutAt.toFixed(2)}x)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
