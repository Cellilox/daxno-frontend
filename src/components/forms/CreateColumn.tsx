'use client'
import React, { FormEvent, useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'

type CreateColumnProps = {
    token: string | null
    sessionId: string | undefined
    projectId: string
    refresh: () => void
}

export default function CreateColumn({token, sessionId, projectId, refresh}: CreateColumnProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')

    async function addColumn(event: FormEvent) {
        event.preventDefault()
        const url = `${process.env.NEXT_PUBLIC_API_URL}/fields/${projectId}`
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
            console.error("Error creating project:", await res.text());
            setIsLoading(false)
            setName('')
            return;
        }

        const newField = await res.json();
        refresh()
        setName('')
        setIsLoading(false)
        // revalidatePath(`/projects/${project.id}`);
        console.log(newField);
    }


  return (
    <>
      <form className="space-y-3 md:space-y-2 w-full md:w-auto">
                <p className="text-lg font-semibold text-gray-700">Add a column</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                  <input
                    type="text"
                    name="name"
                    value={name}
                    className="p-3 w-full sm:w-72 rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the column name"
                    onChange={(e) => setName(e.target.value)}
                  />
                  {isLoading ?
                        <div
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300"
                        >
                            <LoadingSpinner />
                        </div> :
                        <button
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300"
                            onClick={addColumn}
                        >
                            Add
                        </button>
                    }
                </div>
              </form>
    </>
  )
}
