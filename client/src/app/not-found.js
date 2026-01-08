'use client';
import Link from 'next/link';
import { HiHome } from 'react-icons/hi2';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f0f] text-white p-4">
            <div className="text-center space-y-6">
                <h1 className="text-9xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    404
                </h1>
                <h2 className="text-3xl font-semibold">Page Not Found</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 mt-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-full font-bold hover:scale-105 transition-transform"
                >
                    <HiHome size={20} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
