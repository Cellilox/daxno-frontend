import React, { useState, useEffect } from 'react';
import { GoogleDriveIcon, GoogleSheetsIcon } from './GoogleDriveIcons';
import { ExportRecord, ExportStatus } from './types';

interface GoogleDriveExportProps {
  projectId: string;
  className?: string;
}

// Dummy data for export history
const dummyExportHistory: ExportRecord[] = [
  {
    id: '1',
    fileLink: 'https://docs.google.com/spreadsheets/d/1abc...',
    exportDate: '2024-03-10T14:30:00Z',
    fileName: 'Project Data Export - March 10'
  },
  {
    id: '2',
    fileLink: 'https://docs.google.com/spreadsheets/d/2def...',
    exportDate: '2024-03-08T09:15:00Z',
    fileName: 'Project Data Export - March 8'
  },
  {
    id: '3',
    fileLink: 'https://docs.google.com/spreadsheets/d/3ghi...',
    exportDate: '2024-03-05T16:45:00Z',
    fileName: 'Project Data Export - March 5'
  }
];

const GoogleDriveExport: React.FC<GoogleDriveExportProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentFileLink, setCurrentFileLink] = useState<string | null>(null);

  // Get the latest export from dummy data
  const latestExport = dummyExportHistory[0];
  const hasMultipleExports = dummyExportHistory.length >= 2;

  // Function to save the file URL to your backend
  const saveFileUrl = async (fileData: { fileLink: string; fileName: string }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/drive-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileLink: fileData.fileLink,
          fileName: fileData.fileName,
          exportDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file URL');
      }

      // Update the current file link after successful save
      setCurrentFileLink(fileData.fileLink);
    } catch (err) {
      console.error('Error saving file URL:', err);
      setError('Failed to save export information');
    }
  };

  useEffect(() => {
    // Listen for messages from the popup window
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_DRIVE_UPLOAD_SUCCESS') {
        setExportStatus('success');
        setIsLoading(false);
        setError(null);

        // Save the file URL when export is successful
        await saveFileUrl({
          fileLink: event.data.data.file_link,
          fileName: event.data.data.file_name || `Project Export - ${new Date().toLocaleDateString()}`
        });
      } else if (event.data.type === 'GOOGLE_DRIVE_UPLOAD_ERROR') {
        setExportStatus('error');
        setError('Export failed. Please try again.');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId]); // Added projectId to dependencies

  // Fetch the current file URL when component mounts
  useEffect(() => {
    const fetchCurrentFileUrl = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/drive-export`);
        if (response.ok) {
          const data = await response.json();
          if (data.fileLink) {
            setCurrentFileLink(data.fileLink);
          }
        }
      } catch (err) {
        console.error('Error fetching file URL:', err);
      }
    };

    fetchCurrentFileUrl();
  }, [projectId]);

  const handleExport = () => {
    setIsLoading(true);
    setExportStatus('loading');
    setError(null);
    
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/download-csv/${projectId}/google-drive`,
      'Google Drive Export',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleOpenInDrive = () => {
    // Use currentFileLink if available, otherwise fall back to latestExport
    const fileLink = currentFileLink || latestExport?.fileLink;
    if (fileLink) {
      window.open(fileLink, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rest of the component remains the same...
  // (Keep all the JSX and other code exactly as it was)

  return (
    <div className="space-y-4 w-full">
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div className="flex items-center space-x-2 justify-between">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isLoading}
          className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <GoogleDriveIcon />
              <span>Export to Google Drive</span>
            </>
          )}
        </button>

        {/* Open in Drive Button - Show if we have currentFileLink or latestExport */}
        {(currentFileLink || latestExport) && (
          <button
            onClick={handleOpenInDrive}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F9D58]"
          >
            <GoogleSheetsIcon />
            <span>Open in Sheets</span>
          </button>
        )}
      </div>

      {/* Export History Dropdown */}
      {hasMultipleExports && (
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

          {/* Dropdown Content */}
          {showHistory && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
              <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {dummyExportHistory.slice(1).map((export_record) => (
                  <li
                    key={export_record.id}
                    className="hover:bg-gray-50 px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {export_record.fileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(export_record.exportDate)}
                        </p>
                      </div>
                      <a
                        href={export_record.fileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded bg-white hover:bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F9D58]"
                      >
                        <GoogleSheetsIcon />
                        <span>Open</span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-sm text-gray-500">
        <p>💡 Each export creates a new Google Sheets document with your current data.</p>
        <p>📊 Previously exported files show data from their export time.</p>
      </div>
    </div>
  );
};

export default GoogleDriveExport; 