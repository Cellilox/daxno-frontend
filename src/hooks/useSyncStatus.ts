import { useState, useEffect } from 'react';

export function useSyncStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Increase delay to 10 seconds to allow Clerk handshake to finish in background
            setTimeout(() => {
                if (typeof window !== 'undefined' && window.location.pathname.includes('/projects/')) {
                    window.location.reload();
                }
            }, 10000);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            // Check immediately
            setIsOnline(navigator.onLine);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            }
        };
    }, []);

    return { isOnline };
}
