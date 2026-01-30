'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getOfflineFiles, getPendingDeletions, getPendingProjectActions, getPendingColumnActions, getPendingRecordActions } from '@/lib/db/indexedDB';

export default function SyncBanner() {
    const { isOnline } = useSyncStatus();
    const [pendingCount, setPendingCount] = useState(0);
    const [syncingCount, setSyncingCount] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const isVisibleRef = useRef(false);
    const isFinishedRef = useRef(false);
    const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateCounts = async () => {
        const [files, deletions, projectActions, columnActions, recordActions] = await Promise.all([
            getOfflineFiles(),
            getPendingDeletions(),
            getPendingProjectActions(),
            getPendingColumnActions(),
            getPendingRecordActions()
        ]);

        const pending = files.filter(f => f.status === 'pending').length
            + deletions.length
            + projectActions.length
            + columnActions.length
            + recordActions.length;

        const syncing = files.filter(f => f.status === 'syncing').length;

        setPendingCount(pending);
        setSyncingCount(syncing);

        if (pending + syncing > 0) {
            setIsVisible(true);
            isVisibleRef.current = true;
            setIsFinished(false);
            isFinishedRef.current = false;
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        } else if (isVisibleRef.current && !isFinishedRef.current) {
            setIsVisible(true);
            setIsFinished(true);
            isFinishedRef.current = true;

            // Auto-hide after 4 seconds of showing "Complete"
            hideTimeoutRef.current = setTimeout(() => {
                setIsVisible(false);
                isVisibleRef.current = false;
                hideTimeoutRef.current = null;
            }, 4000);
        }
    };

    useEffect(() => {
        updateCounts();
        const interval = setInterval(updateCounts, 2000);

        const handleUpdate = () => updateCounts();
        window.addEventListener('daxno:offline-files-updated', handleUpdate);

        return () => {
            clearInterval(interval);
            window.removeEventListener('daxno:offline-files-updated', handleUpdate);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`} data-testid="sync-banner">
            <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 min-w-[320px]">
                {!isFinished ? (
                    <>
                        <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900" data-testid="sync-status-message">
                                {isOnline ? 'Syncing your data...' : 'Waiting for connection...'}
                            </span>
                            <span className="text-xs text-gray-500 font-medium" data-testid="sync-progress-count">
                                {syncingCount + pendingCount} item{syncingCount + pendingCount !== 1 ? 's' : ''} remaining
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="flex flex-col flex-1" data-testid="sync-complete-message">
                            <span className="text-sm font-bold text-gray-900">Sync Complete!</span>
                            <span className="text-xs text-gray-500 font-medium">All changes are now online.</span>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            data-testid="sync-refresh-button"
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200"
                        >
                            Refresh
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
