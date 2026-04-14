'use client';

import { X, Trash2 } from 'lucide-react';

interface MobileSelectionBarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

export default function MobileSelectionBar({ count, onDelete, onClear }: MobileSelectionBarProps) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm animate-in slide-in-from-top-2">
      <span className="text-sm font-medium text-gray-700 flex-1">
        {count} selected
      </span>
      <div className="h-4 w-px bg-gray-300" />
      <button
        onClick={onDelete}
        className="flex items-center gap-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
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
