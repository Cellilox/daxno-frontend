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
            console.log('New record created:', data);
            setRowData(prev => [...prev, data.record]);
            setColumns(data.fields);
        };

        const handleRecordUpdated = (data: { record: ApiRecord; fields: Field[] }) => {
            console.log('New record updated:', data);
            setRowData(prev => prev.map(x => x.id === data.record.id ? data.record : x));
            setColumns(data.fields);
        };

        const handleRecordDeleted = (data: { id: string; fields: Field[] }) => {
            console.log('New record deleted:', data);
            setRowData(prev => prev.filter(x => x.id !== data.id));
            setColumns(data.fields);
        };

        const handleColumnCreated = (data: { records: ApiRecord[]; field: Field }) => {
            console.log('New Column created:', data);
            setRowData(data.records);
            setColumns(prev => [...prev, data.field]);
        };
        const handleColumnUpdated = (data: { field: Field }) => {
            console.log('New Column updated:', data);
            setColumns(prev => prev.map(x => x.hidden_id === data.field.hidden_id ? data.field : x));
        };

        const handleColumnDeleted = (data: { field_id: string }) => {
            console.log('New record deleted:', data);
            setColumns(prev => prev.filter(x => x.hidden_id !== data.field_id));
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
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId]); 

    return (
        <div>
            <div
                className="text-right"
                onClick={() => setIsReorderPopupVisible(true)}
            >
                <button onClick={() => setIsReorderPopupVisible(true)} className="ext-md mb-4 underline sticky right-0 ">
                    Edit columns
                </button>
            </div>
            <SpreadSheet records={rowData} columns={columns} projectId={projectId} />
            <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
            <ColumnReorderPopup
                columns={columns}
                isOpen={isReorderPopupVisible}
                onClose={() => setIsReorderPopupVisible(false)}
                onReorder={setColumns}
            />

        </div>
    );
}