'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type ColumnEditorProps = {
    initialName: string;
    initialDescription?: string;
    autoFocus?: boolean;
    namePlaceholder?: string;
    descriptionPlaceholder?: string;
    onSave: (values: { name: string; description: string }) => void;
    onCancel: () => void;
    nameTestId?: string;
    descriptionTestId?: string;
}

export default function ColumnEditor({
    initialName,
    initialDescription = '',
    autoFocus = true,
    namePlaceholder = 'Column Name',
    descriptionPlaceholder = 'Description (optional) — helps the AI pick the right value',
    onSave,
    onCancel,
    nameTestId = 'column-name-input',
    descriptionTestId = 'column-description-input',
}: ColumnEditorProps) {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription)
    const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null)
    const [mounted, setMounted] = useState(false)
    const nameRef = useRef<HTMLInputElement>(null)
    const descRef = useRef<HTMLTextAreaElement>(null)
    const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const savedRef = useRef(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useLayoutEffect(() => {
        const update = () => {
            if (nameRef.current) {
                const r = nameRef.current.getBoundingClientRect()
                setRect({ left: r.left, top: r.bottom, width: r.width })
            }
        }
        update()

        // Track the input's size (column resize) and viewport changes.
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
        if (ro && nameRef.current) ro.observe(nameRef.current)

        window.addEventListener('resize', update)
        window.addEventListener('scroll', update, true)

        // During a drag (column resize) the ResizeObserver fires, but mouse
        // events between frames can leave the rect one frame behind. A short
        // rAF loop while the pointer is down keeps the textarea glued to the
        // input during active dragging.
        let rafId: number | null = null
        const loop = () => {
            update()
            rafId = requestAnimationFrame(loop)
        }
        const startLoop = () => {
            if (rafId == null) rafId = requestAnimationFrame(loop)
        }
        const stopLoop = () => {
            if (rafId != null) {
                cancelAnimationFrame(rafId)
                rafId = null
            }
        }
        window.addEventListener('mousedown', startLoop)
        window.addEventListener('mouseup', stopLoop)

        return () => {
            ro?.disconnect()
            window.removeEventListener('resize', update)
            window.removeEventListener('scroll', update, true)
            window.removeEventListener('mousedown', startLoop)
            window.removeEventListener('mouseup', stopLoop)
            stopLoop()
        }
    }, [])

    useEffect(() => {
        if (autoFocus) nameRef.current?.focus()
        return () => {
            if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
        }
    }, [autoFocus])

    const commitSave = () => {
        if (savedRef.current) return
        savedRef.current = true
        onSave({ name: name.trim(), description: description.trim() })
    }

    const commitCancel = () => {
        if (savedRef.current) return
        savedRef.current = true
        onCancel()
    }

    // Blur on either input: wait a tick — if focus lands on the sibling input,
    // cancel the pending save. Otherwise commit.
    const handleBlur = () => {
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current)
        blurTimerRef.current = setTimeout(() => {
            const active = document.activeElement
            if (active === nameRef.current || active === descRef.current) return
            commitSave()
        }, 0)
    }

    const handleFocusSibling = () => {
        if (blurTimerRef.current) {
            clearTimeout(blurTimerRef.current)
            blurTimerRef.current = null
        }
    }

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            commitCancel()
        } else if (e.key === 'Enter') {
            e.preventDefault()
            // Advance to description so the user can add one; Enter on the
            // textarea (without Shift) commits.
            descRef.current?.focus()
        }
    }

    const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            commitCancel()
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            commitSave()
        }
    }

    const textareaPortal = mounted && rect ? createPortal(
        <textarea
            ref={descRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocusSibling}
            onKeyDown={handleDescriptionKeyDown}
            onClick={(e) => e.stopPropagation()}
            data-testid={descriptionTestId}
            rows={4}
            style={{
                position: 'fixed',
                left: rect.left,
                top: rect.top + 4,
                width: rect.width,
                zIndex: 9999,
            }}
            className="py-2 px-3 text-sm rounded-lg text-gray-800 border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400 shadow-xl resize-none font-normal"
            placeholder={descriptionPlaceholder}
        />,
        document.body,
    ) : null

    return (
        <div className="w-full">
            <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                onFocus={handleFocusSibling}
                onKeyDown={handleNameKeyDown}
                onClick={(e) => e.stopPropagation()}
                data-testid={nameTestId}
                className="w-full py-1.5 px-3 text-sm rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400"
                placeholder={namePlaceholder}
                autoComplete="off"
            />
            {textareaPortal}
        </div>
    )
}
