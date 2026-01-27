'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    wins: '#22c55e',
    losses: '#ef4444'
};

export default function WinRateChart({ wins, losses }) {
    const data = [
        { name: 'Wins', value: wins },
        { name: 'Losses', value: losses }
    ];

    const total = wins + losses;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
            return (
                <div className="bg-surface-1 border border-white/20 rounded-lg p-3 shadow-xl">
                    <p className="text-sm font-bold text-white">{data.name}</p>
                    <p className="text-xs text-gray-400">{data.value} bets ({percentage}%)</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-surface-1 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Win Rate</h3>

            {total === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <p>No bets yet</p>
                </div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <div className="text-4xl font-black text-primary">{winRate}%</div>
                        <div className="text-sm text-gray-400">Win Rate</div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.name === 'Wins' ? COLORS.wins : COLORS.losses}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-gray-300 text-sm">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    );
}
