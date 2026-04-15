'use client';

import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SpreadSheet from './spreadsheet/SpreadSheet';
import SyncBanner from './SyncBanner';
import { Field, DocumentRecord } from './spreadsheet/types';
import ColumnReorderPopup from './forms/ColumnReorderPopup';
import BackfillRecordModal from './forms/BackfillRecordModal';
import { getOfflineFiles, removeOfflineFile, updateRecordAnswerInCache, updateRecordInCache, cacheRecords, removeRecordFromCache } from '@/lib/db/indexedDB';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { deleteBatchRecords, deleteRecord, getRecords, updateRecord } from '@/actions/record-actions';
import { deleteColumn, getColumns, updateColumn } from '@/actions/column-actions';
import SmartAuthGuard from '@/components/auth/SmartAuthGuard';
import ColumnRecommendationBanner from '@/components/ColumnRecommendationBanner';

type RecordsProps = {
    projectId: string;
    initialFields: Field[];
    initialRecords: DocumentRecord[];
    project: any;
    subscriptionType?: string;
    onSelectionChange?: (count: number, onDelete: () => void, onClear: () => void, isDeleting: boolean) => void;
};

export default function Records({ projectId, initialFields, initialRecords, project, subscriptionType, onSelectionChange }: RecordsProps) {
    const socketRef = useRef<Socket | null>(null);
    // Abort flag: set to true when a provider error is detected mid-backfill.
    // Prevents race condition where already-dispatched Celery tasks fire backfill_record_start
    // AFTER the error, putting cells back into __BACKFILLING__ and extending the spinners.
    const backfillAbortedRef = useRef(false);
    const { isOnline } = useSyncStatus();
    const [isConnected, setIsConnected] = useState(false);
    const [showConnecting, setShowConnecting] = useState(false);
    const [onlineRecords, setOnlineRecords] = useState<DocumentRecord[]>(initialRecords);
    const [offlineRecords, setOfflineRecords] = useState<DocumentRecord[]>([]);
    const [cachedRecords, setCachedRecords] = useState<DocumentRecord[]>([]);
    const [columns, setColumns] = useState<Field[]>(initialFields || [])
    const [isReorderPopupVisible, setIsReorderPopupVisible] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string | null>(null);
    const [backfillingFieldId, setBackfillingFieldId] = useState<string | null>(null);
    const [backfillingRecordId, setBackfillingRecordId] = useState<string | null>(null);
    const [isRecordBackfillModalOpen, setIsRecordBackfillModalOpen] = useState(false);
    const [selectedRecordForBackfill, setSelectedRecordForBackfill] = useState<{ id: string, filename: string } | null>(null);
    const [pendingAnalysis, setPendingAnalysis] = useState<{ recordId: string; fields: Field[] } | null>(null);

    const loadOfflineData = useCallback(async () => {
        try {
            // 1. Load the Offline Queue (files waiting to be uploaded)
            const offlineFilesRaw = await getOfflineFiles();
            const files: any[] = Array.isArray(offlineFilesRaw) ? offlineFilesRaw : [];
            const pending = files
                .filter(f => f.projectId === projectId)
                .map(f => ({
                    id: f.id,
                    filename: f.metadata?.originalName || 'pending',
                    original_filename: f.metadata?.originalName || 'pending',
                    file_key: '',
                    project_id: projectId,
                    answers: {
                        __status__: f.status === 'pending' ? 'queued' : f.status,
                        __error__: f.metadata?.error || (f.status === 'failed' ? 'Sync failed' : undefined)
                    },
                    pages: 0,
                    created_at: new Date(f.createdAt).toISOString(),
                    updated_at: new Date().toISOString(),
                } as any));
            setOfflineRecords(pending);

            // 2. Load the Cache (records already synced in the past)
            const { getCachedRecords } = await import('@/lib/db/indexedDB');
            const cached = await getCachedRecords(projectId);
            if (cached?.data) {
                setCachedRecords(cached.data);
                if (cached.fields) setColumns(cached.fields);
            }
        } catch (err) {
            console.error('[Records] Failed to load offline/cached data:', err);
        }
    }, [projectId]);

    const loadOnlineData = useCallback(async () => {
        try {
            const [latestRecords, latestColumns] = await Promise.all([
                getRecords(projectId),
                getColumns(projectId)
            ]);
            if (latestRecords && Array.isArray(latestRecords)) {

                // [SELF-HEALING] Cleanup stale offline files that are actually live and complete
                try {
                    const { getOfflineFiles, removeOfflineFile } = await import('@/lib/db/indexedDB');
                    const offlineFiles = await getOfflineFiles();
                    const projectOfflineFiles = offlineFiles.filter((f: any) => f.projectId === projectId);

                    let didCleanup = false;
                    for (const offlineFile of projectOfflineFiles) {
                        // Find matching record on server
                        const serverRec = latestRecords.find(r => r.original_filename === offlineFile.metadata?.originalName);

                        // If server has it AND server considers it done (no __status__), 
                        // then the local "pending/processing" file is stale.
                        if (serverRec && !serverRec.answers?.__status__) {
                            console.log('[Records] Self-healing: Removing stale offline file', offlineFile.metadata?.originalName);
                            await removeOfflineFile(offlineFile.id);
                            didCleanup = true;
                        }
                    }

                    if (didCleanup) {
                        // Refresh offline list so UI updates immediately
                        // We don't await this to keep the render fast, but we trigger it.
                        loadOfflineData();
                    }
                } catch (cleanupErr) {
                    console.warn('[Records] Self-healing failed:', cleanupErr);
                }

                setOnlineRecords(latestRecords);
                // Update Cache
                const { cacheRecords, syncRecordDeletions } = await import('@/lib/db/indexedDB');
                await cacheRecords(projectId, latestRecords, latestColumns);

                // Sync deletions: remove records that no longer exist on server
                const syncResult = await syncRecordDeletions(projectId, latestRecords);
                if (syncResult.removed > 0) {
                    console.log(`[Records] Cleaned ${syncResult.removed} deleted record(s) from cache`);
                }
            }
            if (latestColumns && Array.isArray(latestColumns)) setColumns(latestColumns);
        } catch (err) {
            console.warn('[Records] Failed to load online data:', err);
        }
    }, [projectId]);

    const handleDeleteRecord = useCallback(async (recordId: string) => {
        if (!isOnline) return; // Disable offline deletion

        // Optimistic UI update
        setOnlineRecords(prev => prev.filter(r => r.id !== recordId));
        setCachedRecords(prev => prev.filter(r => r.id !== recordId));

        try {
            const { removeRecordFromCache } = await import('@/lib/db/indexedDB');
            await removeRecordFromCache(projectId, recordId);
            await deleteRecord(recordId);
        } catch (err) {
            console.error('[Records] Delete failed:', err);
            loadOnlineData();
        }
    }, [isOnline, projectId, loadOnlineData]);

    const handleDeleteBatch = useCallback(async (ids: string[]) => {
        const idSet = new Set(ids);
        // 1. Optimistic UI update
        setOnlineRecords(prev => prev.filter(r => !idSet.has(r.id)));
        setOfflineRecords(prev => prev.filter(r => !idSet.has(r.id)));
        setCachedRecords(prev => prev.filter(r => !idSet.has(r.id)));

        try {
            const { removeRecordFromCache, queueDeletion, removeOfflineFile } = await import('@/lib/db/indexedDB');

            // 2. Update local cache and queue/perform deletions
            for (const id of ids) {
                await removeRecordFromCache(projectId, id);

                const isQueuedOffline = offlineRecords.some(r => r.id === id);
                if (isQueuedOffline) {
                    await removeOfflineFile(id);
                } else if (!isOnline) {
                    await queueDeletion(id, projectId);
                }
            }

            // 3. Perform online batch delete if online
            const onlineIds = ids.filter(id => !offlineRecords.some(r => r.id === id));
            if (isOnline && onlineIds.length > 0) {
                await deleteBatchRecords(onlineIds);
            }

            window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
        } catch (err) {
            console.error('[Records] Batch delete failed:', err);
            if (isOnline) {
                loadOnlineData();
            }
            loadOfflineData();
        }
    }, [offlineRecords, isOnline, projectId, loadOnlineData, loadOfflineData]);

    const handleUpdateRecord = useCallback(async (recordId: string, updatedRecord: any) => {
        if (!isOnline) return; // Disable offline update

        // Optimistic UI update
        const applyUpdate = (prev: any[]) => prev.map(r => r.id === recordId ? { ...r, ...updatedRecord } : r);
        setOnlineRecords(applyUpdate);
        setCachedRecords(applyUpdate);

        try {
            const { updateRecordInCache } = await import('@/lib/db/indexedDB');
            await updateRecordInCache(projectId, { id: recordId, ...updatedRecord });
            await updateRecord(recordId, updatedRecord);
        } catch (err) {
            console.error('[Records] Update record failed:', err);
            loadOnlineData();
        }
    }, [projectId, isOnline, loadOnlineData]);

    const handleUpdateColumn = useCallback(async (columnId: string, name: string) => {
        if (!isOnline) return; // Disable offline column update

        setColumns(prev => prev.map(c => c.hidden_id === columnId ? { ...c, name } : c));

        try {
            await updateColumn(columnId, projectId, { name });
            loadOnlineData(); // Ensure cache is in sync
        } catch (err) {
            console.error('[Records] Update column failed:', err);
            loadOnlineData();
        }
    }, [projectId, isOnline, loadOnlineData]);

    const handleDeleteColumn = useCallback(async (columnId: string) => {
        if (!isOnline) return; // Disable offline column deletion

        setColumns(prev => prev.filter(c => c.hidden_id !== columnId));

        try {
            const { removeColumnFromCache } = await import('@/lib/db/indexedDB');
            await removeColumnFromCache(projectId, columnId);
            await deleteColumn(columnId, projectId);
        } catch (err) {
            console.error('[Records] Delete column failed:', err);
            loadOnlineData();
        }
    }, [projectId, isOnline, loadOnlineData]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isOnline && !isConnected) {
            timer = setTimeout(() => {
                setShowConnecting(true);
            }, 2000);
        } else {
            setShowConnecting(false);
        }
        return () => clearTimeout(timer);
    }, [isOnline, isConnected]);

    useEffect(() => {
        loadOnlineData();
        loadOfflineData();
        const handleOfflineFilesUpdate = () => loadOfflineData();
        window.addEventListener('daxno:offline-files-updated', handleOfflineFilesUpdate);
        return () => window.removeEventListener('daxno:offline-files-updated', handleOfflineFilesUpdate);
    }, [loadOnlineData, loadOfflineData]);

    // Show the recommendation banner on mount if a record is already in awaiting_analysis
    // state (e.g. after a page refresh that happened while the backend was recommending columns).
    useEffect(() => {
        const awaitingRecord = initialRecords.find(
            (r) => r.answers?.__status__ === 'awaiting_analysis'
        );
        if (awaitingRecord && initialFields.length > 0) {
            setPendingAnalysis({ recordId: awaitingRecord.id, fields: initialFields });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run once on mount only

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
                path: '/ws/records/sockets',
                auth: { projectId },
                transports: ['websocket', 'polling'],
                reconnection: true,
                withCredentials: true
            });
        }
        const socket = socketRef.current;
        const handleConnect = async () => {
            setIsConnected(true);
            try {
                // [UX FIX] Only perform a full refresh if we don't have records in state.
                // This prevents "blowing away" live backfill progress during a brief reconnect.
                if (onlineRecords.length === 0) {
                    const [latestRecords, latestColumns] = await Promise.all([getRecords(projectId), getColumns(projectId)]);
                    if (latestRecords) {
                        setOnlineRecords(latestRecords);
                        cacheRecords(projectId, latestRecords, latestColumns || columns);
                    }
                    if (latestColumns) setColumns(latestColumns);
                }
            } catch (err) { }
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleRecordCreated = (data: any) => {
            setOnlineRecords(prev => {
                const updated = [...prev, data.record];
                cacheRecords(projectId, updated, data.fields || columns);
                return updated;
            });
            if (Array.isArray(data.fields)) setColumns(data.fields);
            // [FIX] Do NOT clear processingStatus here — the record may still be processing.
            // The banner will be cleared by record_updated when __status__ is removed.
            loadOfflineData();
        };
        const handleRecordUpdated = (data: any) => {
            // If the backend moved this record to awaiting_analysis, surface the banner
            if (data.record?.answers?.__status__ === 'awaiting_analysis' && Array.isArray(data.fields) && data.fields.length > 0) {
                setPendingAnalysis(prev => prev ?? { recordId: data.record.id, fields: data.fields });
            }
            setOnlineRecords(prev => {
                const updated = prev.map(x => {
                    if (x.id !== data.record.id) return x;

                    // Smart merge: never overwrite a cell that already has real text
                    // with an empty/null value from an error or partial update.
                    // This protects existing good column data from being wiped when
                    // a backfill fails for one column while others already have values.
                    const incomingAnswers: Record<string, any> = data.record.answers || {};
                    const existingAnswers: Record<string, any> = x.answers || {};
                    const mergedAnswers: Record<string, any> = { ...incomingAnswers };

                    for (const key in existingAnswers) {
                        const existingVal = existingAnswers[key];
                        const incomingVal = incomingAnswers[key];
                        // If existing cell has real text and incoming is empty/null, keep existing.
                        // Exception: if the incoming value has __backfill_error__ tag, accept it
                        // (the backend explicitly marked it as the failed field).
                        const existingHasText = existingVal?.text && existingVal.text !== '__BACKFILLING__' && existingVal.text !== 'Not Found';
                        const incomingIsEmpty = !incomingVal?.text || incomingVal.text === '';
                        const incomingIsBackfillError = incomingVal?.__backfill_error__;
                        if (existingHasText && incomingIsEmpty && !incomingIsBackfillError) {
                            mergedAnswers[key] = existingVal;
                        }
                    }

                    // Preserve _isRowBackfilling state only if the record is still being processed
                    return {
                        ...data.record,
                        answers: mergedAnswers,
                        _isRowBackfilling: false,
                    };
                });
                updateRecordInCache(projectId, data.record);
                return updated;
            });
            if (Array.isArray(data.fields)) setColumns(data.fields);
        };
        const handleRecordDeleted = (data: any) => {
            setOnlineRecords(prev => {
                const updated = prev.filter(x => x.id !== data.id);
                removeRecordFromCache(projectId, data.id);
                return updated;
            });
            if (Array.isArray(data.fields)) setColumns(data.fields);
        };
        const handleColumnCreated = (data: { records: DocumentRecord[]; field: Field }) => {
            setOnlineRecords(data.records);
            setColumns(prev => Array.isArray(prev) ? [...prev, data.field] : [data.field]);
        };
        const handleColumnsRecommended = (data: { record_id: string; fields: Field[] }) => {
            setProcessingStatus(null); // Clear OCR/analysis banner — recommendation banner takes over
            setPendingAnalysis({ recordId: data.record_id, fields: data.fields });
        };
        const handleColumnUpdated = (data: { field: Field }) => {
            setColumns(prev => Array.isArray(prev) ? prev.map(x => x.hidden_id === data.field.hidden_id ? data.field : x) : []);
        };
        const handleColumnDeleted = (data: { field_id: string }) => {
            setColumns(prev => Array.isArray(prev) ? prev.filter(x => x.hidden_id !== data.field_id) : []);
        };
        const handleOcrStart = () => setProcessingStatus('Starting OCR...');
        const handleOcrProgress = (data: any) => {
            const progress = data.total > 0 ? Math.round((data.current / data.total) * 100) : 0;
            setProcessingStatus(`OCR: Processing page ${data.current} of ${data.total} (${progress}%)`);
        };
        const handleAiStart = () => {
            // [UX] SILENCE the generic "AI Analyzing" blue banner if any backfill is active.
            // We only show it for single-file uploads that aren't part of a backfill.
            setBackfillingFieldId(fieldId => {
                setBackfillingRecordId(recordId => {
                    if (!fieldId && !recordId) {
                        setProcessingStatus('AI Analyzing document...');
                    }
                    return recordId;
                });
                return fieldId;
            });
        };
        const handleBackfillComplete = (data: any) => {
            console.log('[BACKFILL] Received backfill_complete (Cleanup):', data.field_id);
            // This is now purely secondary as we rely on record_updated
            if (data.records) {
                setOnlineRecords(data.records);
                cacheRecords(projectId, data.records, data.fields || columns);
            }
            if (data.fields && Array.isArray(data.fields)) setColumns(data.fields);
        };
        const handleRecordBackfillStart = (data: { record_id: string }) => {
            console.log('[BACKFILL] Single record re-analysis started:', data.record_id);
            setBackfillingRecordId(data.record_id);
            // We update the row answers to show the analyzing state in all cells
            setOnlineRecords(prev => prev.map(rec => {
                if (rec.id === data.record_id) {
                    const updatedAnswers = { ...rec.answers };
                    // Set all visible fields temporarily to backfilling state
                    // The Cells will handle this via isRowBackfilling prop or the magic string
                    // For logic simplicity, let's just mark the record as being backfilled
                    return { ...rec, _isRowBackfilling: true };
                }
                return rec;
            }));
        };
        const handleRecordBackfillComplete = (data: { record: DocumentRecord, fields: Field[] }) => {
            console.log('[BACKFILL] Single record re-analysis complete:', data.record.id);

            setOnlineRecords(prevRecords => {
                const updated = prevRecords.map(rec => {
                    if (rec.id === data.record.id) {
                        return { ...data.record, _isRowBackfilling: false };
                    }
                    return rec;
                });
                updateRecordInCache(projectId, data.record);
                return updated;
            });

            if (data.fields && Array.isArray(data.fields)) {
                setColumns(data.fields);
            }
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('record_created', handleRecordCreated);
        socket.on('record_updated', handleRecordUpdated);
        socket.on('record_deleted', handleRecordDeleted);
        socket.on('field_created', handleColumnCreated);
        socket.on('field_updated', handleColumnUpdated);
        socket.on('field_deleted', handleColumnDeleted);
        socket.on('columns_recommended', handleColumnsRecommended);
        socket.on('ocr_start', handleOcrStart);
        socket.on('ocr_progress', handleOcrProgress);
        socket.on('ai_start', handleAiStart);
        socket.on('backfill_column_start', (data: { field_id: string, field_name: string }) => {
            console.log('[BACKFILL] Column re-analysis started:', data.field_id);
            setBackfillingFieldId(data.field_id);
            if (data.field_name) {
                setProcessingStatus(`Smart Backfill: Initializing '${data.field_name}'...`);
            }

            // Reset abort flag — this is the start of a fresh column backfill.
            backfillAbortedRef.current = false;

            // Instantly apply __BACKFILLING__ placeholder; save original so it can be
            // restored if the backfill fails (the popup already communicates the error).
            setOnlineRecords(prev => prev.map(rec => {
                const original = rec.answers?.[data.field_id] ?? null;
                return {
                    ...rec,
                    answers: {
                        ...rec.answers,
                        [data.field_id]: { text: '__BACKFILLING__', page: 0, __original__: original }
                    }
                };
            }));
        });
        socket.on('backfill_status', (data: { message: string }) => {
            setProcessingStatus(data.message);
        });
        socket.on('backfill_complete', handleBackfillComplete);
        socket.on('backfill_record_all_fields_start', handleRecordBackfillStart);
        socket.on('backfill_record_all_fields_complete', handleRecordBackfillComplete);

        socket.on('backfill_record_start', (data: { record_id: string, field_id: string }) => {
            console.log('[BACKFILL] Record processing started:', data.record_id);
            // We do NOT set backfillingFieldId here because that's for COLUMN-wide highlights.
            // Instead, we just mark the specific record/cell.

            // If a provider error already aborted this backfill run, ignore subsequent
            // task starts from in-flight Celery workers — they'll fail too and we've
            // already cleared the UI.
            if (backfillAbortedRef.current) return;

            setOnlineRecords(prev => prev.map(rec => {
                if (rec.id === data.record_id) {
                    const original = rec.answers?.[data.field_id] ?? null;
                    return {
                        ...rec,
                        answers: {
                            ...rec.answers,
                            [data.field_id]: { text: '__BACKFILLING__', page: 0, __original__: original }
                        }
                    };
                }
                return rec;
            }));
        });

        socket.on('processing_error', (data: {
            message: string;
            error_code?: string;
            record_id?: string;
            project_id?: string
        }) => {
            console.warn('[SOCKET] Processing error received:', data);

            // Use typed error_code, but fall back to message when code is the generic 'PROCESSING_FAILED'
            const errorCode = (data.error_code && data.error_code !== 'PROCESSING_FAILED')
                ? data.error_code
                : (data.message || '');

            // Detect provider/rate-limit errors — these affect ALL records sharing the same model.
            // When one hits, the whole column backfill is dead; clear every spinning cell at once.
            const isProviderError = errorCode.toLowerCase().includes('rate limit')
                || errorCode.toLowerCase().includes('provider')
                || errorCode.toLowerCase().includes('credits')
                || errorCode === 'PROVIDER_RATE_LIMIT_EXHAUSTED';

            window.dispatchEvent(new CustomEvent('daxno:usage-limit-reached', {
                detail: { error: errorCode, subscriptionType: subscriptionType || 'standard' }
            }));

            if (isProviderError) {
                // Mark the backfill as aborted so any in-flight Celery tasks that
                // fire backfill_record_start afterwards are ignored by the UI.
                backfillAbortedRef.current = true;
                // Provider is exhausted — stop ALL backfilling state immediately so the UI
                // doesn't keep spinning for records that will never complete.
                setBackfillingFieldId(null);
                setProcessingStatus(null);
                setOnlineRecords(prev => prev.map(rec => {
                    const newAnswers = { ...rec.answers };
                    let changed = false;
                    for (const key in newAnswers) {
                        if (newAnswers[key]?.text === '__BACKFILLING__') {
                            newAnswers[key] = newAnswers[key].__original__ ?? null;
                            changed = true;
                        }
                    }
                    return changed
                        ? { ...rec, _isRowBackfilling: false, answers: newAnswers }
                        : rec.id === data.record_id ? { ...rec, _isRowBackfilling: false } : rec;
                }));
            } else {
                // Non-provider error (e.g. missing OCR cache) — clear just this record.
                if (!data.record_id) {
                    setBackfillingFieldId(null);
                    setProcessingStatus(null);
                }
                setOnlineRecords(prev => prev.map(rec => {
                    if (rec.id === data.record_id) {
                        const newAnswers = { ...rec.answers };
                        for (const key in newAnswers) {
                            if (newAnswers[key]?.text === '__BACKFILLING__') {
                                newAnswers[key] = newAnswers[key].__original__ ?? null;
                            }
                        }
                        return { ...rec, _isRowBackfilling: false, answers: newAnswers };
                    }
                    return rec;
                }));
            }
        });

        socket.on('backfill_record_complete', (data: { record_id: string, field_id: string, answer: any }) => {
            console.log('[BACKFILL] Record processing complete:', data.record_id);
            setOnlineRecords(prev => prev.map(rec => {
                if (rec.id === data.record_id) {
                    return {
                        ...rec,
                        answers: {
                            ...rec.answers,
                            [data.field_id]: data.answer
                        }
                    };
                }
                return rec;
            }));

            // PERSIST TO INDEXEDDB: Keep the local device storage in sync with live extraction
            updateRecordAnswerInCache(projectId, data.record_id, data.field_id, data.answer);
        });


        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('record_created', handleRecordCreated);
            socket.off('record_updated', handleRecordUpdated);
            socket.off('record_deleted', handleRecordDeleted);
            socket.off('field_created', handleColumnCreated);
            socket.off('field_updated', handleColumnUpdated);
            socket.off('field_deleted', handleColumnDeleted);
            socket.off('columns_recommended', handleColumnsRecommended);
            socket.off('ocr_start', handleOcrStart);
            socket.off('ocr_progress', handleOcrProgress);
            socket.off('ai_start', handleAiStart);
            socket.off('backfill_complete', handleBackfillComplete);
            socket.off('backfill_column_start');
            socket.off('backfill_record_all_fields_start', handleRecordBackfillStart);
            socket.off('backfill_record_all_fields_complete', handleRecordBackfillComplete);
            socket.off('processing_error'); // Remove error listeners
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId, loadOfflineData, loadOnlineData]);

    const rowData = useMemo(() => {
        // Priority Merge Hierarchy:
        // 1. Offline Queue (The most recent actions)
        // 2. Online Live (Fresh server data)
        // 3. Cache (Older synced data for offline persistence)

        const offlineFilenames = new Set(offlineRecords.map(r => r.original_filename));
        const onlineFilenames = new Set(onlineRecords.map(r => r.original_filename));

        // Use live records if online, otherwise use cache
        const baseSyncedRecords = onlineRecords.length > 0 ? onlineRecords : cachedRecords;

        // Filter out any synced records that are currently in the offline queue (re-uploading/editing)
        const uniqueSynced = baseSyncedRecords.filter(r => !offlineFilenames.has(r.original_filename));

        return [...offlineRecords, ...uniqueSynced].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [onlineRecords, offlineRecords, cachedRecords]);

    // [DISPLAY ONLY] Count of rows currently processing
    const processingCount = useMemo(() => {
        // Flow 1 (no columns yet): suppress the blue processing banner entirely.
        // The recommendation banner takes over once OCR + column suggestion finishes.
        if (columns.length === 0) return 0;
        return rowData.filter(r => {
            if (r.answers?.__status__ === 'processing' || (r as any)._isRowBackfilling) return true;
            if (r.answers) {
                for (const key in r.answers) {
                    if (r.answers[key]?.text === '__BACKFILLING__') return true;
                }
            }
            return false;
        }).length;
    }, [rowData, columns]);

    // [SCALABILITY] Auto-clear processing banners when no items are outstanding.
    // A 1500ms debounce prevents a brief 0-count flash (due to socket event ordering)
    // from clearing the banner prematurely while the task is still running.
    useEffect(() => {
        if (processingCount === 0) {
            const timer = setTimeout(() => {
                setBackfillingFieldId(null);
                setBackfillingRecordId(null);
                setProcessingStatus(null);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [processingCount]);

    return (
        <SmartAuthGuard>
            <div className="flex flex-col h-full relative">
                <SyncBanner />
                <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2" data-testid="connection-status">
                            {!isOnline ? (
                                <div className="flex items-center gap-1.6" data-testid="status-offline">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Offline</span>
                                </div>
                            ) : isConnected ? (
                                <div className="flex items-center gap-1.6" data-testid="status-online">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Live</span>
                                </div>
                            ) : showConnecting ? (
                                <div className="flex items-center gap-1.6 animate-pulse" data-testid="status-connecting">
                                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                    <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Connecting</span>
                                </div>
                            ) : null}
                        </div>
                        {columns?.length >= 2 && (
                            <button
                                onClick={() => setIsReorderPopupVisible(true)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
                            >
                                Reorder Columns
                            </button>
                        )}
                    </div>
                    {(processingStatus || processingCount > 0) && (
                        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl transition-all duration-300" data-testid="global-processing-banner">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm font-semibold text-blue-900" data-testid="processing-status-text">
                                            {processingStatus || `Processing ${processingCount} document${processingCount > 1 ? 's' : ''}...`}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                        Running
                                    </div>
                                </div>
                                <div className="w-full bg-blue-200/50 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-full transition-all duration-500 ease-out animate-shimmer"
                                        data-testid="processing-progress-bar"
                                        style={{
                                            width: processingStatus?.includes('%')
                                                ? `${processingStatus.match(/\d+/g)?.pop()}%`
                                                : '100%',
                                            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                                            backgroundSize: '200% 100%'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {pendingAnalysis && (
                    <ColumnRecommendationBanner
                        projectId={projectId}
                        recordId={pendingAnalysis.recordId}
                        initialFields={pendingAnalysis.fields}
                        onClose={() => setPendingAnalysis(null)}
                    />
                )}
                <div className="flex-1 min-h-0">
                    <SpreadSheet
                        isOnline={isOnline}
                        records={rowData}
                        columns={columns}
                        projectId={projectId}
                        project={project}
                        onDeleteRecord={handleDeleteRecord}
                        onDeleteBatch={handleDeleteBatch}
                        onUpdateRecord={handleUpdateRecord}
                        onUpdateColumn={handleUpdateColumn}
                        onDeleteColumn={handleDeleteColumn}
                        onSelectionChange={onSelectionChange}
                        backfillingFieldId={backfillingFieldId}
                        backfillingRecordId={backfillingRecordId}
                        onBackfillRecord={(id: string, filename: string) => {
                            setSelectedRecordForBackfill({ id, filename });
                            setIsRecordBackfillModalOpen(true);
                        }}
                    />
                </div>
                <ColumnReorderPopup
                    columns={columns}
                    isOpen={isReorderPopupVisible}
                    onClose={() => setIsReorderPopupVisible(false)}
                    onReorder={setColumns}
                />
                <BackfillRecordModal
                    isOpen={isRecordBackfillModalOpen}
                    onClose={() => setIsRecordBackfillModalOpen(false)}
                    projectId={projectId}
                    recordId={selectedRecordForBackfill?.id || null}
                    filename={selectedRecordForBackfill?.filename || null}
                    onStart={(id: string) => {
                        setBackfillingRecordId(id);
                        setOnlineRecords(prev => prev.map(rec => {
                            if (rec.id === id) {
                                return { ...rec, _isRowBackfilling: true };
                            }
                            return rec;
                        }));
                    }}
                />
            </div>
        </SmartAuthGuard>
    );
}