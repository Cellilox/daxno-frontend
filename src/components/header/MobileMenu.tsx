'use client'

import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'

const MobileMenu = ({ userId }: { userId: string | null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(o => !o)}
        className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* sliding panel */}
      <div
        ref={menuRef}
        className={`
          fixed right-0 top-0 z-50 mt-2 w-64 bg-white p-4 shadow-lg 
          origin-top transform transition-transform duration-300 ease-out
          ${isOpen ? 'scale-y-100' : 'scale-y-0'}
        `}
      >
        <div className="flex flex-col space-y-3">
          {userId && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                Projects
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
