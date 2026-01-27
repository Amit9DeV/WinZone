
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subtext, icon: Icon, color = 'blue', delay = 0 }) {
    const colorMap = {
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        green: 'bg-green-500/10 text-green-500 border-green-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-6 rounded-2xl border ${colorMap[color]} backdrop-blur-sm relative overflow-hidden`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <h3 className="text-3xl font-bold mt-2">{value}</h3>
                    {subtext && <p className="text-xs mt-2 opacity-60">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl bg-white/5 ${color === 'white' ? 'text-gray-400' : ''}`}>
                    {Icon && <Icon size={24} />}
                </div>
            </div>
        </motion.div>
    );
}
