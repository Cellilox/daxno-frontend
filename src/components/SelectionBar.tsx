'use client';

import { X } from 'lucide-react';

interface SelectionBarProps {
  count: number;
  isDeleting?: boolean;
  onDelete: () => void;
  onClear: () => void;
}

export default function SelectionBar({ count, isDeleting = false, onDelete, onClear }: SelectionBarProps) {
  return (
    <div className="w-fit bg-white border border-gray-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4">
      <span className="text-sm font-medium text-gray-700">
        {count} selected
      </span>
      <div className="h-4 w-px bg-gray-300" />
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="flex items-center gap-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-full transition disabled:opacity-50"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
      <button
        onClick={onClear}
        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
