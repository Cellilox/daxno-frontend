'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import UsageLimitModal from './UsageLimitModal'

export default function GlobalUsageLimitHandler() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [type, setType] = useState<'AI_EXHAUSTED' | 'DAILY_LIMIT'>('DAILY_LIMIT')
    const pathname = usePathname()

    const handleLimitReached = useCallback((event: Event) => {
        const customEvent = event as CustomEvent
        const { error } = customEvent.detail

        const cleanMsg = typeof error === 'string' ? error : JSON.stringify(error)

        if (cleanMsg.includes('AI_CREDITS_EXHAUSTED')) {
            setType('AI_EXHAUSTED')
            setMessage("All available platform credits are currently exhausted. Please try again later or Bring Your Own Key to continue instantly.")
            setIsOpen(true)
        } else if (cleanMsg.includes('On your Free plan') || cleanMsg.includes('DAILY_LIMIT_REACHED') || cleanMsg.includes('exceed the limit')) {
            setType('DAILY_LIMIT')
            setMessage(cleanMsg.replace(/"/g, ''))
            setIsOpen(true)
        }
    }, [])

    useEffect(() => {
        window.addEventListener('daxno:usage-limit-reached', handleLimitReached as EventListener)
        return () => {
            window.removeEventListener('daxno:usage-limit-reached', handleLimitReached as EventListener)
        }
    }, [handleLimitReached])

    // Close modal on navigation to ensure fresh state
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <UsageLimitModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            message={message}
            type={type}
        />
    )
}
