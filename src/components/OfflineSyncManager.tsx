'use client';

import { useEffect, useState, useRef } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getPendingFiles, updateFileStatus, removeOfflineFile, getOfflineFiles, markFileUploaded } from '@/lib/db/indexedDB';
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
                        // Check if S3 upload completed
                        if (file.uploadedToS3) {
                            // Upload done, just remove from queue
                            console.log('[Cleanup] File already uploaded, removing:', file.metadata.originalName);
                            await removeOfflineFile(file.id);
                        } else {
                            // Truly stuck, safe to retry
                            console.log('[Cleanup] Resetting stuck file:', file.metadata.originalName);
                            await updateFileStatus(file.id, 'pending');
                        }
                    }
                }
                window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
            } catch (err) {
                console.error('[OfflineSync] Failed to cleanup stuck files:', err);
            }
        };

        if (isOnline) {
            // Small delay to ensure network is stable
            const timeoutId = setTimeout(() => {
                cleanupStuckFiles().then(() => syncOfflineFiles());
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
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

                    // Check if already uploaded to S3
                    if (item.uploadedToS3) {
                        console.log('[OfflineSync] Already uploaded, removing from queue:', item.metadata.originalName);
                        await removeOfflineFile(item.id);
                        notifyRefresh();
                        continue;
                    }

                    await updateFileStatus(item.id, 'syncing');
                    notifyRefresh();

                    const { file, projectId } = item;
                    const originalName = item.metadata?.originalName || 'unknown_file';
                    const mimeType = item.metadata?.mimeType || file.type || 'application/octet-stream';

                    console.log('[OfflineSync] Processing:', originalName);

                    // Get Presigned URL
                    const presignedResult = await getPresignedUrl(originalName, projectId, mimeType);

                    if (!presignedResult.success) {
                        console.error('[OfflineSync] Presigned URL failed:', presignedResult.error);
                        await updateFileStatus(item.id, 'failed', presignedResult.error);
                        continue;
                    }

                    const { upload_url, filename } = presignedResult.data!;

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

                    // Mark as uploaded BEFORE removing (idempotency)
                    await markFileUploaded(item.id);
                    console.log('[OfflineSync] Marked as uploaded to S3:', originalName);
                    notifyRefresh();

                    // Trigger backend processing and AWAIT confirmation
                    console.log('[OfflineSync] Triggering backend analysis for:', originalName);
                    try {
                        const queryResult = await queryDocument(projectId, filename, originalName);

                        if (!queryResult.success) {
                            console.error('[OfflineSync] queryDocument failed:', queryResult.error);
                            await updateFileStatus(item.id, 'failed', queryResult.error || 'Trigger failed');
                            continue;
                        }
                        console.log('[OfflineSync] Backend confirmed receipt of:', originalName);

                        // ONLY remove from IndexedDB if backend confirmed receipt
                        await removeOfflineFile(item.id);
                        console.log('[OfflineSync] Successfully synced and removed from queue:', originalName);
                    } catch (err: any) {
                        console.error('[OfflineSync] Backend trigger failed for:', originalName, err);
                        await updateFileStatus(item.id, 'failed', err.message || 'Backend processing failed');
                    }

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

                    // Handle 401 (Auth Expired) - Pause sync loop
                    if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
                        console.warn('[OfflineSync] Session unauthorized. Pausing sync.');
                        break;
                    }

                    // Handle 400/500 errors - Mark as failed
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
