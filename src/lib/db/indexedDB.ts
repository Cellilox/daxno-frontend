import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DaxnoDB extends DBSchema {
    offlineFiles: {
        key: string;
        value: {
            id: string;
            file: Blob;
            projectId: string;
            status: 'pending' | 'syncing' | 'failed';
            createdAt: number;
            metadata: {
                originalName: string;
                mimeType: string;
                error?: string;
            };
        };
    };
}

const DB_NAME = 'daxno-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DaxnoDB>> | null = null;

// In-memory set to track files being added (prevents race conditions in bulk uploads)
const addingFiles = new Set<string>();

export async function getDB() {
    if (typeof window === 'undefined') return null;

    if (!dbPromise) {
        dbPromise = openDB<DaxnoDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('offlineFiles')) {
                    db.createObjectStore('offlineFiles', { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
}

export async function addOfflineFile(file: File | Blob, projectId: string) {
    const db = await getDB();
    if (!db) return null;

    const name = file instanceof File ? file.name : `photo-${Date.now()}.jpg`;
    const type = file.type || 'image/jpeg';
    const size = file.size;

    // Create unique key for this file
    const fileKey = `${projectId}:${name}:${size}`;

    // Check if this file is currently being added
    if (addingFiles.has(fileKey)) {
        console.log('[IndexedDB] File is currently being added, skipping duplicate:', name);
        // Wait a bit and return existing file
        await new Promise(resolve => setTimeout(resolve, 100));
        const allFiles = await db.getAll('offlineFiles');
        const existing = allFiles.find(f => f.metadata.originalName === name && f.projectId === projectId);
    }

    // Mark as being added
    addingFiles.add(fileKey);

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

        const id = crypto.randomUUID();

        await db.add('offlineFiles', {
            id,
            file,
            projectId,
            status: 'pending',
            createdAt: Date.now(),
            metadata: {
                originalName: name,
                mimeType: type,
            },
        });

        console.log('[IndexedDB] Added offline file:', name, 'ID:', id, 'Size:', size);
        return id;
    } catch (error: any) {
        console.error('[IndexedDB] Error adding file:', name, error);
        return null;
    } finally {
        // Remove from "being added" set after 1 second
        setTimeout(() => addingFiles.delete(fileKey), 1000);
    }
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

export async function clearAllOfflineFiles() {
    const db = await getDB();
    if (!db) return;
    await db.clear('offlineFiles');
}
