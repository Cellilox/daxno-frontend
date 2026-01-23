'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';
import { queryDocument, saveRecord, uploadFile, checkRecordStatus, getPresignedUrl } from '@/actions/record-actions';
import { loggedInUserId } from '@/actions/loggedin-user';
import { useRouter } from 'next/navigation';
import { createDocument } from '@/actions/documents-action';
import { messageType, messageTypeEnum } from '@/types';
import UsageLimitModal from '../modals/UsageLimitModal';
import { FileStatus } from './types';
import { getTransactions } from '@/actions/transaction-actions';
import { addOfflineFile } from '@/lib/db/indexedDB';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { CameraCapture } from '../Camera/CameraCapture';
import { Camera } from 'lucide-react';

type MyDropzoneProps = {
  projectId: string;
  linkOwner: string;
  setIsVisible: (isVisible: boolean) => void;
  onMessageChange: (message: messageType) => void;
  plan: string;
  onCameraToggle?: (active: boolean) => void;
};

export default function Dropzone({ projectId, linkOwner, setIsVisible, onMessageChange, plan, onCameraToggle }: MyDropzoneProps) {
  const { getToken, sessionId } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkUploadAllowed, setIsBulkUploadAllowed] = useState<boolean>(false);
  // New state for local feedback
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeFilename, setActiveFilename] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const { isOnline } = useSyncStatus();

  // Notify parent of camera state changes
  useEffect(() => {
    if (onCameraToggle) {
      onCameraToggle(showCamera);
    }
  }, [showCamera, onCameraToggle]);


  // Limit Modal State
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalMessage, setLimitModalMessage] = useState('');
  const [limitModalType, setLimitModalType] = useState<'AI_EXHAUSTED' | 'DAILY_LIMIT'>('DAILY_LIMIT');

  const router = useRouter();

  const checkLimitError = (errorMsg: string) => {
    const cleanMsg = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);

    if (cleanMsg.includes('AI_CREDITS_EXHAUSTED')) {
      setLimitModalType('AI_EXHAUSTED');
      setLimitModalMessage("All available platform credits are currently exhausted. Please try again later or Bring Your Own Key to continue instantly.");
      setLimitModalOpen(true);
      setIsLoading(false);
      return true;
    }
    if (cleanMsg.includes('On your Free plan') || cleanMsg.includes('DAILY_LIMIT_REACHED') || cleanMsg.includes('exceed the limit')) {
      setLimitModalType('DAILY_LIMIT');
      setLimitModalMessage(cleanMsg.replace(/"/g, ''));
      setLimitModalOpen(true);
      setIsLoading(false);
      return true;
    }
    return false;
  };
  useEffect(() => {
    // Enabled for testing on all plans
    setIsBulkUploadAllowed(true)
  }, [plan])

  // Single file upload handlers
  const handleSingleFileDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      // Reset states on new file drop
      setUploadError(null);
      setUploadStatus('');
    }
  }, []);

  useEffect(() => {
    // Initialize Socket.IO connection for real-time feedback (proxy-aware)
    if (!socketRef.current && projectId) {
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const socketPath = '/ws/records/sockets';

      socketRef.current = io(socketUrl, {
        path: socketPath,
        auth: { projectId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        withCredentials: true
      });

      const socket = socketRef.current;

      socket.on('ocr_start', (data: { status: string }) => {
        // Resurrect loading state if it was killed by a timeout but backend is still going
        setIsLoading(true);
        setUploadError(null);
        updateStatus('OCR Processing...', messageTypeEnum.INFO, 'Starting OCR...');
      });

      socket.on('ocr_progress', (data: { current: number; total: number }) => {
        setIsLoading(true);
        setUploadError(null);
        updateStatus('OCR Processing...', messageTypeEnum.INFO, `Page ${data.current} of ${data.total}`);
      });

      socket.on('ai_start', (data: { status: string }) => {
        setIsLoading(true);
        setUploadError(null);
        updateStatus('AI Analysis...', messageTypeEnum.INFO, 'Thinking...');
      });

      socket.on('record_created', (data: { record: any }) => {
        setIsLoading(false);
        setUploadError(null);
        updateStatus('Upload Complete!', messageTypeEnum.INFO, 'Success!');

        // Close modal after success
        setTimeout(() => {
          setIsVisible(false);
          onMessageChange({ type: messageTypeEnum.NONE, text: '' });
          router.refresh();
        }, 1500);
      });

      socket.on('processing_error', (data: { message: string }) => {
        let displayMsg = data.message;

        // Map technical errors to user friendly messages
        if (displayMsg.includes('Could not connect to the endpoint URL') || displayMsg.includes('EndpointConnectionError')) {
          displayMsg = "Network Error: Server could not reach AI provider. Please check your internet connection.";
        } else if (displayMsg.includes('ClientError') || displayMsg.includes('403')) {
          displayMsg = "Permission Error: Access denied to AI resources.";
        }

        setIsLoading(false);
        setUploadError(displayMsg);
        updateStatus('Processing Failed', messageTypeEnum.ERROR, 'Error');
        onMessageChange({ type: messageTypeEnum.ERROR, text: `${displayMsg}` });
      });

      socket.on('connect', async () => {
        console.log('Socket reconnected');

        // If we were loading, check if the record was actually finished OR failed while we were offline
        if (isLoading && activeFilename) {
          updateStatus('Reconnected. Checking status...', messageTypeEnum.INFO, 'Syncing...');

          // Check if record exists in DB (returns Record object or null)
          const record = await checkRecordStatus(projectId, activeFilename);

          if (record) {
            // Check internal status from answers field
            const status = record.answers?.['__status__'];

            if (status === 'error') {
              // 1. Processing Failed
              const errMsg = record.answers?.['message'] || "Unknown error";
              setIsLoading(false);
              setUploadError(`Processing Failed: ${errMsg}`);
              updateStatus('Failed', messageTypeEnum.ERROR);
              onMessageChange({ type: messageTypeEnum.ERROR, text: `Server Error: ${errMsg}` });

            } else if (status === 'processing') {
              // 2. Still Processing
              updateStatus('Processing in background...', messageTypeEnum.INFO, 'Server is busy...');
              // Logic: We just stay in isLoading=true and wait for socket events.
              // Polling fallback could be added here if socket is unreliable.

            } else {
              // 3. Success (Normal answers)
              setIsLoading(false);
              setUploadError(null);
              setActiveFilename(null);
              updateStatus('Upload Complete (Synced)!', messageTypeEnum.INFO, 'Success!');

              setTimeout(() => {
                setIsVisible(false);
                onMessageChange({ type: messageTypeEnum.NONE, text: '' });
                router.refresh();
              }, 1500);
            }
          } else {
            // Not found yet? It might be just starting or inconsistent.
            updateStatus('Connection restored', messageTypeEnum.INFO, 'Waiting for update...');
          }
        }
      });

      socket.on('disconnect', () => {
        if (isLoading) {
          updateStatus('Connection lost...', messageTypeEnum.INFO, 'Reconnecting...');
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [projectId, activeFilename]);

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB in bytes

  const updateStatus = (text: string, type: messageTypeEnum = messageTypeEnum.INFO, rightText?: string) => {
    if (type === messageTypeEnum.ERROR) {
      setUploadError(text);
      setUploadStatus(''); // Clear status on error
      // Do NOT bubble up errors to the parent (avoid duplicate top banner)
    } else {
      setUploadStatus(text);
      setUploadError(null);
      // Propagate INFO messages (for the top progress banner)
      onMessageChange({ type, text, rightText });
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setUploadError(null);

    if (!file) {
      setIsLoading(false);
      setIsVisible(false);
      router.push(`/projects/${projectId}`);
      return;
    }

    // ✅ NEW: Check if offline
    if (!isOnline || !navigator.onLine) {
      try {
        updateStatus('You are offline. Queueing for upload...', messageTypeEnum.INFO, 'Waiting for network...');

        await addOfflineFile(file, projectId);

        // Notify other components to refresh their display
        window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));

        updateStatus('Saved successfully! It will upload auto-sync once you are back online.', messageTypeEnum.INFO, 'Queued');

        // Clear file state and close modal immediately
        setFile(null);
        setPreview(null);
        setIsLoading(false);
        setIsVisible(false);
        onMessageChange({ type: messageTypeEnum.NONE, text: '' });

        return;
      } catch (err) {
        console.error('Failed to queue offline file:', err);
        updateStatus('Failed to save file for offline sync.', messageTypeEnum.ERROR);
        setIsLoading(false);
        return;
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      const msg = `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum allowed is 500 MB.`;
      updateStatus(msg, messageTypeEnum.ERROR);
      setIsLoading(false);
      return;
    }

    if (!projectId || projectId === 'undefined') {
      updateStatus('Project ID is missing. Please refresh the page.', messageTypeEnum.ERROR);
      setIsLoading(false);
      return;
    }

    try {
      updateStatus('Uploading file...', messageTypeEnum.INFO, '0%');

      console.log('[DEBUG] Calling getPresignedUrl for:', file.name, 'in project:', projectId, 'type:', file.type);
      const { upload_url, filename: uniqueFilename, key: fileKey } = await getPresignedUrl(file.name, projectId, file.type);

      if (!uniqueFilename || uniqueFilename === 'undefined') {
        console.error('[ERROR] handleUpload: received invalid filename from server:', uniqueFilename);
        throw new Error('Server returned invalid filename. Please try again.');
      }

      console.log('[DEBUG] handleUpload: getPresignedUrl success:', { upload_url, uniqueFilename, fileKey });

      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            updateStatus('Uploading to S3...', messageTypeEnum.INFO, `${percentComplete}%`);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[DEBUG] S3 Upload (single) successful');
            resolve({ filename: uniqueFilename, original_filename: file.name, key: fileKey });
          } else {
            console.error('[DEBUG] S3 Upload (single) failed status:', xhr.status);
            reject(new Error(`S3 Upload failed with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during S3 upload'));
        xhr.send(file);
      });

      const { filename: uploadedFilename, original_filename: originalName, key: finalKey } = result;
      console.log('[DEBUG] handleUpload proceeding to analysis with:', { uploadedFilename, originalName, finalKey });
      setActiveFilename(uploadedFilename);
      await handlequeryDocument(uploadedFilename, originalName, finalKey);
    } catch (error: any) {
      setIsLoading(false);
      const errMsg = error.message || 'Error uploading a file';
      if (!checkLimitError(errMsg)) {
        updateStatus(errMsg, messageTypeEnum.ERROR);
      }
    }
  };

  const handlequeryDocument = async (filename: string, original_filename: string, file_key: string) => {
    console.log('[DEBUG] handlequeryDocument start:', { filename, original_filename, file_key });

    if (!filename || filename === 'undefined') {
      console.error('[ERROR] handlequeryDocument called with invalid filename:', filename);
      updateStatus('Internal error: Invalid filename generated.', messageTypeEnum.ERROR);
      setIsLoading(false);
      return;
    }

    try {
      updateStatus('Queuing analysis...', messageTypeEnum.INFO, 'Processing in background...');

      // Call the endpoint which now returns immediately (Background Task)
      await queryDocument(projectId, filename, original_filename);

      // We do NOT wait for result or call saveRecord anymore. 
      // The backend background task handles everything and emits 'record_created'.
      // The socket listener we added will pick that up and finish the flow.
      updateStatus('Processing...', messageTypeEnum.INFO, 'Server is analyzing...');

    } catch (error: any) {
      setIsLoading(false);
      const errMsg = error.message || 'Error initializing processing';
      if (!checkLimitError(errMsg)) {
        updateStatus(errMsg, messageTypeEnum.ERROR);
      }
    }
  };

  const saveData = async (data: any) => {
    try {
      updateStatus('Saving Record...');
      const user_id = `${linkOwner ? linkOwner : await loggedInUserId()}`
      const response = await saveRecord(data, user_id);
      const doc_data = {
        filename: response.record.filename,
        page_number: response.record.pages
      };
      await saveDocument(doc_data);
    } catch (error: any) {
      setIsLoading(false);
      const errMsg = error.message || 'Error saving record';
      updateStatus(errMsg, messageTypeEnum.ERROR);
    }
  };

  const saveDocument = async (data: any) => {
    const user_id = `${linkOwner ? linkOwner : await loggedInUserId()}`
    try {
      await createDocument(data, user_id, projectId);
      setIsVisible(false);
      // Clear messages on success
      onMessageChange({ type: messageTypeEnum.NONE, text: '', });
    } catch (error: any) {
      console.log('Error saving document', error);
      setIsLoading(false);
      updateStatus('Error finalizing document', messageTypeEnum.ERROR);
    }
  };

  // Bulk upload handlers
  const handleBulkDrop = useCallback((acceptedFiles: File[]) => {
    // If multiple files are dropped and isBulkUploadAllowed is false, show error
    if (acceptedFiles.length > 1 && !isBulkUploadAllowed) {
      onMessageChange({
        type: messageTypeEnum.ERROR,
        text: 'Bulk uploads are not allowed in your current plan. Please upgrade to upload multiple files.'
      });
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, [isBulkUploadAllowed, onMessageChange]);

  const processSingleFile = async (fileStatus: FileStatus) => {
    const updateFileStatus = (update: Partial<FileStatus>) => {
      setFiles(prev => prev.map(f =>
        f.file === fileStatus.file ? { ...f, ...update } : f
      ));
    };

    try {
      const { file } = fileStatus;

      // Check if offline
      if (!isOnline || !navigator.onLine) {
        console.log('[Bulk Upload] Offline - queuing file:', file.name);
        updateFileStatus({ status: 'pending', progress: 0 });
        await addOfflineFile(file, projectId);
        window.dispatchEvent(new CustomEvent('daxno:offline-files-updated'));
        updateFileStatus({ status: 'complete', progress: 100, result: { message: "Queued for sync when online" } });
        return;
      }

      // 1. Get Presigned URL
      updateFileStatus({ status: 'uploading', progress: 10 });
      console.log('[DEBUG] processSingleFile: Calling getPresignedUrl for:', file.name, 'type:', file.type);
      const { upload_url, filename, key } = await getPresignedUrl(file.name, projectId, file.type);

      if (!filename || filename === 'undefined') {
        throw new Error("Server returned invalid filename for " + file.name);
      }

      console.log('[DEBUG] processSingleFile: getPresignedUrl result:', { upload_url, filename, key });

      // 2. Upload to S3
      updateFileStatus({ status: 'uploading', progress: 20 });
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = 20 + Math.round((e.loaded / e.total) * 30);
            updateFileStatus({ status: 'uploading', progress: percent });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('[DEBUG] S3 Upload (bulk) successful');
            resolve(null);
          } else {
            console.error('[DEBUG] S3 Upload (bulk) failed status:', xhr.status);
            reject(new Error('S3 upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(file);
      });

      // 3. Trigger Analysis (Async)
      updateFileStatus({ status: 'analyzing', progress: 60 });
      console.log('[DEBUG] processSingleFile triggering queryDocument with:', { filename, original: file.name });
      await queryDocument(projectId, filename, file.name);

      updateFileStatus({ status: 'analyzing', progress: 60, result: { message: "Processing in background" } });

    } catch (error) {
      console.error(`Error processing ${fileStatus.file.name}:`, error);
      const errMsg = error instanceof Error ? error.message : 'Processing failed';

      if (!checkLimitError(errMsg)) {
        updateFileStatus({
          status: 'error',
          error: errMsg,
          progress: 100
        });
      } else {
        updateFileStatus({
          status: 'error',
          error: 'Limit Reached',
          progress: 100
        });
      }
    }
  };

  // Monitor when all files are complete
  useEffect(() => {
    if (files.length > 0) {
      const allComplete = files.every(f => f.status === 'complete' || f.status === 'error');

      if (allComplete && !isProcessing) {
        console.log('[Bulk Upload] All files complete, closing popup...');
        setTimeout(() => {
          setFiles([]); // Clear files list
          setIsVisible(false);
          onMessageChange({ type: messageTypeEnum.NONE, text: '', });
        }, 1500);
      }
    }
  }, [files, isProcessing, setIsVisible, onMessageChange]);

  const handleProcessAll = async () => {
    setIsProcessing(true);
    try {
      // Process files sequentially to avoid overloading
      for (const fileStatus of files.filter(f => f.status === 'pending')) {
        await processSingleFile(fileStatus);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps: getSingleRootProps, getInputProps: getSingleInputProps, isDragActive: isSingleDragActive } = useDropzone({
    onDrop: handleSingleFileDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  const { getRootProps: getBulkRootProps, getInputProps: getBulkInputProps, isDragActive: isBulkDragActive } = useDropzone({
    onDrop: handleBulkDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 10,
    multiple: true
  });

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
      default: return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusLabel = (status: FileStatus['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading...';
      case 'extracting': return 'Extracting text...';
      case 'analyzing': return 'Analyzing content...';
      case 'analyzed': return 'Analysis complete';
      case 'saving': return 'Saving record...';
      case 'complete': return 'Completed';
      case 'error': return 'Error occurred';
      default: return 'Pending';
    }
  };

  // Render the upload mode toggle
  const renderUploadModeToggle = () => (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          type="button"
          onClick={() => setIsBulkMode(false)}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!isBulkMode
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
        >
          Single Upload
        </button>
        <button
          type="button"
          onClick={() => setIsBulkMode(true)}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${isBulkMode
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          disabled={!isBulkUploadAllowed}
        >
          Bulk Upload
          {!isBulkUploadAllowed && (
            <span className="ml-1 text-xs text-red-500">(professional)</span>
          )}
        </button>
      </div>
    </div>
  );

  // Render single file upload UI
  const renderSingleUpload = () => (
    <div className="flex flex-col">
      {showCamera ? (
        <CameraCapture
          projectId={projectId}
          onClose={() => setShowCamera(false)}
          onCapture={(photoFile) => {
            setShowCamera(false);
            setFile(photoFile);
            setPreview(URL.createObjectURL(photoFile));
            updateStatus('Photo captured! Click "Upload File" to start scanning.', messageTypeEnum.INFO, 'Captured');
          }}
        />
      ) : (
        <div {...getSingleRootProps()} className="flex flex-col">
          <input {...getSingleInputProps()} />
          {preview ? (
            <div className="relative flex justify-center items-center rounded-md">
              {file?.type === 'application/pdf' ? (
                <div className="h-[50vh] w-full flex flex-col items-center justify-center border border-gray-200 rounded-md">
                  <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
                    <FileIcon size={48} className="text-blue-500 mb-3" />
                    <p className="text-gray-800 font-medium text-lg truncate max-w-xs">
                      {file?.name}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <p className="text-gray-500 text-sm">PDF Document</p>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Selected file preview"
                  className="max-h-[50vh] object-contain rounded-md"
                />
              )}

              <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center rounded-md">
                {isLoading && <div className="absolute w-full h-1 bg-red-500 animate-scanning-line"></div>}
              </div>
            </div>
          ) : isSingleDragActive ? (
            <div className="h-64 border-dashed border-2 border-blue-500 flex justify-center items-center rounded-md bg-blue-50 transition-colors">
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-blue-500 text-center font-medium">Drop the file here!</p>
                <p className="text-sm text-gray-500">PDF, PNG, JPG/JPEG</p>
              </div>
            </div>
          ) : (
            <div className="h-64 border-dashed border-2 border-gray-400 hover:border-blue-500 hover:bg-blue-50 transition-colors flex justify-center items-center rounded-md">
              <div className="flex flex-col items-center justify-center gap-3">
                <p className="text-center font-medium">Drag and Drop a file, or click to select</p>
                <p className="text-sm text-gray-500">PDF, PNG, JPG/JPEG</p>
              </div>
            </div>
          )}
        </div>
      )}

      {!showCamera && !file && (
        <div className="mt-4">
          <button
            onClick={() => setShowCamera(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 font-medium px-4 py-3 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Take a Photo / Scan
          </button>
        </div>
      )}

      {file && (
        <div className="mt-4 sticky bottom-0 bg-white py-3">
          {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}

          {isLoading ? (
            <div className='flex flex-col justify-center items-center gap-2'>
              <div className="loader"></div>
              {uploadStatus && (
                <p className="text-sm text-gray-600 animate-pulse">{uploadStatus}</p>
              )}
            </div>
          ) : (
            <button
              onClick={handleUpload}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Upload File
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Render bulk upload UI
  const renderBulkUpload = () => (
    <div className="space-y-6">
      <div {...getBulkRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center 
        ${isBulkDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
        ${files.length > 0 ? 'h-32' : 'h-64'} transition-colors`}>
        <input {...getBulkInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <div>
            <p className="font-medium text-gray-900">
              Drag & drop files here, or click to select
            </p>
            <div className="flex flex-col items-center mt-1">
              <p className="text-sm text-gray-500">
                PDF, PNG, JPG/JPEG (Max 10 files at once)
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span className="flex items-center">
                  <FileIcon className="w-3 h-3 mr-1" /> Documents
                </span>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Images
                </span>
              </div>
            </div>
            {!isBulkUploadAllowed && (
              <p className="text-sm text-red-500 mt-2">
                Bulk uploads are not allowed in your current plan. Please upgrade to upload multiple files.
              </p>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">{files.length} files selected</h3>
            <button
              onClick={handleProcessAll}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Start Processing'}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((fileStatus, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  {/* Preview Thumbnail */}
                  <div className="flex-shrink-0">
                    {fileStatus.file.type === 'application/pdf' ? (
                      <FileIcon className="w-12 h-12 text-red-500" />
                    ) : (
                      <img
                        src={fileStatus.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium truncate max-w-[200px]">
                        {fileStatus.file.name}
                      </span>
                      {getStatusIcon(fileStatus.status)}
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${fileStatus.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        {getStatusLabel(fileStatus.status)}
                      </span>
                      {fileStatus.error && (
                        <span className="text-red-500 truncate max-w-[200px]">
                          {fileStatus.error}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {renderUploadModeToggle()}
        {isBulkMode ? renderBulkUpload() : renderSingleUpload()}
      </div>

      <UsageLimitModal
        isOpen={limitModalOpen}
        onClose={() => {
          setLimitModalOpen(false);
          setIsVisible(false); // Close the parent dropzone modal
          onMessageChange({ type: messageTypeEnum.NONE, text: '' }); // Clear the status message
          setUploadStatus(''); // Clear local status
        }}
        message={limitModalMessage}
        type={limitModalType}
      />
    </>
  );
}