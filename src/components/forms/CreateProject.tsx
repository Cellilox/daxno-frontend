'use client'

import React, { useState } from 'react'
import { ComponentProgressBar } from '../ui/ProgressBar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useForm } from "react-hook-form"
import { createProject } from '@/actions/project-actions';

type ProjectData = {
    name: string
}

interface CreateProjectFormProps {
    onCreated?: () => void;
    onCancel?: () => void;
}

export default function CreateProjectForm({ onCreated, onCancel }: CreateProjectFormProps) {
    const { register, resetField, control, handleSubmit, formState: { errors } } = useForm<ProjectData>();
    const [isLoading, setIsLoading] = useState(false)

    const addProject = async (data: ProjectData) => {
        try {
            setIsLoading(true)
            await createProject(data);
            setIsLoading(false)
            resetField('name')
            if (onCreated) onCreated();
        } catch (error) {
            alert('Error creating a project')
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(addProject)}>
            <div className='w-full flex'>
                <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    data-testid="project-name-input"
                    className="flex-1 p-3 mr-3 w-full rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your project name"
                />
                {isLoading ?
                    <div
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300"
                    >
                        <LoadingSpinner />
                    </div> :
                    <button
                        className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300"
                        data-testid="create-project-submit"
                    >
                        Add
                    </button>
                }
            </div>
            <p className="text-red-500 text-sm mt-3">{errors.name?.message} </p>
            {onCancel && (
                <button type="button" onClick={onCancel} className="mt-4 text-sm text-gray-500 hover:underline">Cancel</button>
            )}
            {isLoading && <div className='max-w-3xl mx-auto mt-4'>
                <ComponentProgressBar />
            </div>}
        </form>
    )
}
