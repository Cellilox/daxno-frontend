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

    const id = crypto.randomUUID();
    const name = file instanceof File ? file.name : `photo-${Date.now()}.jpg`;
    const type = file.type || 'image/jpeg';

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

    return id;
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
