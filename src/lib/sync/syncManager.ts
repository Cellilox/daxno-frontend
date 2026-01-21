import { getPendingFiles, removeOfflineFile, updateFileStatus } from '../db/indexedDB';
import { getPresignedUrl, queryDocument } from '@/actions/record-actions';

class SyncManager {
    private syncing = false;

    async processQueue() {
        if (typeof window === 'undefined' || !navigator.onLine || this.syncing) return;

        const pending = await getPendingFiles();
        if (pending.length === 0) return;

        console.log(`[SyncManager] Found ${pending.length} pending files. Starting sync...`);
        this.syncing = true;

        for (const item of pending) {
            try {
                await updateFileStatus(item.id, 'syncing');

                console.log(`[SyncManager] Fetching presigned URL for: ${item.metadata.originalName}`);

                // 1. Get presigned URL
                const { upload_url, filename } = await getPresignedUrl(
                    item.metadata.originalName,
                    item.projectId,
                    item.metadata.mimeType
                );

                // 2. Upload to S3
                console.log(`[SyncManager] Uploading to S3...`);
                const uploadResponse = await fetch(upload_url, {
                    method: 'PUT',
                    body: item.file,
                    headers: {
                        'Content-Type': item.metadata.mimeType,
                    },
                });

                if (!uploadResponse.ok) {
                    throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
                }

                // 3. Trigger analysis (same as online flow)
                console.log(`[SyncManager] Triggering analysis for: ${filename}`);
                await queryDocument(item.projectId, filename, item.metadata.originalName);

                // 4. Cleanup
                await removeOfflineFile(item.id);
                console.log(`[SyncManager] Successfully synced: ${item.metadata.originalName}`);

            } catch (error) {
                console.error(`[SyncManager] Sync failed for ${item.id}:`, error);
                await updateFileStatus(item.id, 'failed');
                // Continue with next item
            }
        }

        this.syncing = false;
        console.log(`[SyncManager] Sync process finished.`);
    }
}

export const syncManager = new SyncManager();

// Setup listeners if in browser
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('[SyncManager] Connection restored. Processing queue...');
        syncManager.processQueue();
    });

    // Also try to sync on load
    window.addEventListener('load', () => {
        syncManager.processQueue();
    });
}
