'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { gameAPI, userAPI, contentAPI } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';
import { Flame } from 'lucide-react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
  '/corousel/089befde-5c79-43d4-aece-a53c90c36163.jpg',
  '/corousel/29195cc0-f9f7-4fad-8615-3ae1672e9335.jpg',
  '/corousel/83977cbb-6a05-4578-81f7-fc3a74c53397.jpg',
  '/corousel/c17be7cf-9277-42d5-b9a3-a5dbd471117e.jpg',
  '/corousel/e3c2ec8f-5586-4f16-9f61-231a177c0b3f.jpg',
  '/corousel/f2a4ad24-25dd-48cd-b5df-0a405ea5c3a8.jpg',
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [games, setGames] = useState([]);
  const [topBets, setTopBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [announcement, setAnnouncement] = useState(null);

  // Use fetched banners if available, else fallback options? 
  // For now we will rely on fetched banners. If empty, show default or empty.
  const slides = banners.length > 0 ? banners : CAROUSEL_IMAGES.map(src => ({ imageUrl: src }));

  // Auto-slide carousel
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

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
      // Parallel fetch for speed
      const [gamesRes, topBetsRes, banRes, annRes] = await Promise.all([
        gameAPI.getGames(),
        userAPI.getTopBets('day'),
        contentAPI.getBanners(),
        contentAPI.getAnnouncement()
      ]);

      if (gamesRes.data.success) setGames(gamesRes.data.data);
      if (topBetsRes.data.status) setTopBets(topBetsRes.data.data);
      if (banRes.data.success) setBanners(banRes.data.data);
      if (annRes.data.success) setAnnouncement(annRes.data.data);

    } catch (error) {
      // toast.error('Failed to load data'); // Silently fail for content
      console.error("Data load error", error);
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
    document.getElementById('games-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Assuming server URL for images
  const SERVER_URL = 'https://winzone-final.onrender.com';

  return (
    <MainLayout showChatbot={true}>

      {/* Announcement Bar */}
      {announcement && announcement.active && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-2 rounded-lg mb-6 flex items-center gap-2 overflow-hidden">
          <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0">News</span>
          <div className="animate-marquee whitespace-nowrap text-sm font-medium">
            {announcement.text}
          </div>
        </div>
      )}

      {/* Hero Carousel Section - Mobile Optimized */}
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden mb-6 md:mb-12 h-[280px] md:h-[450px]">
        {/* Carousel Images */}
        {slides.map((slide, index) => {
          // Handle absolute URL vs relative path
          const imgUrl = slide.imageUrl.startsWith('/corousel')
            ? slide.imageUrl
            : `${SERVER_URL}${slide.imageUrl}`;

          return (
            <div
              key={slide._id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={imgUrl}
                alt={slide.title || `Slide ${index + 1}`}
                fill
                className="object-contain md:object-cover"
                priority={index === 0}
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/50 md:bg-black/40"></div>
            </div>
          );
        })}

        {/* Content Overlay - Only show if NO banners (Default) OR if banners have no custom content yet (MVP) 
            For now, we overlay the static text ON TOP of the dynamic banner images too, 
            unless we want the banner image to supply the text. 
            Usually admins upload text-heavy banners. 
            Let's hide the overlay text if it's a dynamic banner to be safe, or keep it generic.
            Actually, let's keep the overlay but maybe optional? 
            For now, I'll keep it as the user didn't ask to remove the "Play Games" text.
         */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-12 max-w-3xl pointer-events-none">
          {/* ... existing text content ... */}
          {/* Making buttons clickable by re-enabling pointer events */}
          <div className="pointer-events-auto">
            {/* ... */}
          </div>
        </div>

        {/* Content Overlay (Restored mostly generic) */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-12 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-xs font-medium text-white mb-3 md:mb-4 w-fit backdrop-blur-sm">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400"></div>
            New Game Available
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-6xl font-bold text-white mb-2 md:mb-4 leading-tight drop-shadow-lg">
            Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Games</span>
            <br />
            Win Big Today!
          </h1>

          {/* Description */}
          <p className="text-xs md:text-lg text-white mb-4 md:mb-6 max-w-lg drop-shadow-md">
            Experience the thrill of online gaming. Multiple games, big wins!
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Button
              className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base flex items-center justify-center gap-2"
              onClick={scrollToGames}
            >
              <Flame size={16} className="md:w-[18px] md:h-[18px]" />
              Play Now
            </Button>
            <Button
              variant="outline"
              className="px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base border-white/20 hover:bg-white/10 backdrop-blur-sm"
            >
              Learn How to Play
            </Button>
          </div>
        </div>

        {/* Carousel Dots - Mobile Optimized */}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all touch-manipulation ${index === currentSlide ? 'bg-white w-5 md:w-6' : 'bg-white/50 w-2'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Games Grid - Mobile Optimized */}
      <div id="games-grid" className="mb-16 md:mb-12">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-white">All Games</h2>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-surface-1 rounded-xl border border-white/5">
            <div className="text-4xl md:text-5xl mb-2 md:mb-3 opacity-50">🎮</div>
            <h3 className="text-base md:text-lg font-bold text-white mb-1">No games available</h3>
            <p className="text-gray-400 text-xs md:text-sm">Check back later for new games!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-5">
            {games.map((game) => (
              <GameCard key={game.gameId} game={game} onClick={handleGameClick} />
            ))}
          </div>
        )}
      </div>

      {/* Live Wins Ticker - Mobile Optimized */}
      {topBets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-surface-1/95 border-t border-white/10 py-1.5 md:py-2 z-50">
          <div className="container mx-auto flex items-center gap-2 md:gap-6 overflow-hidden">
            <span className="text-[9px] md:text-xs font-bold text-primary uppercase pl-2 md:pl-3 flex-shrink-0">Live Wins:</span>
            <div className="flex gap-4 md:gap-6 animate-marquee text-[10px] md:text-sm">
              {topBets.map((bet, i) => (
                <div key={i} className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                  <span className="text-gray-400">{bet.userinfo[0]?.userName || 'User'}</span>
                  <span className="text-green-400 font-bold">₹{Math.floor(bet.betAmount * bet.cashoutAt)}</span>
                  <span className="text-gray-500">({bet.cashoutAt.toFixed(2)}x)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
