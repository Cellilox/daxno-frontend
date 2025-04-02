'use client';
import { io, Socket } from 'socket.io-client';
import React, { useState, useEffect, useRef } from 'react';
import SpreadSheet from './spreadsheet/SpreadSheet';
import { Field, ApiRecord } from './spreadsheet/types';

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
    console.log('IINNI', rowData)
    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
                path: '/ws/records/sockets',
                auth: { projectId },
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

        const handleShowRecordsUpdates = (data: { records: ApiRecord[], fields: Field[] }) => {
          console.log('Received records update:', data);
          setRowData(data.records)
          setColumns(data.fields)
        }

        // Add listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleError);
        socket.on('connect_timeout', handleTimeout);
        socket.on('records_fetched', handleShowRecordsUpdates)

        // Cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleError);
            socket.off('connect_timeout', handleTimeout);
            socket.off('records_fetched', handleShowRecordsUpdates)
            socket.disconnect();
            socketRef.current = null;
        };
    }, [projectId]); // Reconnect only if projectId changes

    return (
        <div>
            <SpreadSheet records={rowData} columns={columns} projectId={projectId}/>
            <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        </div>
    );
}