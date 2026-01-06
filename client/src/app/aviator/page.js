'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Aviator...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8 text-center text-white">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-4">✈️ Aviator Game</h1>
          <p className="text-gray-300 mb-6">Redirecting to Aviator...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-sm text-gray-400 mb-4">
            If you are not redirected automatically, click below:
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_AVIATOR_URL || 'http://localhost:3001'}?cert=${localStorage.getItem('token')}&userId=${user.id || user._id}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Open Aviator Game →
          </a>
        </div>
      </div>
    </div>
  );
}
