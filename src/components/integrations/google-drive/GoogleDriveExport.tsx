'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleDriveIcon, GoogleSheetsIcon } from './GoogleDriveIcons';
import { ExportHistory } from './ui/ExportHistory';
import { ErrorMessage } from './ui/ErrorMessage';
import { HelpText } from './ui/HelpText';
import { LoadingSpinner } from './ui/LoadingSpinner';
import {
  GoogleDriveExportProps,
  ExportStatus,
  ExportRecord,
} from './types';

import {
  getGoogleDriveAuthUrl,
  checkDriveStatus,
  directUploadToDrive,
  saveGoogleExportHistory,
  fetchGoogleExportsHistory,
  DisconnectDrive,
} from '@/actions/google-drive-actions';

const GoogleDriveExport: React.FC<GoogleDriveExportProps> = ({
  projectId,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  // 1) Check authentication status on mount
  useEffect(() => {
    (async () => {
      try {
        getExports();
        const { authenticated } = await checkDriveStatus();
        setIsAuthenticated(authenticated);
      } catch {
        setIsAuthenticated(false);
      }
    })();
  }, []);

  // 2) Fetch existing export history link & (dummy) history

  const getExports = async () => {
    const data = await fetchGoogleExportsHistory(projectId)
    setExports(data);
  }

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
        await saveGoogleExportHistory(projectId, file_link);
        getExports();
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
        const result = await directUploadToDrive(projectId);
        if (!result || !result.file_id || !result.file_link) {
          throw new Error('Upload failed');
        }
        const { file_id, file_link } = result;
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
        setIsAuthenticated(true);
      }
    } catch (err) {
      setExportStatus('error');
      setError(err instanceof Error ? err.message : 'Export failed');
      setIsLoading(false);
    }
  };

  // 6) Open in Sheets
  const handleOpenInDrive = () => {
    const link = exports[0]?.file_link;
    if (link) window.open(link, '_blank');
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await DisconnectDrive();
      setIsAuthenticated(false);
      setIsDisconnecting(false);
    } catch (error) {
      alert('Error disconnecting Google Drive');
    }
  }

  return (
    <div className="space-y-4 w-full">
      {error && <ErrorMessage message={error} />}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-900">Export to Google Drive</h3>
        {isAuthenticated && (
          <>
            {isDisconnecting ?
              <div className="flex items-center justify-end">
                <LoadingSpinner />
                <span className="text-base font-medium text-gray-900">
                  Disconnecting...
                </span>
              </div> :
              <h3 onClick={handleDisconnect} className="text-base font-medium text-gray-900 cursor-pointer underline">Disconnect</h3>
            }
          </>
        )}
      </div>
      <div className="flex items-center justify-between space-x-2">
        <button
          onClick={handleExport}
          disabled={isLoading}
          className={`
            inline-flex items-center justify-center
            px-5 py-2.5 border border-gray-300 text-base font-medium
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

        {exports?.length >= 1 && (
          <button
            onClick={handleOpenInDrive}
            className="
              inline-flex items-center px-5 py-2.5 border border-gray-300 text-base
              font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F9D58]
            "
          >
            <GoogleSheetsIcon className="w-5 h-5 mr-3" />
            <span>Open in Sheets</span>
          </button>
        )}
      </div>

      <ExportHistory
        exportHistory={exports}
        onOpenFile={handleOpenInDrive}
      />

      <HelpText />
    </div>
  );
};

export default GoogleDriveExport;
