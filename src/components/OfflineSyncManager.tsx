'use client';

import { useEffect, useState, useRef } from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { getPendingFiles, updateFileStatus, removeOfflineFile, getOfflineFiles, markFileUploaded, getPendingDeletions, removePendingDeletion, getPendingProjectActions, removePendingProjectAction, getPendingColumnActions, removePendingColumnAction, getPendingRecordActions, removePendingRecordAction } from '@/lib/db/indexedDB';
import { getPresignedUrl, queryDocument, deleteRecord, updateRecord, deleteBatchRecords } from '@/actions/record-actions';
import { deleteProject, updateProject } from '@/actions/project-actions';
import { deleteColumn, updateColumn } from '@/actions/column-actions';

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
                notifyRefresh();
            } catch (err) {
                console.error('[OfflineSync] Failed to cleanup stuck files:', err);
            }
        };

        const handleUpdate = () => {
            if (isOnline) syncOfflineFiles();
        };

        if (isOnline) {
            // Small delay to ensure network is stable
            const timeoutId = setTimeout(() => {
                cleanupStuckFiles().then(() => syncOfflineFiles());
            }, 1000);

            window.addEventListener('daxno:offline-files-updated', handleUpdate);

            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('daxno:offline-files-updated', handleUpdate);
            };
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

            const [pendingFiles, pendingDeletions, pendingProjectActions, pendingColumnActions, pendingRecordActions] = await Promise.all([
                getPendingFiles(),
                getPendingDeletions(),
                getPendingProjectActions(),
                getPendingColumnActions(),
                getPendingRecordActions()
            ]);

            if (pendingFiles.length === 0 && pendingDeletions.length === 0 && pendingProjectActions.length === 0 && pendingColumnActions.length === 0 && pendingRecordActions.length === 0) return;

            // 1. Sync Project Actions
            if (pendingProjectActions.length > 0) {
                console.log(`[OfflineSync] Syncing ${pendingProjectActions.length} project actions...`);
                for (const action of pendingProjectActions) {
                    try {
                        if (action.type === 'delete') {
                            await deleteProject(action.id);
                        } else if (action.type === 'update') {
                            await updateProject(action.id, action.data);
                        }
                        await removePendingProjectAction(action.id);
                        console.log(`[OfflineSync] Successfully synced ${action.type} for project: ${action.id}`);
                        notifyRefresh();
                    } catch (err) {
                        console.error(`[OfflineSync] Project sync failed for ${action.id}:`, err);
                    }
                }
            }

            // 2. Sync Column Actions
            if (pendingColumnActions.length > 0) {
                console.log(`[OfflineSync] Syncing ${pendingColumnActions.length} column actions...`);
                for (const action of pendingColumnActions) {
                    try {
                        if (action.type === 'delete') {
                            await deleteColumn(action.id, action.projectId);
                        } else if (action.type === 'update') {
                            await updateColumn(action.id, action.projectId, action.data);
                        }
                        await removePendingColumnAction(action.id);
                        console.log(`[OfflineSync] Successfully synced ${action.type} for column: ${action.id}`);
                        notifyRefresh();
                    } catch (err) {
                        console.error(`[OfflineSync] Column sync failed for ${action.id}:`, err);
                    }
                }
            }

            // 3. Sync Record Updates (Deletions are handled next)
            if (pendingRecordActions.length > 0) {
                console.log(`[OfflineSync] Syncing ${pendingRecordActions.length} record updates...`);
                for (const action of pendingRecordActions) {
                    try {
                        await updateRecord(action.id, action.data);
                        await removePendingRecordAction(action.id);
                        console.log(`[OfflineSync] Successfully synced update for record: ${action.id}`);
                        notifyRefresh();
                    } catch (err) {
                        console.error(`[OfflineSync] Record update sync failed for ${action.id}:`, err);
                    }
                }
            }

            // 4. Sync Record Deletions (Handles older single-queue approach)
            if (pendingDeletions.length > 0) {
                console.log(`[OfflineSync] Syncing ${pendingDeletions.length} offline deletions...`);
                // Group by project if possible for batching? For now keep it safe and simple.
                for (const del of pendingDeletions) {
                    try {
                        await deleteRecord(del.id);
                        await removePendingDeletion(del.id);
                        console.log(`[OfflineSync] Successfully synced deletion for record: ${del.id}`);
                        notifyRefresh();
                    } catch (err) {
                        console.error(`[OfflineSync] Failed to sync deletion for ${del.id}:`, err);
                    }
                }
            }

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

                            // Check if this is a usage limit error
                            let errorMsg = queryResult.error || 'Trigger failed';

                            // Detection for HTML errors (Proxy/Load Balancer)
                            if (errorMsg.includes('<!DOCTYPE html>') || errorMsg.includes('<html')) {
                                errorMsg = "Our servers are experiencing high load. We are automatically retrying safely...";
                            }

                            const isLimitError = errorMsg.includes('On your Free plan') ||
                                errorMsg.includes('DAILY_LIMIT_REACHED') ||
                                errorMsg.includes('AI_CREDITS_EXHAUSTED') ||
                                errorMsg.includes('exceed the limit');

                            if (isLimitError) {
                                // Dispatch custom event for limit errors so Global Handler can show popup
                                console.log('[OfflineSync] Dispatching usage limit event');
                                window.dispatchEvent(new CustomEvent('daxno:usage-limit-reached', {
                                    detail: {
                                        error: errorMsg,
                                        filename: originalName,
                                        projectId
                                    }
                                }));
                            }

                            await updateFileStatus(item.id, 'failed', errorMsg);

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
