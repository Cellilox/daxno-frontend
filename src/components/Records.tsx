'use client';

import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SpreadSheet from './spreadsheet/SpreadSheet';
import SyncBanner from './SyncBanner';
import { Field, DocumentRecord } from './spreadsheet/types';
import ColumnReorderPopup from './forms/ColumnReorderPopup';
import { getOfflineFiles, removeOfflineFile } from '@/lib/db/indexedDB';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { deleteBatchRecords, deleteRecord, getRecords } from '@/actions/record-actions';
import { getColumns } from '@/actions/column-actions';

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
    const [onlineRecords, setOnlineRecords] = useState<DocumentRecord[]>(initialRecords);
    const [offlineRecords, setOfflineRecords] = useState<DocumentRecord[]>([]);
    const [columns, setColumns] = useState<Field[]>(initialFields || [])
    const [isReorderPopupVisible, setIsReorderPopupVisible] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string | null>(null);

    const loadOfflineData = useCallback(async () => {
        try {
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
        } catch (err) {
            console.error('[Records] Failed to load offline data:', err);
        }
    }, [projectId]);

    const loadOnlineData = useCallback(async () => {
        try {
            const [latestRecords, latestColumns] = await Promise.all([
                getRecords(projectId),
                getColumns(projectId)
            ]);
            if (latestRecords && Array.isArray(latestRecords)) setOnlineRecords(latestRecords);
            if (latestColumns && Array.isArray(latestColumns)) setColumns(latestColumns);
        } catch (err) {
            console.warn('[Records] Failed to load online data:', err);
        }
    }, [projectId]);

    const handleDeleteRecord = useCallback(async (recordId: string) => {
        setOnlineRecords(prev => prev.filter(r => r.id !== recordId));
        setOfflineRecords(prev => prev.filter(r => r.id !== recordId));
        try {
            const isOffline = offlineRecords.some(r => r.id === recordId);
            if (isOffline) {
                await removeOfflineFile(recordId);
                window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
            } else {
                await deleteRecord(recordId);
            }
        } catch (err) {
            console.error('[Records] Delete failed:', err);
            loadOnlineData();
            loadOfflineData();
        }
    }, [offlineRecords, loadOnlineData, loadOfflineData]);

    const handleDeleteBatch = useCallback(async (ids: string[]) => {
        const idSet = new Set(ids);
        setOnlineRecords(prev => prev.filter(r => !idSet.has(r.id)));
        setOfflineRecords(prev => prev.filter(r => !idSet.has(r.id)));
        try {
            const offlineIds = ids.filter(id => offlineRecords.some(r => r.id === id));
            const onlineIds = ids.filter(id => !offlineIds.includes(id));
            await Promise.all([
                ...offlineIds.map(id => removeOfflineFile(id)),
                onlineIds.length > 0 ? deleteBatchRecords(onlineIds) : Promise.resolve()
            ]);
            if (offlineIds.length > 0) window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
        } catch (err) {
            console.error('[Records] Batch delete failed:', err);
            loadOnlineData();
            loadOfflineData();
        }
    }, [offlineRecords, loadOnlineData, loadOfflineData]);

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
            setOnlineRecords(data.records);
            setColumns(data.fields);
            setProcessingStatus(null);
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
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId, loadOfflineData, loadOnlineData]);

    const rowData = useMemo(() => {
        const onlineFilenames = new Set(onlineRecords.map(r => r.original_filename));
        const uniqueOfflineRecords = offlineRecords.filter(off => !onlineFilenames.has(off.original_filename));
        return [...uniqueOfflineRecords, ...onlineRecords].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [onlineRecords, offlineRecords]);

    const processingCount = useMemo(() =>
        rowData.filter(r => r.answers?.__status__ === 'processing').length
        , [rowData]);

    useEffect(() => {
        if (processingCount === 0 && processingStatus) setProcessingStatus(null);
    }, [processingCount, processingStatus]);

    return (
        <div className="flex flex-col h-full relative">
            <SyncBanner />
            <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {!isOnline ? (
                            <div className="flex items-center gap-1.6">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Offline</span>
                            </div>
                        ) : isConnected ? (
                            <div className="flex items-center gap-1.6">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Live</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.6 animate-pulse">
                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                <span className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Connecting</span>
                            </div>
                        )}
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
                    <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl transition-all duration-300">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-semibold text-blue-900">
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
                    records={rowData}
                    columns={columns}
                    projectId={projectId}
                    project={project}
                    onDeleteRecord={handleDeleteRecord}
                    onDeleteBatch={handleDeleteBatch}
                />
            </div>
            <ColumnReorderPopup
                columns={columns}
                isOpen={isReorderPopupVisible}
                onClose={() => setIsReorderPopupVisible(false)}
                onReorder={setColumns}
            />
        </div>
    );
}