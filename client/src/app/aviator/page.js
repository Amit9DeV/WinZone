'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

export default function AviatorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const userId = user.id || user._id;

      if (!token) {
        toast.error('Please login to play games');
        router.push('/login');
        return;
      }

      // Redirect to Aviator with auth token
      // Aviator runs on port 3001
      const aviatorUrl = process.env.NEXT_PUBLIC_AVIATOR_URL || 'http://localhost:3001';
      const url = `${aviatorUrl}?cert=${token}&token=${token}&userId=${userId}`;

      // Redirect after a short delay to show loading
      const timer = setTimeout(() => {
        window.location.href = url;
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-black/40 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="text-red-600 font-black text-2xl italic tracking-tighter">AVIATOR</div>
            <HowToPlay title="How to Win Aviator" rules={AVIATOR_RULES} />
          </div>
          {/* This div was incomplete in the provided snippet, assuming it's for other header elements or was a typo */}
          <div className="bg-black/40 rounded-full px-4 py-1 border border-white/10 flex items-center gap-3"></div>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-400 animate-pulse">Loading Aviator...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 text-center text-white">
        <div className="max-w-md mx-auto bg-surface-1 rounded-2xl border border-white/5 p-8">
          <h1 className="text-3xl font-bold mb-4">✈️ Aviator Game</h1>
          <p className="text-gray-300 mb-6">Redirecting to Aviator...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-400 mb-4">
            If you are not redirected automatically, click below:
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_AVIATOR_URL || 'http://localhost:3001'}?cert=${localStorage.getItem('token')}&userId=${user.id || user._id}`}
            className="inline-block"
          >
            <Button>
              Open Aviator Game →
            </Button>
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
