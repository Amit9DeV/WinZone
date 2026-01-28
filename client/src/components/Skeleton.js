import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={twMerge(
                clsx(
                    "bg-surface-2 rounded-md overflow-hidden relative",
                    // The shimmer effect overlay
                    "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent",
                    className
                )
            )}
            {...props}
        />
    );
}
