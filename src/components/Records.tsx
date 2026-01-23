'use client';
import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import SpreadSheet from './spreadsheet/SpreadSheet';
import { Field, DocumentRecord } from './spreadsheet/types';
import ColumnReorderPopup from './forms/ColumnReorderPopup';
import { getRecords } from '@/actions/record-actions';
import { getColumns } from '@/actions/column-actions';
import { getOfflineFiles } from '@/lib/db/indexedDB';
import { useCallback } from 'react';


type RecordsProps = {
    projectId: string;
    initialFields: Field[];
    initialRecords: DocumentRecord[];
    project: any;
};

export default function Records({ projectId, initialFields, initialRecords, project }: RecordsProps) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [rowData, setRowData] = useState<DocumentRecord[]>(initialRecords)
    const [columns, setColumns] = useState<Field[]>(initialFields || [])
    const [isReorderPopupVisible, setIsReorderPopupVisible] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            console.log('[Records] loadData triggered');

            const [latestOnlineRecords, latestOnlineColumns, offlineFilesRaw] = await Promise.all([
                getRecords(projectId),
                getColumns(projectId),
                getOfflineFiles()
            ]);

            console.log('[Records] Fetched data:', {
                onlineRecords: Array.isArray(latestOnlineRecords) ? latestOnlineRecords.length : 'not array',
                onlineColumns: Array.isArray(latestOnlineColumns) ? latestOnlineColumns.length : 'not array',
                offlineFiles: Array.isArray(offlineFilesRaw) ? offlineFilesRaw.length : 'not array'
            });

            const offlineFiles: any[] = Array.isArray(offlineFilesRaw) ? offlineFilesRaw : [];

            // Merge offline files into records
            setRowData(prevRowData => {
                const baseOnlineRecords: DocumentRecord[] = Array.isArray(latestOnlineRecords) ? latestOnlineRecords : prevRowData.filter(r => !r.answers?.__status__ || !['queued', 'syncing', 'failed'].includes(r.answers.__status__));

                // Deduplicate: If an offline file matches an online record's filename, skip it
                const onlineFilenames = new Set(baseOnlineRecords.map(r => r.original_filename));

                const pendingRecords: DocumentRecord[] = offlineFiles
                    .filter(f => f.projectId === projectId && !onlineFilenames.has(f.metadata?.originalName))
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

                if (pendingRecords.length > 0) {
                    console.log(`[Records] Merging ${pendingRecords.length} offline files into UI`, pendingRecords);
                }

                const merged = [...baseOnlineRecords, ...pendingRecords];
                console.log('[Records] Final merged records count:', merged.length);
                return merged;
            });

            // Update columns if available
            if (Array.isArray(latestOnlineColumns)) {
                setColumns(latestOnlineColumns);
            }
        } catch (err) {
            console.error('[Records] Failed to load data:', err);
        }
    }, [projectId]);

    // Load data on mount and when offline files change
    useEffect(() => {
        loadData();

        const handleOfflineFilesUpdate = () => {
            console.log('[Records] Offline files updated event received');
            loadData();
        };

        window.addEventListener('daxno:offline-files-updated', handleOfflineFilesUpdate);

        return () => {
            window.removeEventListener('daxno:offline-files-updated', handleOfflineFilesUpdate);
        };
    }, [loadData]);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
                path: '/ws/records/sockets',
                auth: { projectId },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                withCredentials: true
            });
        }
        const socket = socketRef.current;
        socket.on('connect', () => {
            console.log(`Joined room: ${projectId}`);
        });

        const handleConnect = async () => {
            setIsConnected(true);
            console.log('Connected to WebSocket');
            console.log(`Socket ID: ${socket.id}`);

            // Re-sync on reconnection to handle missed events
            try {
                console.log('[DEBUG] Reconnected. Re-syncing records and columns...');
                const [latestRecords, latestColumns] = await Promise.all([
                    getRecords(projectId),
                    getColumns(projectId)
                ]);

                if (latestRecords) {
                    setRowData(latestRecords);
                    // Check if anything is still processing in the latest batch
                    const isProcessing = latestRecords.some((r: any) => r.answers?.__status__ === 'processing');
                    if (!isProcessing) {
                        setProcessingStatus(null);
                    }
                }
                if (latestColumns) {
                    setColumns(latestColumns);
                }
            } catch (err) {
                console.error('Failed to re-sync on reconnect:', err);
            }
        };

        const handleDisconnect = () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket');
        };

        const handleError = (error: Error) => {
            console.error('WebSocket error:', error);
        };

        const handleTimeout = () => {
            console.warn('WebSocket connection timeout');
        };

        const handleRecordCreated = (data: { record: DocumentRecord; fields: Field[] }) => {
            setRowData(prev => [...prev, data.record]);
            setColumns(data.fields);
            // Only clear status if it wasn't a "processing" record being created
            if (data.record.answers?.__status__ !== 'processing') {
                setProcessingStatus(null);
            }
        };

        const handleRecordUpdated = (data: { record: DocumentRecord; fields: Field[] }) => {
            setRowData(prev => prev.map(x => x.id === data.record.id ? data.record : x));
            setColumns(data.fields);
        };

        const handleRecordDeleted = (data: { id: string; fields: Field[] }) => {
            setRowData(prev => prev.filter(x => x.id !== data.id));
            setColumns(data.fields);
        };

        const handleColumnCreated = (data: { records: DocumentRecord[]; field: Field }) => {
            setRowData(data.records);
            setColumns(prev => [...prev, data.field]);
        };
        const handleColumnUpdated = (data: { field: Field }) => {
            setColumns(prev => prev.map(x => x.hidden_id === data.field.hidden_id ? data.field : x));
        };

        const handleColumnDeleted = (data: { field_id: string }) => {
            setColumns(prev => prev.filter(x => x.hidden_id !== data.field_id));
        };

        const handleOcrStart = (data: { status: string }) => {
            setProcessingStatus('Starting OCR...');
        };

        const handleOcrProgress = (data: { current: number; total: number }) => {
            // Calculate percentage if available
            const progress = data.total > 0 ? Math.round((data.current / data.total) * 100) : 0;
            setProcessingStatus(`OCR: Processing page ${data.current} of ${data.total} (${progress}%)`);
        };

        const handleAiStart = (data: { status: string }) => {
            setProcessingStatus('AI Analyzing document...');
        };

        const handleBackfillComplete = (data: { records: DocumentRecord[]; fields: Field[]; stats: any }) => {
            setRowData(data.records);
            setColumns(data.fields);
            setProcessingStatus(null);
        };

        // Add listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleError);
        socket.on('connect_timeout', handleTimeout);
        socket.on('record_created', handleRecordCreated);
        socket.on('record_updated', handleRecordUpdated);
        socket.on('record_deleted', handleRecordDeleted);
        socket.on('field_created', handleColumnCreated);
        socket.on('field_updated', handleColumnUpdated);
        socket.on('field_deleted', handleColumnDeleted)
        socket.on('ocr_start', handleOcrStart);
        socket.on('ocr_progress', handleOcrProgress);
        socket.on('ai_start', handleAiStart);
        socket.on('backfill_complete', handleBackfillComplete);

        // Cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleError);
            socket.off('connect_timeout', handleTimeout);
            socket.off('record_created', handleRecordCreated);
            socket.off('record_updated', handleRecordUpdated)
            socket.off('record_deleted', handleRecordDeleted)
            socket.off('field_created', handleColumnCreated);
            socket.off('field_updated', handleColumnUpdated);
            socket.off('field_deleted', handleColumnDeleted)
            socket.off('ocr_start', handleOcrStart);
            socket.off('ocr_progress', handleOcrProgress);
            socket.off('ai_start', handleAiStart);
            socket.off('backfill_complete', handleBackfillComplete);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId]);

    const processingCount = rowData.filter(r => r.answers?.__status__ === 'processing').length;

    useEffect(() => {
        if (processingCount === 0 && processingStatus) {
            setProcessingStatus(null);
        }
    }, [processingCount, processingStatus]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {isConnected ? (
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
                    {initialFields.length >= 2 &&
                        <button
                            onClick={() => setIsReorderPopupVisible(true)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                            Reorder Columns
                        </button>
                    }
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
                <SpreadSheet records={rowData} columns={columns} projectId={projectId} project={project} />
            </div>
            <ColumnReorderPopup
                columns={columns}
                isOpen={isReorderPopupVisible}
                onClose={() => setIsReorderPopupVisible(false)}
                onReorder={setColumns}
            />
        </div >
    );
}