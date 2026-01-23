'use client';

import { useEffect, useState, useRef } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getPendingFiles, updateFileStatus, removeOfflineFile, getOfflineFiles } from '@/lib/db/indexedDB';
import { getPresignedUrl, queryDocument } from '@/actions/record-actions';

const GLOBAL_SYNCING_IDS = new Set<string>();
let IS_GLOBAL_SYNCING = false;

export default function OfflineSyncManager() {
    const { isOnline } = useSyncStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const syncingIds = useRef<Set<string>>(GLOBAL_SYNCING_IDS);

    useEffect(() => {
        const cleanupStuckFiles = async () => {
            try {
                const allFiles = await getOfflineFiles();
                for (const file of allFiles) {
                    if (file.status === 'syncing') {
                        await updateFileStatus(file.id, 'pending');
                    }
                }
                window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
            } catch (err) {
                console.error('[OfflineSync] Failed to cleanup stuck files:', err);
            }
        };

        if (isOnline) {
            cleanupStuckFiles().then(() => syncOfflineFiles());
        }

        // DISABLED: Continuous polling was causing performance issues
        // Sync will only trigger when isOnline state changes
    }, [isOnline]);

    const notifyRefresh = () => {
        window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
    };

    const syncOfflineFiles = async () => {
        if (isSyncing || IS_GLOBAL_SYNCING) return;

        // Use Web Locks API to prevent multiple tabs from syncing simultaneously
        if (typeof navigator !== 'undefined' && navigator.locks) {
            try {
                await navigator.locks.request('daxno_offline_sync', { ifAvailable: true }, async (lock) => {
                    if (!lock) {
                        console.log('[OfflineSync] Another tab is already syncing. Skipping.');
                        return;
                    }
                    await performSync();
                });
            } catch (err) {
                console.error('[OfflineSync] Lock failed:', err);
                await performSync();
            }
        } else {
            await performSync();
        }
    };

    const performSync = async () => {
        try {
            IS_GLOBAL_SYNCING = true;
            setIsSyncing(true);

            const pendingFiles = await getPendingFiles();
            if (pendingFiles.length === 0) return;

            console.log(`[OfflineSync] Syncing ${pendingFiles.length} offline files...`);

            for (const item of pendingFiles) {
                if (syncingIds.current.has(item.id)) continue;

                try {
                    syncingIds.current.add(item.id);
                    await updateFileStatus(item.id, 'syncing');
                    notifyRefresh();

                    const { file, projectId } = item;
                    const originalName = item.metadata?.originalName || 'unknown_file';
                    const mimeType = item.metadata?.mimeType || file.type || 'application/octet-stream';

                    console.log('[OfflineSync] Processing:', originalName);

                    // Get Presigned URL
                    const { upload_url, filename } = await getPresignedUrl(originalName, projectId, mimeType);

                    // Upload to S3
                    await new Promise((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.open('PUT', upload_url);
                        xhr.setRequestHeader('Content-Type', mimeType);
                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) resolve(null);
                            else reject(new Error(`S3 Status: ${xhr.status}`));
                        };
                        xhr.onerror = () => reject(new Error('Network Error'));
                        xhr.send(file);
                    });

                    // Trigger Processing
                    await queryDocument(projectId, filename, originalName);

                    // Success: Remove from DB
                    await removeOfflineFile(item.id);
                    console.log(`[OfflineSync] Successfully synced: ${originalName}`);
                    notifyRefresh();

                } catch (error: any) {
                    console.error('[OfflineSync] Failed to sync file:', item.metadata.originalName, error);

                    const errorMsg = error.message || 'Sync failed';

                    // Handle 404 (Project Deleted) - Remove file
                    if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('Not Found')) {
                        console.warn('[OfflineSync] Project not found (404). Purging orphan file:', item.metadata.originalName);
                        await removeOfflineFile(item.id);
                        notifyRefresh();
                        continue;
                    }

                    // Handle 401 (Auth Expired) - Stop sync loop
                    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
                        console.warn('[OfflineSync] Session expired. Stopping sync loop.');
                        await updateFileStatus(item.id, 'failed', 'Session expired. Please refresh.');
                        notifyRefresh();
                        break;
                    }

                    // Handle 400/500 errors - Mark as failed but continue with next file
                    if (errorMsg.includes('400') || errorMsg.includes('500') || errorMsg.includes('unexpected response')) {
                        console.warn('[OfflineSync] Server error for file:', item.metadata.originalName, errorMsg);
                        await updateFileStatus(item.id, 'failed', 'Server error. Project may not exist.');
                        notifyRefresh();
                        continue;
                    }

                    // Generic error - Mark as failed
                    console.warn('[OfflineSync] Marking file as failed:', item.metadata.originalName);
                    await updateFileStatus(item.id, 'failed', errorMsg);
                    notifyRefresh();
                } finally {
                    syncingIds.current.delete(item.id);
                }
            }
        } catch (err) {
            console.error('[OfflineSync] Error during sync:', err);
        } finally {
            IS_GLOBAL_SYNCING = false;
            setIsSyncing(false);
            notifyRefresh();
        }
    };

    return null;
}
