"use client"

import { useState, useRef, useEffect } from 'react';
import { InfoIcon, Plug2 } from 'lucide-react'; 

type CreditsTooltipProps = {
 limit: number | undefined;
 used: number | undefined;
 remaining: number | undefined
}


export default function CreditsToolTip({ used, remaining, limit }: CreditsTooltipProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // close on outside click (mobile tap outside)
  useEffect(() => {
    function handleClickOutside(e: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative inline-block text-left"
      // on desktop, close when mouse leaves wrapper entirely
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="group inline-flex items-center px-3 py-1.5 text-xs sm:text-sm rounded-md shadow transition-colors"
      >
        {typeof remaining === 'number' && remaining <= 0 && <p>Credits: <span className='text-red-500'>{remaining}</span></p>}
        {typeof remaining === 'number' && remaining > 0 && <p>Credits: <span>{remaining}</span></p>}
        <span className='ml-3'><InfoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" /></span>
      </button>

      {/* tooltip panel */}
      <div
        className={`
          absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5
          opacity-0 pointer-events-none
          transition-opacity duration-150 z-50
          ${open ? 'opacity-100 pointer-events-auto' : ''}
          
          /* on hover desktop */
          group-hover:opacity-100 group-hover:pointer-events-auto
        `}
      >
        <div className="p-3 space-y-1 text-sm">
          <div>Allowed: {limit}</div>
          <div>Used: {used}</div>
          <div>Remaining: {remaining}</div>
        </div>
      </div>
    </div>
  );
}