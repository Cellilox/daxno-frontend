'use client'
import React, { useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { createColumn } from '@/actions/column-actions'
import ColumnEditor from './ColumnEditor'

type CreateColumnProps = {
    projectId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    showToggle?: boolean;
}

export default function CreateColumn({ projectId, onSuccess, onCancel }: CreateColumnProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function addColumn({ name, description }: { name: string; description: string }) {
        if (!name.trim()) {
            onCancel?.();
            return;
        }

        const data = {
            id: name,
            name,
            description,
        }

        setIsLoading(true)
        try {
            console.log('Calling createColumn with:', data, projectId);
            await createColumn(data, projectId);
            setIsLoading(false)
            onSuccess?.()
        } catch (error: any) {
            console.error(error);
            alert(`Error creating a column: ${error.message || 'Unknown error'}`);
            setIsLoading(false);
            onCancel?.(); // Cancel on error to close the input
        }
    }

    return (
        <div className="w-full flex items-center justify-center">
            {isLoading ? (
                <div className="py-2 px-3 text-sm text-blue-600 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                <ColumnEditor
                    initialName=""
                    initialDescription=""
                    onSave={addColumn}
                    onCancel={() => onCancel?.()}
                />
            )}
        </div>
    )
}
