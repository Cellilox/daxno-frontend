'use client'
import React, { useState } from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { create_project_invite } from '@/actions/invites-actions'
import { loggedInUserId } from '@/actions/loggedin-user'

type CreateColumnProps = {
    projectId: string;
    setIsInvitePopupVisible: (isInvitePopupVisible: boolean) => void
}

type InviteCreateData = {
    email: string;
}

export default function CreateInvite({ projectId, setIsInvitePopupVisible}: CreateColumnProps) {
    const {register, handleSubmit, resetField, formState: {errors}} = useForm<InviteCreateData>()
    const [isLoading, setIsLoading] = useState(false)

    async function createInvite(data: InviteCreateData) {
        data.email = data.email
    
        setIsLoading(true)
        try {
            const result = await create_project_invite(data.email, projectId)
            console.log('CREATING_INVICE', result)
            setIsLoading(false)
            resetField("email")
            setIsInvitePopupVisible(false)
        } catch (error) {
            alert('Error creating an Invite')
        }
    }

    return (
        <div className="w-full">
        
            <div className="w-full">
                <form onSubmit={handleSubmit(createInvite)} className="mt-4 sm:mt-0 w-full">
                    <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-2">
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                id="email"
                                {...register('email', {required: 'Email is required'})}
                                className="w-full p-3 rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                placeholder="Add a column"
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
                    {errors.email?.message && (
                        <p className="text-red-500 text-sm mt-2">{errors.email.message}</p>
                    )}
                </form>
            </div>
        </div>
    )
}
