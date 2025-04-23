'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleDriveIcon, GoogleSheetsIcon } from './GoogleDriveIcons';
import { ExportHistory } from './components/ExportHistory';
import { ErrorMessage } from './components/ErrorMessage';
import { HelpText } from './components/HelpText';
import { LoadingSpinner } from './components/LoadingSpinner';
import {
  GoogleDriveExportProps,
  ExportStatus,
  ExportRecord,
} from './types';
import { dummyExportHistory } from './constants';
import {
  getGoogleDriveAuthUrl,
  checkDriveStatus,
  directUploadToDrive,
  saveFileUrl,
  fetchCurrentFileUrl,
} from '@/actions/google-drive-actions';

const GoogleDriveExport: React.FC<GoogleDriveExportProps> = ({
  projectId,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [currentFileLink, setCurrentFileLink] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 1) Check authentication status on mount
  useEffect(() => {
    (async () => {
      try {
        const { authenticated } = await checkDriveStatus();
        setIsAuthenticated(authenticated);
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // 2) Fetch existing file link & (dummy) history
  useEffect(() => {
    (async () => {
      try {
        const link = await fetchCurrentFileUrl(projectId);
        if (link) setCurrentFileLink(link);
      } catch {
        // ignore
      }
      setExportHistory(dummyExportHistory);
    })();
  }, [projectId]);

  // 3) Unified response handler
  const handleResponse = useCallback(
    async (payload: { file_id?: string; file_link?: string; error?: string }) => {
      const { file_id, file_link, error: errPayload } = payload;
      if (errPayload) {
        setExportStatus('error');
        setError(errPayload);
        setIsLoading(false);
        return;
      }
      if (file_id && file_link) {
        setExportStatus('success');
        setError(null);
        setIsLoading(false);

        const fileName = `Project Export - ${new Date().toLocaleDateString()}`;
        await saveFileUrl(projectId, { fileLink: file_link, fileName });

        setCurrentFileLink(file_link);
        const newExport: ExportRecord = {
          id: file_id,
          fileLink: file_link,
          fileName,
          exportDate: new Date().toISOString(),
        };
        setExportHistory(prev => [newExport, ...prev]);

        setIsAuthenticated(true);
      }
    },
    [projectId]
  );

  // 4) Listen for popup messages
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (!event.data) return;
      handleResponse(event.data);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [handleResponse]);

  // 5) Export button click
  const handleExport = async () => {
    setIsLoading(true);
    setExportStatus('loading');
    setError(null);

    try {
      if (isAuthenticated) {
        // Direct‐upload flow
        const result = await directUploadToDrive(projectId);
        if (!result || !result.file_id || !result.file_link) {
          throw new Error('Upload failed');
        }
        const { file_id, file_link } = result;
        console.log('Direct upload result:', { file_id, file_link });
        // Feed into the same handler
        await handleResponse({ file_id, file_link });

      } else {
        // OAuth popup flow
        const { auth_url } = await getGoogleDriveAuthUrl(projectId);
        const width = 600, height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        window.open(
          auth_url!,
          'Google Drive Export',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      }
    } catch (err) {
      setExportStatus('error');
      setError(err instanceof Error ? err.message : 'Export failed');
      setIsLoading(false);
    }
  };

  // 6) Open in Sheets
  const handleOpenInDrive = () => {
    const link = currentFileLink || exportHistory[0]?.fileLink;
    if (link) window.open(link, '_blank');
  };

  return (
    <div className="space-y-4 w-full">
      {error && <ErrorMessage message={error} />}

      <div className="flex items-center justify-between space-x-2">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className={`
            inline-flex items-center justify-center
            px-4 py-2 border border-gray-300 text-sm font-medium
            rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4]
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}
          `}
        >
          {isLoading ? (
            <>
              <LoadingSpinner />
              <span>
                {isAuthenticated ? 'Uploading…' : 'Authorizing…'}
              </span>
            </>
          ) : (
            <>
              <GoogleDriveIcon className="w-5 h-5 mr-2" />
              <span>
                {isAuthenticated
                  ? 'Upload to Google Drive'
                  : 'Authorize & Export'}
              </span>
            </>
          )}
        </button>

        {(currentFileLink || exportHistory.length > 0) && (
          <button
            onClick={handleOpenInDrive}
            className="
              inline-flex items-center px-4 py-2 border border-gray-300 text-sm
              font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F9D58]
            "
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
