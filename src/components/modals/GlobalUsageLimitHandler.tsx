'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import UsageLimitModal from './UsageLimitModal'

export default function GlobalUsageLimitHandler() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [type, setType] = useState<'AI_EXHAUSTED' | 'DAILY_LIMIT'>('DAILY_LIMIT')
    const [currentTier, setCurrentTier] = useState<'standard' | 'byok' | 'managed'>('standard')
    const pathname = usePathname()

    const handleLimitReached = useCallback((event: Event) => {
        const customEvent = event as CustomEvent
        const { error } = customEvent.detail

        const cleanMsg = typeof error === 'string' ? error : JSON.stringify(error)

        if (cleanMsg.includes('AI_CREDITS_EXHAUSTED')) {
            setType('AI_EXHAUSTED')
            setMessage("All available platform credits are currently exhausted. Please try again later or Bring Your Own Key to continue instantly.")
            setCurrentTier('standard') // Defaulting to standard for system-wide credits
            setIsOpen(true)
        } else if (cleanMsg.includes('exhausted your managed credits')) {
            setType('AI_EXHAUSTED')
            setMessage(cleanMsg.replace(/"/g, ''))
            setCurrentTier('managed')
            setIsOpen(true)
        } else if (cleanMsg.includes('BYOK monthly limit')) {
            setType('DAILY_LIMIT')
            setMessage(cleanMsg.replace(/"/g, ''))
            setCurrentTier('byok')
            setIsOpen(true)
        } else if (cleanMsg.includes('On your Free plan') || cleanMsg.includes('DAILY_LIMIT_REACHED') || cleanMsg.includes('exceed the limit')) {
            setType('DAILY_LIMIT')
            setMessage(cleanMsg.replace(/"/g, ''))
            setCurrentTier('standard')
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
            currentTier={currentTier}
        />
    )
}
