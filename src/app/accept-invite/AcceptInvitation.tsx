'use client'
import { accept_invite } from '@/actions/invites-actions'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { messageTypeEnum, messageType} from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Alert from '@/components/ui/Alert'

type AcceptInvitatioProps = {
    token: string | string[] | undefined,
    projectId: string | string[] | undefined
} 


export default function AcceptInvitation({token}: AcceptInvitatioProps) {
    const [message, setMessage] = useState<messageType | null>()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const handleAccept = async () => {
        try {
            setLoading(true)
            const response = await accept_invite(token)
            if (response?.status === "accepted") {
                setLoading(false)
                router.push(`/projects/${response.project_id}`)
            } else {
                setLoading(false)
                const message = {
                    type: messageTypeEnum.ERROR,
                    text: response.detail
                  }
                setMessage(message)
            }
        } catch (error) {
            setLoading(false)
            //@ts-ignore
            router.push(`/invite-error?error=${encodeURIComponent(error?.message)}`)
        }
    }

    const onClose = () => {
        setMessage(null)
    }
    
    return (
        <div className="w-full">
           {message && <Alert message={message} onClose={onClose}/>}
            <button onClick={handleAccept} className="w-full sm:w-auto flex p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300">
               {loading && <div className="mr-3"><LoadingSpinner/></div>}
               {loading === true ? 'Checking': 'Accept'}
            </button>
        </div>
    )
}
