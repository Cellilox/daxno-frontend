'use client'
import React, { FormEvent, useEffect, useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { createColumn } from '@/actions/column-actions'

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

    async function addColumn(data: ColumnCreateData) {
        console.log('ColumnCreateData0', data)
        data.id = data.name
        data.description = ''
    
        setIsLoading(true)
        try {
            await createColumn(data, projectId)
            setIsLoading(false)
            resetField("name")
        } catch (error) {
            alert('Error creating a column')
        }
    }
  return (
    <>
      <form onSubmit={handleSubmit(addColumn)} className="space-y-3 md:space-y-2 w-full md:w-auto">
                <p className="text-lg font-semibold text-gray-700">Add a column</p>
                <div className="">
                    <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0'>
                  <input
                    type="text"
                    id="name"
                    {...register('name', {required: 'Name is required'})}
                    className="p-3 w-full mr-3 sm:w-72 rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the column name"
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
                </div>
              </form>
    </>
  )
}
