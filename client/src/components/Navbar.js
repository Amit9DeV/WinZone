'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, balance, logout, isAdmin } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-2xl font-bold">
              🎮 WinZone
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded ${
                  pathname === '/' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                Games
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-2 rounded ${
                  pathname === '/profile' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                Profile
              </Link>
              <Link
                href="/wallet"
                className={`px-3 py-2 rounded ${
                  pathname === '/wallet' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                Wallet
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`px-3 py-2 rounded ${
                    pathname === '/admin' ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">{user.name}</div>
              <div className="font-bold text-yellow-400">
                💰 {balance.toFixed(2)} INR
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

