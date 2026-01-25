'use client'
import React, { useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { createColumn } from '@/actions/column-actions'

type CreateColumnProps = {
    projectId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    showToggle?: boolean;
}

type ColumnCreateData = {
    id: string;
    name: string;
    description: string
}

export default function CreateColumn({ projectId, onSuccess, onCancel }: CreateColumnProps) {
    const { register, handleSubmit, resetField } = useForm<ColumnCreateData>()
    const [isLoading, setIsLoading] = useState(false)

    async function addColumn(data: ColumnCreateData) {
        if (!data.name.trim()) {
            onCancel?.();
            return;
        }

        data.id = data.name
        data.description = ''

        setIsLoading(true)
        try {
            console.log('Calling createColumn with:', data, projectId);
            await createColumn(data, projectId);
            setIsLoading(false)
            resetField("name")
            onSuccess?.()
        } catch (error: any) {
            console.error(error);
            alert(`Error creating a column: ${error.message || 'Unknown error'}`);
            setIsLoading(false);
            onCancel?.(); // Cancel on error to close the input
        }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Delay slightly to allow for other events to process if needed
        setTimeout(() => {
            handleSubmit(addColumn)();
        }, 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onCancel?.();
        } else if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission if wrapped in form
            handleSubmit(addColumn)();
        }
    };

    return (
        <div className="w-full flex items-center justify-center">
            {isLoading ? (
                <div className="py-2 px-3 text-sm text-blue-600 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            ) : (
                <input
                    type="text"
                    {...register('name')}
                    data-testid="column-name-input"
                    className="w-full py-1.5 px-3 text-sm rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
                    placeholder="Column Name"
                    autoFocus
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
            )}
        </div>
    )
}
