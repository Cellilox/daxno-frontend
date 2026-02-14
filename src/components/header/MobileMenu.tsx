'use client'

import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, LayoutDashboard, Briefcase, X, MoreVertical } from 'lucide-react'

interface MobileMenuProps {
  userId: string | null
}

const MobileMenu = ({ userId }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle side effects (click outside and scroll lock)
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = 'auto'
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const menuItems = [
    {
      title: 'Home',
      subtitle: 'Return to landing page',
      href: '/',
      icon: <Home size={16} className="text-blue-600" />,
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Dashboard',
      subtitle: 'Manage your account',
      href: '/dashboard',
      icon: <LayoutDashboard size={16} className="text-indigo-600" />,
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Projects',
      subtitle: 'View all your projects',
      href: '/projects',
      icon: <Briefcase size={16} className="text-purple-600" />,
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none"
        aria-label="Open menu"
      >
        <MoreVertical size={20} className="text-gray-700" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />

            {/* Bottom Drawer */}
            <motion.div
              ref={menuRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-[70] overflow-hidden border-t border-gray-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Navigation</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-3 space-y-1 bg-white">
                {userId && menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center transition-transform group-hover:scale-105`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom Padding for iOS Home Bar */}
              <div className="h-6 bg-white" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileMenu
