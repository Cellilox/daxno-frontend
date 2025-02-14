'use client'

import { useState } from 'react'
import ScanFilesModal from './ScanFilesModal'
import CreateColumn from './forms/CreateColumn'
import ScanView from './ScanView'
import Options from './Options'

type MobileMenuProps = {
  user_id: string | undefined
  sessionId: string | undefined
  projectId: string
  token: string | null
  headers: Headers
  onClose: () => void
  onOk: () => void
  refresh: () => void
}

export default function MobileMenu({ 
  user_id, 
  sessionId, 
  projectId, 
  token, 
  headers,
  onClose, 
  onOk,
  refresh 
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 rounded-md hover:bg-gray-100"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className={`
        fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className={`
          fixed inset-y-0 right-0 w-full sm:max-w-xs bg-white shadow-xl 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-70px)]">
            <ScanFilesModal
              user_id={user_id}
              sessionId={sessionId}
              projectId={projectId}
              token={token}
              onClose={() => {
                setIsOpen(false);
                onClose();
              }}
              onOk={onOk}
            />
            <CreateColumn 
              token={token}
              sessionId={sessionId} 
              refresh={() => {
                setIsOpen(false);
                refresh();
              }}
              projectId={projectId} 
            />
            <div className="space-y-3">
              <ScanView />
              <Options headers={headers} projectId={projectId}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 