'use client'
import React, { useEffect, useRef, useState } from 'react'

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
    const nameRef = useRef<HTMLInputElement>(null)
    const descRef = useRef<HTMLTextAreaElement>(null)
    const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const savedRef = useRef(false)

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

    // Blur on either input: wait a tick — if focus lands on the sibling
    // input, cancel the pending save. Otherwise commit.
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

    return (
        <div className="w-full bg-red-200 flex flex-col gap-1">
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
                className="w-full py-2 px-3 text-sm rounded-lg text-gray-800 border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-gray-400 shadow-md resize-none font-normal"
                placeholder={descriptionPlaceholder}
            />
        </div>
    )
}
