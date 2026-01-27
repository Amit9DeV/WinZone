
import { motion } from 'framer-motion';

export default function GamePerformance({ data }) {
    if (!data || data.length === 0) return <div className="text-center text-gray-400 py-8">No game data found</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-700">
                        <th className="py-3 px-4">Game</th>
                        <th className="py-3 px-4">Bet Count</th>
                        <th className="py-3 px-4">Wagered</th>
                        <th className="py-3 px-4">Payout</th>
                        <th className="py-3 px-4">GGR (Profit)</th>
                        <th className="py-3 px-4 text-right">RTP %</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {data.map((game, i) => (
                        <motion.tr
                            key={game.gameId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                        >
                            <td className="py-3 px-4 font-bold capitalize text-white">{game.gameId}</td>
                            <td className="py-3 px-4 text-gray-300">{game.betCount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-blue-400">₹{game.totalWagered.toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-300">₹{game.totalPayout.toLocaleString()}</td>
                            <td className={`py-3 px-4 font-bold ${game.ggr >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {game.ggr >= 0 ? '+' : ''}₹{game.ggr.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${game.rtp > 98 ? 'bg-red-500/20 text-red-400' : // High RTP = Losing money? Or Fair?
                                        game.rtp < 90 ? 'bg-green-500/20 text-green-400' : // Low RTP = Profitable
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {game.rtp.toFixed(2)}%
                                </span>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
