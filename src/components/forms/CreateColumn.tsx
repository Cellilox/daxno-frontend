'use client'
import React, { FormEvent, useEffect, useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { createColumn } from '@/actions/column-actions'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'

type CreateColumnProps = {
    projectId: string
}

type ColumnCreateData = {
    id: string;
    name: string;
    description: string 
}

export default function CreateColumn({projectId }: CreateColumnProps) {
    const {register, handleSubmit, resetField, formState: {errors}} = useForm<ColumnCreateData>()
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    async function addColumn(data: ColumnCreateData) {
        data.id = data.name
        data.description = ''
    
        setIsLoading(true)
        try {
            await createColumn(data, projectId)
            setIsLoading(false)
            resetField("name")
            setIsExpanded(false) // Close the form after successful submission on mobile
        } catch (error) {
            alert('Error creating a column')
        }
    }

    return (
        <div className="w-full">
            {/* Mobile Toggle Button */}
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

            {/* Form - Hidden on mobile when collapsed, always visible on desktop */}
            <div className={`${!isExpanded ? 'hidden sm:block' : 'block'} w-full`}>
                <form onSubmit={handleSubmit(addColumn)} className="mt-4 sm:mt-0 w-full">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                id="name"
                                {...register('name', {required: 'Name is required'})}
                                className="w-full p-3 rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter the column name"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            {isLoading ? (
                                <div className="w-full sm:w-auto p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300">
                                    <LoadingSpinner />
                                </div>
                            ) : (
                                <button className="w-full sm:w-auto p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300">
                                    Add
                                </button>
                            )}
                        </div>
                    </div>
                    {errors.name?.message && (
                        <p className="text-red-500 text-sm mt-2">{errors.name.message}</p>
                    )}
                </form>
            </div>
        </div>
    )
}
