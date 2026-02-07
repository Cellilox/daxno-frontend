'use client';

import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SpreadSheet from './spreadsheet/SpreadSheet';
import SyncBanner from './SyncBanner';
import { Field, DocumentRecord } from './spreadsheet/types';
import ColumnReorderPopup from './forms/ColumnReorderPopup';
import BackfillRecordModal from './forms/BackfillRecordModal';
import { getOfflineFiles, removeOfflineFile } from '@/lib/db/indexedDB';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { deleteBatchRecords, deleteRecord, getRecords, updateRecord } from '@/actions/record-actions';
import { deleteColumn, getColumns, updateColumn } from '@/actions/column-actions';
import SmartAuthGuard from '@/components/auth/SmartAuthGuard';

type RecordsProps = {
    projectId: string;
    initialFields: Field[];
    initialRecords: DocumentRecord[];
    project: any;
};

export default function Records({ projectId, initialFields, initialRecords, project }: RecordsProps) {
    const socketRef = useRef<Socket | null>(null);
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
                const [latestRecords, latestColumns] = await Promise.all([getRecords(projectId), getColumns(projectId)]);
                if (latestRecords) setOnlineRecords(latestRecords);
                if (latestColumns) setColumns(latestColumns);
            } catch (err) { }
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleRecordCreated = (data: any) => {
            setOnlineRecords(prev => [...prev, data.record]);
            setColumns(data.fields);
            if (data.record.answers?.__status__ !== 'processing') setProcessingStatus(null);
            loadOfflineData();
        };
        const handleRecordUpdated = (data: any) => {
            setOnlineRecords(prev => prev.map(x => x.id === data.record.id ? data.record : x));
            setColumns(data.fields);
        };
        const handleRecordDeleted = (data: any) => {
            setOnlineRecords(prev => prev.filter(x => x.id !== data.id));
            setColumns(data.fields);
        };
        const handleColumnCreated = (data: { records: DocumentRecord[]; field: Field }) => {
            setOnlineRecords(data.records);
            setColumns(prev => [...prev, data.field]);
        };
        const handleColumnUpdated = (data: { field: Field }) => {
            setColumns(prev => prev.map(x => x.hidden_id === data.field.hidden_id ? data.field : x));
        };
        const handleColumnDeleted = (data: { field_id: string }) => {
            setColumns(prev => prev.filter(x => x.hidden_id !== data.field_id));
        };
        const handleOcrStart = () => setProcessingStatus('Starting OCR...');
        const handleOcrProgress = (data: any) => {
            const progress = data.total > 0 ? Math.round((data.current / data.total) * 100) : 0;
            setProcessingStatus(`OCR: Processing page ${data.current} of ${data.total} (${progress}%)`);
        };
        const handleAiStart = () => setProcessingStatus('AI Analyzing document...');
        const handleBackfillComplete = (data: any) => {
            console.log('[BACKFILL] Sync complete:', data.field_id);
            if (data.records) setOnlineRecords(data.records);
            if (data.fields) setColumns(data.fields);
            setBackfillingFieldId(null);
            setProcessingStatus(null);
            loadOnlineData(); // Final refresh
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
            setOnlineRecords(prev => prev.map(rec => {
                if (rec.id === data.record.id) {
                    // Update data and clear the manual backfill indicator
                    return { ...data.record, _isRowBackfilling: false };
                }
                return rec;
            }));
            setColumns(data.fields);
            setBackfillingRecordId(null);
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('record_created', handleRecordCreated);
        socket.on('record_updated', handleRecordUpdated);
        socket.on('record_deleted', handleRecordDeleted);
        socket.on('field_created', handleColumnCreated);
        socket.on('field_updated', handleColumnUpdated);
        socket.on('field_deleted', handleColumnDeleted);
        socket.on('ocr_start', handleOcrStart);
        socket.on('ocr_progress', handleOcrProgress);
        socket.on('ai_start', handleAiStart);
        socket.on('backfill_complete', handleBackfillComplete);
        socket.on('backfill_record_all_fields_start', handleRecordBackfillStart);
        socket.on('backfill_record_all_fields_complete', handleRecordBackfillComplete);

        socket.on('backfill_record_start', (data: { record_id: string, field_id: string }) => {
            console.log('[BACKFILL] Record processing started:', data.record_id);
            setBackfillingFieldId(data.field_id);
            setOnlineRecords(prev => prev.map(rec => {
                if (rec.id === data.record_id) {
                    return {
                        ...rec,
                        answers: {
                            ...rec.answers,
                            [data.field_id]: { text: '__BACKFILLING__', page: 0 }
                        }
                    };
                }
                return rec;
            }));
        });

        // ERROR HANDLER: Catch 402/Quota errors to show Global Popup
        socket.on('processing_error', (data: { message: string, record_id?: string }) => {
            // Robust check for exhaustion keywords (recursive/stringified)
            const rawMsg = JSON.stringify(data);
            if (rawMsg.includes('AI_CREDITS_EXHAUSTED') || rawMsg.includes('402')) {
                // Dispatch event expected by GlobalUsageLimitHandler
                const event = new CustomEvent('daxno:usage-limit-reached', {
                    detail: { error: 'AI_CREDITS_EXHAUSTED' }
                });
                window.dispatchEvent(event);
            }

            // Always clear "Analyzing..." state on error so row isn't stuck
            // This handles both optimistic state and server-sent state
            setBackfillingFieldId(null);
            setBackfillingRecordId(null);
            setOnlineRecords(prev => prev.map(rec => {
                if (rec._isRowBackfilling || rec.id === data.record_id) {
                    return { ...rec, _isRowBackfilling: false };
                }
                return rec;
            }));
            setProcessingStatus(null);
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
            socket.off('ocr_start', handleOcrStart);
            socket.off('ocr_progress', handleOcrProgress);
            socket.off('ai_start', handleAiStart);
            socket.off('backfill_complete', handleBackfillComplete);
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

    const processingCount = useMemo(() =>
        rowData.filter(r => r.answers?.__status__ === 'processing').length
        , [rowData]);

    useEffect(() => {
        if (processingCount === 0 && processingStatus) setProcessingStatus(null);
    }, [processingCount, processingStatus]);

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
                        {columns.length >= 2 && (
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