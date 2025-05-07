'use client'
import { accept_invite } from '@/actions/invites-actions'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import MessageAlert from '@/components/ui/messageAlert'
import { messageTypeEnum } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
type AcceptInvitatioProps = {
    token: string | string[] | undefined,
    projectId: string | string[] | undefined
} 

type Error = {
        type: messageTypeEnum;
        text: string
}

export default function AcceptInvitation({token}: AcceptInvitatioProps) {
    const [error, setError] = useState<Error | undefined>()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const handleAccept = async () => {
        try {
            setLoading(true)
            const response = await accept_invite(token)
            console.log('RRRR', response)
            if (response?.status === "accepted") {
                setLoading(false)
                router.push(`/projects/${response.project_id}`)
            } else {
                setLoading(false)
                const error = {
                    type: messageTypeEnum.ERROR,
                    text: response.detail
                  }
                setError(error)
            }
        } catch (error) {
            setLoading(false)
            //@ts-ignore
            router.push(`/invite-error?error=${encodeURIComponent(error?.message)}`)
        }
    }

    const handleRemoveError = () => {
        setError(undefined)
    }
    return (
        <div className="w-full">
           {error && <div className="z-50 fixed inset-0 top-0 flex justify-center h-20">
                <div className="w-full lg:w-1/2">
                <MessageAlert message={error} onClose={handleRemoveError}/>
                </div>
            </div>}
            <button onClick={handleAccept} className="w-full sm:w-auto flex p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300">
               {loading && <div className="mr-3"><LoadingSpinner/></div>}
               {loading === true ? 'Checking': 'Accept'}
            </button>
        </div>
    )
}
