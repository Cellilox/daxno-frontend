import { useState, useEffect } from 'react';
import { syncManager } from '@/lib/sync/syncManager';

export function useSyncStatus() {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncManager.processQueue();
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
