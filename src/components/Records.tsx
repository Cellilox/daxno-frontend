'use client';
import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import SpreadSheet from './spreadsheet/SpreadSheet';
import { Field, ApiRecord } from './spreadsheet/types';
import ColumnReorderPopup from './forms/ColumnReorderPopup';


type RecordsProps = {
    projectId: string;
    initialFields: Field[];
    initialRecords: ApiRecord[];
};

export default function Records({ projectId, initialFields, initialRecords }: RecordsProps) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [rowData, setRowData] = useState<ApiRecord[]>(initialRecords)
    const [columns, setColumns] = useState<Field[]>(initialFields)
    const [isReorderPopupVisible, setIsReorderPopupVisible] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string | null>(null);

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

        const handleConnect = () => {
            setIsConnected(true);
            console.log('Connected to WebSocket');
            console.log(`Socket ID: ${socket.id}`);
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

        const handleRecordCreated = (data: { record: ApiRecord; fields: Field[] }) => {
            setRowData(prev => [...prev, data.record]);
            setColumns(data.fields);
            setProcessingStatus(null); // Clear status on success
        };

        const handleRecordUpdated = (data: { record: ApiRecord; fields: Field[] }) => {
            setRowData(prev => prev.map(x => x.id === data.record.id ? data.record : x));
            setColumns(data.fields);
        };

        const handleRecordDeleted = (data: { id: string; fields: Field[] }) => {
            setRowData(prev => prev.filter(x => x.id !== data.id));
            setColumns(data.fields);
        };

        const handleColumnCreated = (data: { records: ApiRecord[]; field: Field }) => {
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
            setProcessingStatus(`OCR: Processing page ${data.current} of ${data.total}...`);
        };

        const handleAiStart = (data: { status: string }) => {
            setProcessingStatus('AI Analyzing document...');
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
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex flex-col">
                    {isConnected ? (
                        <p className='text-sm md:text-base text-gray-600'>Connection: <span className='text-green-600 font-semibold'>Online</span></p>
                    ) : (
                        <p className='text-sm md:text-base text-gray-600'>Connection: <span className='text-red-600 font-semibold'>Connecting...</span></p>
                    )}
                    {processingStatus && (
                        <div className="flex items-center mt-2 animate-pulse">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            <p className="text-sm md:text-base font-semibold text-blue-600">{processingStatus}</p>
                        </div>
                    )}
                </div>
                {initialFields.length >= 2 &&
                    <div className="text-right">
                        <button
                            onClick={() => setIsReorderPopupVisible(true)}
                            className="text-sm md:text-base text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                            Reorder Columns
                        </button>
                    </div>
                }
            </div>
            <div className="flex-1 min-h-0">
                <SpreadSheet records={rowData} columns={columns} projectId={projectId} />
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