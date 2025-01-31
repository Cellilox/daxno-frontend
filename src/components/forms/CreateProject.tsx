'use client'

import React, { useState } from 'react'
import { ComponentProgressBar } from '../ui/ProgressBar';
import LoadingSpinner from '../ui/LoadingSpinner';


const url = `${process.env.NEXT_PUBLIC_API_URL}/projects`

type CreateProjectFormProps = {
    token: string | null
    sessionId: string | null
    refresh: () => void
}
export default function CreateProjectForm({ token, sessionId, refresh }: CreateProjectFormProps) {
    const [name, setName] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    console.log(name)

    const addProject = async (event: React.FormEvent) => {
        event.preventDefault()
        const postHeaders = new Headers();
        postHeaders.append('Authorization', `Bearer ${token}`);
        postHeaders.append('Content-Type', 'application/json')
        if (sessionId) {
            postHeaders.append('sessionId', sessionId);
        }
        setIsLoading(true)
        const res = await fetch(url,
            {
                method: 'POST',
                headers: postHeaders,
                body: JSON.stringify({ name })
            })

        if (!res.ok) {
            setIsLoading(false)
            setName('')
            console.error("Error creating project:", await res.text());
            return;
        }

        const newProject = await res.json();
        // revalidatePath("/projects");
        refresh()
        setName('')
        setIsLoading(false)
        console.log(newProject);
    }

    return (
        <div>
            <div className="bg-white p-6 rounded shadow-md max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-right">Register Your Project</h2>
                <form className="flex items-center justify-end gap-3">
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 p-3 w-full sm:w-72 rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            onClick={addProject}
                        >
                            Add
                        </button>
                    }
                </form>
            </div>
            {isLoading && <div className='max-w-3xl mx-auto'>
                <ComponentProgressBar />
            </div>}

        </div>
    )
}
