'use client'

import React, { useState } from 'react'
import { ComponentProgressBar } from '../ui/ProgressBar';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useForm } from "react-hook-form"
import { createProject } from '@/actions/project-actions';

type ProjectData = {
    name: string
}

export default function CreateProjectForm() {
    const { register, resetField, control, handleSubmit, formState: { errors } } = useForm<ProjectData>();
    const [isLoading, setIsLoading] = useState(false)

    const addProject = async (data: ProjectData) => {
        try {
            setIsLoading(true)
            await createProject(data);
            setIsLoading(false)
            resetField('name')
        } catch (error) {
            alert('Error creating a project')
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">Create Project</h2>
                <form onSubmit={handleSubmit(addProject)}>
                    <div className='w-full flex'>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: 'Name is required' })}
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
                            >
                                Add
                            </button>
                        }
                    </div>
                    <p className="text-red-500 text-sm mt-3">{errors.name?.message} </p>
                </form>
            </div>
            {isLoading && <div className='max-w-3xl mx-auto'>
                <ComponentProgressBar />
            </div>}

        </div>
    )
}
