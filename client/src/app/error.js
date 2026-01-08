'use client';

import { useEffect } from 'react';
import { HiRefresh } from 'react-icons/hi';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f0f] text-white p-4">
            <div className="bg-[#1b1b1b] p-8 rounded-2xl border border-red-500/30 shadow-2xl max-w-lg w-full text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>

                <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>

                <p className="text-gray-400 mb-8">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                    >
                        <HiRefresh size={20} />
                        Try again
                    </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 text-left bg-black/50 p-4 rounded overflow-auto max-h-48 text-xs text-red-300 font-mono">
                        {error.message}
                        <br />
                        {error.stack}
                    </div>
                )}
            </div>
        </div>
    );
}
