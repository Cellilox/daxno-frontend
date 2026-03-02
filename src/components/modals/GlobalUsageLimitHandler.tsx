'use client'


import React, { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname, useParams } from 'next/navigation'
import UsageLimitModal from './UsageLimitModal'
import { io, Socket } from 'socket.io-client'

export default function GlobalUsageLimitHandler() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [type, setType] = useState<'AI_EXHAUSTED' | 'DAILY_LIMIT' | 'RATE_LIMIT'>('DAILY_LIMIT')
    const [currentTier, setCurrentTier] = useState<'standard' | 'byok' | 'managed'>('standard')
    const pathname = usePathname()
    const params = useParams()
    const projectId = params?.id as string | undefined

    // Socket ref
    const socketRef = useRef<Socket | null>(null)

    const handleLimitReached = useCallback((event: Event | CustomEvent | { detail: { error: string; subscriptionType?: string } }) => {
        const errorDetail = 'detail' in event ? event.detail.error : (event as any).error;
        const errorVal = errorDetail || ('detail' in event ? (event as CustomEvent).detail : event);
        const cleanMsg = typeof errorVal === 'string' ? errorVal : JSON.stringify(errorVal)
        const subType: string = ('detail' in event ? (event as any).detail?.subscriptionType : null) || 'standard'

        // ── New typed error_code values from backend ──────────────────────
        if (cleanMsg === 'PROVIDER_RATE_LIMIT_EXHAUSTED' || cleanMsg.includes('rate limit persisted after') || cleanMsg.toLowerCase().includes('provider rate limit') || cleanMsg.toLowerCase().includes('rate limit hit')) {
            setType('RATE_LIMIT')
            // Show 'free AI model' only for standard users; BYOK/Managed users may also
            // hit rate limits (their own API key's limits) so use neutral wording for them.
            const isStandard = subType === 'standard'
            setMessage(isStandard
                ? 'The free AI model you selected is currently overloaded or rate-limited by the provider. Please try switching to a different model, or upgrade to BYOK/Managed for dedicated limits.'
                : 'The AI model you selected is currently rate-limited by the provider. Please try again in a few minutes, or switch to a different model in your project settings.'
            )
            setCurrentTier(isStandard ? 'standard' : subType as 'byok' | 'managed')
            setIsOpen(true)
        } else if (cleanMsg === 'QUOTA_DAILY_LIMIT' || cleanMsg.includes('Daily extraction limit')) {
            setType('DAILY_LIMIT')
            setMessage('Daily document limit reached. Your Free plan allows 3 documents every 24 hours. Upgrade for unlimited access.')
            setCurrentTier('standard')
            setIsOpen(true)
        } else if (cleanMsg === 'QUOTA_PAGE_LIMIT' || cleanMsg.includes('Monthly page quota') || cleanMsg.includes('exceeds your remaining limit')) {
            setType('DAILY_LIMIT')
            setMessage('Monthly page quota reached. Upgrade to BYOK or Managed Credits to continue processing documents.')
            setCurrentTier('standard')
            setIsOpen(true)

            // ── Legacy string-based codes (standard tier HTTPException) ───────
        } else if (cleanMsg.includes('AI_MODEL_BUSY') || cleanMsg.includes('429') || cleanMsg.includes('PROVIDER_RATE_LIMIT')) {
            setType('AI_EXHAUSTED')
            setMessage('The AI model is currently busy. Daxno is automatically retrying your document — no action needed. If this persists, try switching to a different model.')
            setCurrentTier('standard')
            setIsOpen(true)
        } else if (cleanMsg.includes('AI_MODEL_UNAVAILABLE') || cleanMsg.includes('503')) {
            setType('AI_EXHAUSTED')
            setMessage('The selected AI model is currently unavailable. Please select another model from your project settings.')
            setCurrentTier('standard')
            setIsOpen(true)
        } else if (cleanMsg.includes('AI_CREDITS_EXHAUSTED') || cleanMsg.includes('402') || cleanMsg.toLowerCase().includes('credits are currently exhausted')) {
            setType('AI_EXHAUSTED')
            setMessage('AI credits exhausted. Please upgrade your plan or top up your credits to continue.')
            setCurrentTier('standard')
            setIsOpen(true)
        } else if (cleanMsg.includes('exhausted your managed credits')) {
            setType('AI_EXHAUSTED')
            setMessage('Your managed credits are exhausted. Please recharge to continue processing documents.')
            setCurrentTier('managed')
            setIsOpen(true)
        } else if (cleanMsg.includes('BYOK monthly limit')) {
            setType('DAILY_LIMIT')
            setMessage('Monthly BYOK page limit reached. Your limit resets on a rolling 30-day basis.')
            setCurrentTier('byok')
            setIsOpen(true)
        }
    }, [])

    useEffect(() => {
        // 1. Listen for Window Events (Legacy/Local components)
        window.addEventListener('daxno:usage-limit-reached', handleLimitReached as EventListener)

        return () => {
            window.removeEventListener('daxno:usage-limit-reached', handleLimitReached as EventListener)
        }
    }, [handleLimitReached])

    // 2. Global Socket Listener for "Silent" Backfills (e.g. Single Record)
    useEffect(() => {
        if (!projectId) return;

        // Connect if not already connected
        if (!socketRef.current) {
            const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            socketRef.current = io(socketUrl, {
                path: '/ws/records/sockets',
                transports: ['websocket', 'polling']
            });
        }

        const socket = socketRef.current;

        // Join Project Room
        socket.emit('join_project', { project_id: projectId });

        // Listen for Global Processing Errors — pass error_code preferentially
        const handleError = (data: { message: string; error_code?: string; record_id?: string }) => {
            console.log("[Global Socket] Processing Error:", data);
            // Prefer typed error_code, but fall back to message if error_code is the generic 'PROCESSING_FAILED'
            // This is critical: the generic except block in Celery emits error_code='PROCESSING_FAILED'
            // for ALL non-typed errors. We must also check the message string for rate limit keywords.
            const errorSignal = (data.error_code && data.error_code !== 'PROCESSING_FAILED')
                ? data.error_code
                : (data.message || JSON.stringify(data));
            handleLimitReached({ detail: { error: errorSignal } } as any);
        };

        socket.on('processing_error', handleError);

        return () => {
            socket.off('processing_error', handleError);
            // We don't disconnect here to prevent thrashing, but ideally we manage connection lifecycle
        };
    }, [projectId, handleLimitReached]);

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
