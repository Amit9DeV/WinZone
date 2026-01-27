'use client';

import { useServerStatus } from '@/context/ServerStatusContext';
import LoadingScreen from './LoadingScreen';

export default function ServerWrapper({ children }) {
    const { isOnline, elapsedTime } = useServerStatus();

    // Show loading screen while checking or if offline
    if (isOnline === null || isOnline === false) {
        return <LoadingScreen elapsedTime={elapsedTime} />;
    }

    // Server is online, render children
    return <>{children}</>;
}
