import React, { useState, useEffect } from 'react';
import { GoogleDriveIcon, GoogleSheetsIcon } from './GoogleDriveIcons';
import { ExportHistory } from './components/ExportHistory';
import { ErrorMessage } from './components/ErrorMessage';
import { HelpText } from './components/HelpText';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GoogleDriveExportProps, ExportStatus, ExportRecord } from './types';
import { dummyExportHistory } from './constants';
import { saveFileUrl, fetchCurrentFileUrl, getGoogleDriveAuthUrl } from '@/actions/google-drive-actions';

const GoogleDriveExport: React.FC<GoogleDriveExportProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentFileLink, setCurrentFileLink] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);

  // Get the latest export from history
  const latestExport = exportHistory[0] || null;

  useEffect(() => {
    // Listen for messages from the popup window
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data) return;

      try {
        const content = event.data;
        if (content.error) {
          setExportStatus('error');
          setError(content.error);
          setIsLoading(false);
          return;
        }

        if (content.file_link && content.file_id) {
          setExportStatus('success');
          setIsLoading(false);
          setError(null);

          const fileName = `Project Export - ${new Date().toLocaleDateString()}`;
          
          // Save the file URL when export is successful
          await saveFileUrl(projectId, {
            fileLink: content.file_link,
            fileName: fileName
          });
          
          // Update the current file link and export history
          setCurrentFileLink(content.file_link);
          
          // Add to export history
          const newExport: ExportRecord = {
            id: content.file_id,
            fileLink: content.file_link,
            fileName: fileName,
            exportDate: new Date().toISOString()
          };
          
          setExportHistory(prevHistory => [newExport, ...prevHistory]);
        }
      } catch (err) {
        setExportStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to save export information');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [projectId]);

  // Fetch the current file URL and export history when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current file link
        const fileLink = await fetchCurrentFileUrl(projectId);
        if (fileLink) {
          setCurrentFileLink(fileLink);
        }

        // TODO: Fetch export history from the backend
        // For now, using dummy data
        setExportHistory(dummyExportHistory);
      } catch (err) {
        console.error('Error fetching data:', err);
        // Don't show error to user for fetch failures as it's not critical
      }
    };

    fetchData();
  }, [projectId]);

  const handleExport = async () => {
    setIsLoading(true);
    setExportStatus('loading');
    setError(null);

    try {
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const data = await getGoogleDriveAuthUrl(projectId);
      if (!data || !data.auth_url) {
        throw new Error('Failed to get Google Drive auth URL');
      }

      window.open(
        data.auth_url,
        'Google Drive Export',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (err) {
      setExportStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to get Google Drive auth URL');
      setIsLoading(false);
    }
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
              <GoogleDriveIcon className="w-5 h-5 mr-2" />
              <span>Export to Google Drive</span>
            </>
          )}
        </button>

        {(currentFileLink || latestExport) && (
          <button
            onClick={handleOpenInDrive}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F9D58]"
          >
            <GoogleSheetsIcon className="w-5 h-5 mr-2" />
            <span>Open in Sheets</span>
          </button>
        )}
      </div>

      <ExportHistory 
        exportHistory={exportHistory}
        onOpenFile={handleOpenInDrive}
      />

      <HelpText />
    </div>
  );
};

export default GoogleDriveExport;