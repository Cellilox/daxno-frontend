'use client'
import { accept_invite } from '@/actions/invites-actions'
import React from 'react'

type AcceptInvitatioProps = {
    token: string | string[] | undefined
    email: string | undefined
} 

export default function AcceptInvitation({token, email}: AcceptInvitatioProps) {
    const handleAcceptInvitation = async () => {
        await accept_invite(token, email)
    }
    return (
        <div className="w-full">
            <div className="w-full">
            <button onClick={handleAcceptInvitation} className="w-full sm:w-auto p-3 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition duration-300">
               Accept
            </button>
            </div>
        </div>
    )
}
