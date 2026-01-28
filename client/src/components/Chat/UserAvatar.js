export default function UserAvatar({ user, size = "md", showLevel = false, level = 1 }) {
    // Size classes
    const sizeClasses = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-xs",
        lg: "w-12 h-12 text-sm",
        xl: "w-24 h-24 text-2xl",
    };

    // Generate initials
    const initials = user?.name
        ? user.name.substring(0, 2).toUpperCase()
        : "??";

    // Level border color based on level
    const getBorderColor = (lvl) => {
        if (lvl >= 50) return "border-purple-500 shadow-[0_0_10px_purple]";
        if (lvl >= 20) return "border-yellow-500 shadow-[0_0_8px_orange]";
        if (lvl >= 10) return "border-blue-500";
        return "border-gray-500";
    };

    return (
        <div className="relative inline-block">
            <div
                className={`
          ${sizeClasses[size]} 
          rounded-full bg-surface-3 flex items-center justify-center 
          font-bold text-white select-none overflow-hidden
          border-2 ${getBorderColor(level)}
        `}
            >
                {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    <span>{initials}</span>
                )}
            </div>

            {showLevel && (
                <div className="absolute -bottom-1 -right-1 bg-surface-1 text-[10px] font-bold px-1 rounded border border-white/10">
                    {level}
                </div>
            )}
        </div>
    );
}
