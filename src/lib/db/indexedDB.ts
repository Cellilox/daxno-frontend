import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DaxnoDB extends DBSchema {
    offlineFiles: {
        key: string;
        value: {
            id: string;
            file: Blob;
            projectId: string;
            status: 'pending' | 'syncing' | 'failed';
            uploadedToS3: boolean;
            createdAt: number;
            metadata: {
                originalName: string;
                mimeType: string;
                error?: string;
            };
        };
    };
    projects: {
        key: string; // userId/owner
        value: {
            owner: string;
            data: any[];
            updatedAt: number;
        };
    };
    cachedRecords: {
        key: string; // projectId
        value: {
            projectId: string;
            data: any[];
            fields: any[];
            updatedAt: number;
        };
    };
}

const DB_NAME = 'daxno-offline';
const DB_VERSION = 3; // Bumped version

let dbPromise: Promise<IDBPDatabase<DaxnoDB>> | null = null;

// Promise-based mutex for atomic file addition
const fileLocks = new Map<string, Promise<string | null>>();

export async function getDB() {
    if (typeof window === 'undefined') return null;

    if (!dbPromise) {
        dbPromise = openDB<DaxnoDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    db.createObjectStore('offlineFiles', { keyPath: 'id' });
                }
                if (oldVersion < 3) {
                    if (!db.objectStoreNames.contains('projects')) {
                        db.createObjectStore('projects', { keyPath: 'owner' });
                    }
                    if (!db.objectStoreNames.contains('cachedRecords')) {
                        db.createObjectStore('cachedRecords', { keyPath: 'projectId' });
                    }
                }
            },
        });
    }
    return dbPromise;
}

// --- Caching Helpers ---

export async function cacheProjects(owner: string, projects: any[]) {
    const db = await getDB();
    if (!db) return;
    await db.put('projects', {
        owner,
        data: projects,
        updatedAt: Date.now()
    });
}

export async function getCachedProjects(owner: string) {
    const db = await getDB();
    if (!db) return [];
    const item = await db.get('projects', owner);
    return item?.data || [];
}

export async function cacheRecords(projectId: string, records: any[], fields: any[]) {
    const db = await getDB();
    if (!db) return;
    await db.put('cachedRecords', {
        projectId,
        data: records,
        fields,
        updatedAt: Date.now()
    });
}

export async function getCachedRecords(projectId: string) {
    const db = await getDB();
    if (!db) return null;
    return await db.get('cachedRecords', projectId);
}

// --- Smart Cache Cleanup Helpers ---

export async function removeProjectFromCache(owner: string, projectId: string) {
    const db = await getDB();
    if (!db) return;

    const cached = await db.get('projects', owner);
    if (!cached || !cached.data) return;

    const updatedData = cached.data.filter((p: any) => p.id !== projectId);

    await db.put('projects', {
        ...cached,
        data: updatedData,
        updatedAt: Date.now()
    });

    console.log(`[IndexedDB] Removed project ${projectId} from cache for owner ${owner}`);
}

export async function updateProjectInCache(owner: string, updatedProject: any) {
    const db = await getDB();
    if (!db) return;

    const cached = await db.get('projects', owner);
    if (!cached || !cached.data) return;

    const updatedData = cached.data.map((p: any) =>
        p.id === updatedProject.id ? { ...p, ...updatedProject } : p
    );

    await db.put('projects', {
        ...cached,
        data: updatedData,
        updatedAt: Date.now()
    });

    console.log(`[IndexedDB] Updated project ${updatedProject.id} in cache for owner ${owner}`);
}

/**
 * Syncs project deletions by comparing server data with cached data.
 * Removes projects from cache that no longer exist on the server.
 */
export async function syncProjectDeletions(userId: string, serverProjects: any[]) {
    const cached = await getCachedProjects(userId);
    const serverIds = new Set(serverProjects.map((p: any) => p.id));

    // Keep only projects that still exist on server
    const validProjects = cached.filter((p: any) => serverIds.has(p.id));

    if (validProjects.length < cached.length) {
        await cacheProjects(userId, validProjects);
        return {
            removed: cached.length - validProjects.length,
            retained: validProjects.length
        };
    }

    return { removed: 0, retained: cached.length };
}

/**
 * Syncs record deletions by comparing server data with cached data.
 * Removes records from cache that no longer exist on the server.
 */
export async function syncRecordDeletions(projectId: string, serverRecords: any[]) {
    const cached = await getCachedRecords(projectId);
    if (!cached) return { removed: 0, retained: 0 };

    const serverIds = new Set(serverRecords.map((r: any) => r.id));

    // Keep only records that still exist on server
    const validRecords = cached.data.filter((r: any) => serverIds.has(r.id));

    if (validRecords.length < cached.data.length) {
        await cacheRecords(projectId, validRecords, cached.fields);
        return {
            removed: cached.data.length - validRecords.length,
            retained: validRecords.length
        };
    }

    return { removed: 0, retained: cached.data.length };
}


export async function addOfflineFile(file: File | Blob, projectId: string) {
    const db = await getDB();
    if (!db) return null;

    const name = file instanceof File ? file.name : `photo-${Date.now()}.jpg`;
    const type = file.type || 'image/jpeg';
    const size = file.size;

    // Create unique key for this file
    const fileKey = `${projectId}:${name}:${size}`;

    // If this file is already being processed, wait for that operation to complete
    if (fileLocks.has(fileKey)) {
        console.log('[IndexedDB] File is already being added, waiting...:', name);
        return await fileLocks.get(fileKey)!;
    }

    // Create a promise for this file's addition and store it in the lock map
    const addPromise = (async () => {
        try {
            // Check for existing files in DB
            const existingFiles = await db.getAll('offlineFiles');
            const duplicate = existingFiles.find(f =>
                f.projectId === projectId &&
                f.metadata.originalName === name &&
                f.file.size === size
            );

            if (duplicate) {
                console.log('[IndexedDB] Duplicate file found in DB, skipping:', name);
                return duplicate.id;
            }

            // Generate UUID with fallback for browsers without crypto.randomUUID()
            const id = crypto.randomUUID ? crypto.randomUUID() :
                `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

            await db.add('offlineFiles', {
                id,
                file,
                projectId,
                status: 'pending',
                uploadedToS3: false,  // Not uploaded yet
                createdAt: Date.now(),
                metadata: {
                    originalName: name,
                    mimeType: type,
                },
            });

            console.log('[IndexedDB] Added offline file:', name, 'ID:', id, 'Size:', size);
            return id;
        } catch (error: any) {
            console.error('[IndexedDB] Error adding file:', name);
            console.error('[IndexedDB] Error details:', error);
            console.error('[IndexedDB] Error message:', error?.message);
            console.error('[IndexedDB] Error stack:', error?.stack);

            // On error, check if file was already added
            const existingFiles = await db.getAll('offlineFiles');
            const existing = existingFiles.find(f =>
                f.projectId === projectId &&
                f.metadata.originalName === name
            );
            return existing?.id || null;
        } finally {
            // Remove from locks after a short delay to prevent immediate re-addition
            setTimeout(() => fileLocks.delete(fileKey), 500);
        }
    })();

    // Store the promise in the map
    fileLocks.set(fileKey, addPromise);

    return await addPromise;
}

export async function getPendingFiles() {
    const db = await getDB();
    if (!db) return [];

    const all = await db.getAll('offlineFiles');
    return all.filter(f => f.status === 'pending' || f.status === 'failed');
}

export async function getOfflineFiles() {
    const db = await getDB();
    if (!db) return [];
    return await db.getAll('offlineFiles');
}

export async function updateFileStatus(id: string, status: 'pending' | 'syncing' | 'failed', errorMessage?: string) {
    const db = await getDB();
    if (!db) return;

    const item = await db.get('offlineFiles', id);
    if (item) {
        item.status = status;
        if (errorMessage) {
            item.metadata.error = errorMessage;
        }
        await db.put('offlineFiles', item);
    }
}

export async function removeOfflineFile(id: string) {
    const db = await getDB();
    if (!db) return;
    await db.delete('offlineFiles', id);
}

export async function markFileUploaded(id: string) {
    const db = await getDB();
    if (!db) return;

    const item = await db.get('offlineFiles', id);
    if (item) {
        item.uploadedToS3 = true;
        await db.put('offlineFiles', item);
        console.log('[IndexedDB] Marked file as uploaded to S3:', item.metadata.originalName);
    }
}

export async function clearAllOfflineFiles() {
    const db = await getDB();
    if (!db) return;
    await db.clear('offlineFiles');
}
