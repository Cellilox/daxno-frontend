import { buildApiUrl } from '@/lib/api-utils';
import {
    getMetaValue,
    setMetaValue,
    wipeAllCachedData,
} from '@/lib/db/indexedDB';

export type ReconcileResult = 'fresh' | 'wiped' | 'skipped';

const META_KEY_INSTANCE_ID = 'instance_id';

/**
 * In-flight guard so multiple concurrent callers (e.g. mount + online-flip
 * firing in the same tick) don't both wipe.
 */
let inFlight: Promise<ReconcileResult> | null = null;

/**
 * Compare the backend's instance_id with the one we've stored in IndexedDB.
 * On mismatch (including the very first run where stored is null), wipe all
 * cached data and persist the new instance_id.
 *
 * Returns:
 *  - 'fresh'   – cache is good, no action needed
 *  - 'wiped'   – cache was cleared; caller should refresh the UI
 *  - 'skipped' – manifest fetch failed (offline / transient); cache preserved
 */
export async function reconcileServerInstance(): Promise<ReconcileResult> {
    if (inFlight) return inFlight;
    inFlight = (async () => {
        try {
            const resp = await fetch(buildApiUrl('/sync/manifest'), {
                method: 'GET',
                cache: 'no-store',
            });
            if (!resp.ok) {
                console.warn(`[sync] /sync/manifest returned ${resp.status}; skipping reconcile`);
                return 'skipped' as const;
            }
            const { instance_id: serverInstanceId } = (await resp.json()) as {
                instance_id?: string;
            };
            if (!serverInstanceId) {
                console.warn('[sync] /sync/manifest missing instance_id; skipping reconcile');
                return 'skipped' as const;
            }

            const stored = await getMetaValue<string>(META_KEY_INSTANCE_ID);
            if (stored === serverInstanceId) {
                return 'fresh' as const;
            }

            console.info(
                `[sync] backend instance changed (stored=${stored ?? 'null'}, server=${serverInstanceId}); wiping local cache`,
            );
            await wipeAllCachedData();
            await setMetaValue(META_KEY_INSTANCE_ID, serverInstanceId);
            return 'wiped' as const;
        } catch (err) {
            console.warn('[sync] reconcileServerInstance failed; preserving cache', err);
            return 'skipped' as const;
        } finally {
            inFlight = null;
        }
    })();
    return inFlight;
}
