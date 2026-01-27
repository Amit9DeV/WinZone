import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = ({ children, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20',
        secondary: 'bg-surface-2 hover:bg-surface-3 text-white border border-white/10',
        outline: 'border border-purple-500/50 text-purple-400 hover:bg-purple-500/10',
        ghost: 'hover:bg-white/5 text-gray-400 hover:text-white',
    };

    return (
        <button
            className={cn(
                'px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ icon: Icon, className, ...props }) => (
    <div className="relative">
        {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Icon size={18} />
            </div>
        )}
        <input
            className={cn(
                'w-full bg-surface-1 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all',
                Icon && 'pl-10',
                className
            )}
            {...props}
        />
    </div>
);

export const Card = ({ children, className, ...props }) => (
    <div
        className={cn(
            'glass-card rounded-2xl p-6',
            className
        )}
        {...props}
    >
        {children}
    </div>
);
