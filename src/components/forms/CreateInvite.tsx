'use client'
import React, { useState } from 'react'
import { Mail, ArrowRight } from 'lucide-react'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useForm } from 'react-hook-form'
import { create_project_invite } from '@/actions/invites-actions'
import { messageType, messageTypeEnum } from '@/types'
import Alert from '@/components/ui/Alert'

type CreateColumnProps = {
    projectId: string;
    setIsInvitePopupVisible: (isInvitePopupVisible: boolean) => void
}

type InviteCreateData = {
    email: string;
}

export default function CreateInvite({ projectId, setIsInvitePopupVisible }: CreateColumnProps) {
    const { register, handleSubmit, resetField, formState: { errors } } = useForm<InviteCreateData>()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<messageType | null>()
    async function createInvite(data: InviteCreateData) {
        data.email = data.email

        setIsLoading(true)
        try {
            const result = await create_project_invite(data.email, projectId)
            if (result?.status === "pending") {
                setIsLoading(false)
                resetField("email")
                const message = {
                    type: messageTypeEnum.SUCCESS,
                    text: `Invitation was sent successfully (${result.status})`
                }
                setMessage(message)
                setTimeout(() => {
                    setIsInvitePopupVisible(false)
                }, 3000)
            } else if (result?.detail) {
                setIsLoading(false)
                const message = {
                    type: messageTypeEnum.ERROR,
                    text: typeof result.detail === 'string' ? result.detail : "Failed to send invite. Please check the email and try again."
                }
                setMessage(message)
                setTimeout(() => {
                    setIsInvitePopupVisible(false)
                }, 3000)
            }
        } catch (error) {
            setIsLoading(false)
            const message = {
                type: messageTypeEnum.ERROR,
                text: 'Server Error'
            }
            setMessage(message)
            setTimeout(() => {
                setIsInvitePopupVisible(false)
            }, 3000)
        }
    }

    const onClose = () => {
        setMessage(null)
    }

    return (
        <div className="w-full">
            {message && <Alert message={message} onClose={onClose} />}
            <div className="w-full">
                <form onSubmit={handleSubmit(createInvite)} className="w-full flex items-center">
                    <div className="relative flex-1 mr-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            id="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email address"
                                }
                            })}
                            className={`w-full pl-10 pr-3 py-3 bg-white border ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-blue-400 focus:border-blue-500 focus:ring-blue-100'} rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                            placeholder="colleague@example.com"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <button
                            disabled={isLoading}
                            className={`p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg shadow transition duration-300 flex items-center justify-center min-w-[3rem] ${isLoading ? 'cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : (
                                "Send"
                            )}
                        </button>
                    </div>
                </form>
                {errors.email?.message && (
                    <p className="text-red-500 text-xs mt-2 ml-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full inline-block" />
                        {errors.email.message}
                    </p>
                )}
            </div>
        </div>
    )
}
