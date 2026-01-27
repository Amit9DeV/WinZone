'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

export default function ProfitChart({ data }) {
    // Transform data for recharts
    const chartData = data.map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        profit: item.profit,
        bets: item.bets
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-surface-1 border border-white/20 rounded-lg p-3 shadow-xl">
                    <p className="text-xs text-gray-400 mb-1">{data.date}</p>
                    <p className={`text-sm font-bold ${data.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        Profit: ₹{data.profit.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Bets: {data.bets}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-surface-1 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Profit/Loss Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis
                        dataKey="date"
                        stroke="#888"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#888"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#colorProfit)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
