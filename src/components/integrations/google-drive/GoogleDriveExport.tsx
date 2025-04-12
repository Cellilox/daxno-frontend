import React, { useState, useEffect } from 'react';
import { GoogleDriveIcon, GoogleSheetsIcon } from './GoogleDriveIcons';
import { ExportHistory } from './components/ExportHistory';
import { ErrorMessage } from './components/ErrorMessage';
import { HelpText } from './components/HelpText';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GoogleDriveExportProps, ExportStatus, ExportRecord } from './types';
import { dummyExportHistory } from './constants';
import { saveFileUrl, fetchCurrentFileUrl } from './utils/api';

const GoogleDriveExport: React.FC<GoogleDriveExportProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentFileLink, setCurrentFileLink] = useState<string | null>(null);

  // Get the latest export from dummy data
  const latestExport = dummyExportHistory[0];

  useEffect(() => {
    // Listen for messages from the popup window
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GOOGLE_DRIVE_UPLOAD_SUCCESS') {
        try {
          setExportStatus('success');
          setIsLoading(false);
          setError(null);

          // Save the file URL when export is successful
          await saveFileUrl(projectId, {
            fileLink: event.data.data.file_link,
            fileName: event.data.data.file_name || `Project Export - ${new Date().toLocaleDateString()}`
          });
          
          // Update the current file link after successful save
          setCurrentFileLink(event.data.data.file_link);
        } catch (err) {
          setExportStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to save export information');
          setIsLoading(false);
        }
      } else if (event.data.type === 'GOOGLE_DRIVE_UPLOAD_ERROR') {
        setExportStatus('error');
        setError('Export failed. Please try again.');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId]);

  // Fetch the current file URL when component mounts
  useEffect(() => {
    const fetchFileUrl = async () => {
      try {
        const fileLink = await fetchCurrentFileUrl(projectId);
        if (fileLink) {
          setCurrentFileLink(fileLink);
        }
      } catch (err) {
        console.error('Error fetching file URL:', err);
        // Don't show error to user for fetch failures as it's not critical
      }
    };

    fetchFileUrl();
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
    const fileLink = currentFileLink || latestExport?.fileLink;
    if (fileLink) {
      window.open(fileLink, '_blank');
    }
  };

  return (
    <div className="space-y-4 w-full">
      {error && <ErrorMessage message={error} />}

      <div className="flex items-center space-x-2 justify-between">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className={`inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          } ${className}`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <GoogleDriveIcon />
              <span>Export to Google Drive</span>
            </>
          )}
        </button>

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

      <ExportHistory 
        exportHistory={dummyExportHistory}
        onOpenFile={handleOpenInDrive}
      />

      <HelpText />
    </div>
  );
};

export default GoogleDriveExport; 