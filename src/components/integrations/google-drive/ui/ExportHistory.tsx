import React, { useState } from 'react';
import { ExportRecord } from '../types';
import { GoogleDriveIcon, GoogleSheetsIcon } from '../GoogleDriveIcons';
import { formatDate } from '../utils/formatting';
interface ExportHistoryProps {
  exportHistory: ExportRecord[];
  onOpenFile: (fileLink: string) => void;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({ exportHistory, onOpenFile }) => {
  const [showHistory, setShowHistory] = useState(false);
  const hasMultipleExports = exportHistory.length >= 2;
  if (!hasMultipleExports) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mt-4 w-full bg-white px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] rounded-md shadow-sm border border-gray-300 flex justify-between items-center"
      >
        <div className="flex items-center">
          <GoogleDriveIcon />
          <span>Previous Exports</span>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transform ${showHistory ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showHistory && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {exportHistory.slice(1).map((export_record) => (
              <li
                key={export_record.id}
                className="hover:bg-gray-50 px-4 py-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {export_record.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(export_record.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenFile(export_record.file_link)}
                    className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F9D58]"
                  >
                    <GoogleSheetsIcon />
                    <span>Open</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 