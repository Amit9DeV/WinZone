import React from 'react';
import { HiShieldCheck, HiLockClosed, HiServer } from 'react-icons/hi2';

export const metadata = {
    title: 'Provably Fair - WinZone',
    description: 'Learn how WinZone ensures 100% fair gaming with cryptographic verification.',
};

export default function FairnessPage() {
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
                        Provably Fair Gaming
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Our commitment to transparency and fairness.
                    </p>
                </header>

                <section className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-[#1b1b1b] p-6 rounded-xl border border-gray-800">
                        <HiShieldCheck className="text-4xl text-green-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Cryptographic Proof</h3>
                        <p className="text-gray-400">
                            Every round's result is predetermined using a SHA-256 hash chain before the game even starts.
                        </p>
                    </div>
                    <div className="bg-[#1b1b1b] p-6 rounded-xl border border-gray-800">
                        <HiLockClosed className="text-4xl text-blue-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Client Seed</h3>
                        <p className="text-gray-400">
                            You can influence the result by changing your client seed, ensuring we cannot manipulate the outcome.
                        </p>
                    </div>
                    <div className="bg-[#1b1b1b] p-6 rounded-xl border border-gray-800">
                        <HiServer className="text-4xl text-purple-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Verifiable History</h3>
                        <p className="text-gray-400">
                            Verify any past round using our open verification tool. Trust, but verify.
                        </p>
                    </div>
                </section>

                <section className="space-y-8 bg-[#1b1b1b]/50 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold">How it Works</h2>

                    <div className="space-y-4 text-gray-300">
                        <p>
                            The result of each round is generated using a combination of the <strong>Server Seed</strong> and the <strong>Client Seed</strong>.
                        </p>

                        <div className="bg-black/40 p-4 rounded-lg font-mono text-sm">
                            Result = HMAC_SHA256(ServerSeed, ClientSeed)
                        </div>

                        <p>
                            Before the round starts, we show you the SHA-256 hash of the Server Seed. After the round ends, we reveal the Server Seed itself. You can hash the revealed Server Seed to verify it matches the hash we showed you <em>before</em> the round started.
                        </p>

                        <p>
                            This process guarantees that the server decided the outcome prior to the game start and could not have changed it based on your bets.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
