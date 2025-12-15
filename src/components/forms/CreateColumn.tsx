'use client'
import React, { FormEvent, useEffect, useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { createColumn } from '@/actions/column-actions'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'

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

export default function CreateColumn({ projectId, onSuccess, onCancel, showToggle = true }: CreateColumnProps) {
    const { register, handleSubmit, resetField, formState: { errors } } = useForm<ColumnCreateData>()
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(!showToggle) // Start expanded if no toggle

    async function addColumn(data: ColumnCreateData) {
        data.id = data.name
        data.description = ''

        setIsLoading(true)
        try {
            await createColumn(data, projectId)
            setIsLoading(false)
            resetField("name")
            setIsExpanded(!showToggle) // Reset to initial state
            onSuccess?.() // Call onSuccess callback if provided
        } catch (error) {
            alert('Error creating a column')
        }
    }

    return (
        <div className="w-full">
            {/* Mobile Toggle Button */}
            {showToggle && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex sm:hidden items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    {isExpanded ? (
                        <>
                            Hide Column Form
                            <ChevronUp size={16} />
                        </>
                    ) : (
                        <>
                            Add Column
                            <Plus size={16} />
                        </>
                    )}
                </button>
            )}

            {/* Form - Hidden on mobile when collapsed, always visible on desktop */}
            <div className={`w-full ${showToggle ? (!isExpanded ? 'hidden sm:block' : 'block') : 'block'}`}>
                <form onSubmit={handleSubmit(addColumn)} className="mt-4 sm:mt-0 w-full">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                id="name"
                                {...register('name', { required: 'Name is required' })}
                                className={`w-full ${showToggle ? 'p-3' : 'py-1 px-2 text-sm'} rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-white`}
                                placeholder="Name"
                                autoFocus={!showToggle}
                            />
                        </div>
                        <div className="flex-shrink-0">
                            {isLoading ? (
                                <div className={`w-full sm:w-auto ${showToggle ? 'p-3' : 'py-1 px-3 text-sm'} bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300`}>
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <div className="flex gap-1">
                                    <button className={`w-full sm:w-auto ${showToggle ? 'p-3' : 'py-1 px-3 text-sm'} bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300`}>
                                        Add
                                    </button>
                                    {!showToggle && onCancel && (
                                        <button
                                            type="button"
                                            onClick={onCancel}
                                            className={`bg-gray-200 hover:bg-gray-300 text-gray-700 rounded shadow transition duration-300 flex items-center justify-center ${showToggle ? 'p-3' : 'px-2 py-1'}`}
                                            title="Cancel"
                                        >
                                            <span className="text-lg leading-none">&times;</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {errors.name?.message && (
                        <p className="text-red-500 text-xs mt-1 absolute">{errors.name.message}</p>
                    )}
                </form>
            </div>
        </div>
    )
}
