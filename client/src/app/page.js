'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { gameAPI } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getGameIcon = (gameId) => {
    const icons = {
      aviator: '✈️',
      ipl: '🏏',
      dice: '🎲',
    };
    return icons[gameId] || '🎮';
  };

  const getGameRoute = (gameId) => {
    const routes = {
      aviator: '/aviator',
      ipl: '/ipl',
      dice: '/dice',
    };
    return routes[gameId] || '#';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎮 Game Zone
          </h1>
          <p className="text-xl text-gray-300">
            Choose your game and start playing!
          </p>
        </div>

        {games.length === 0 ? (
          <div className="text-center text-white text-xl">
            No games available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link
                key={game.gameId}
                href={getGameRoute(game.gameId)}
                className="block"
                onClick={(e) => {
                  // Check auth before navigating
                  if (!user) {
                    e.preventDefault();
                    toast.error('Please login to play games');
                    router.push('/login');
                  }
                }}
              >
                <div className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow cursor-pointer transform hover:scale-105 transition-transform">
                  <div className="text-6xl mb-4 text-center">
                    {getGameIcon(game.gameId)}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {game.name}
                  </h2>
                  <p className="text-gray-600 mb-4 text-center">
                    {game.description || 'Play now!'}
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Min: {game.minBet} INR</span>
                    <span>Max: {game.maxBet} INR</span>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full">
                      Play Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {games.length}
              </div>
              <div className="text-gray-600">Available Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                💰 {user.balance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-gray-600">Your Balance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {user.totalBets || 0}
              </div>
              <div className="text-gray-600">Total Bets</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
