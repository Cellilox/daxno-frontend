'use client'

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { queryDocument, saveRecord, uploadFile} from '@/actions/record-actions';
import { loggedInUserId } from '@/actions/loggedin-user';
import { useRouter } from 'next/navigation';
import { createDocument } from '@/actions/documents-action';
import { messageType, messageTypeEnum } from '@/types';
import { FileStatus } from './types';

type MyDropzoneProps = {
  projectId: string;
  linkOwner: string;
  setIsVisible: (isVisible: boolean) => void;
  onMessageChange: (message: messageType) => void;
  plan: string;
};

export default function Dropzone({ projectId, linkOwner, setIsVisible, onMessageChange, plan }: MyDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkUploadAllowed, setIsBulkUploadAllowed] = useState<boolean>(true)
  const router = useRouter();
  // useEffect(() => {
  //   if(plan === "Professional" || plan === "Team") {
  //     setIsBulkUploadAllowed(true)
  //   }
  // }, [plan])

  // Single file upload handlers
  const handleSingleFileDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      const formData = new FormData();
      formData.append('file', selectedFile);
    }
  }, []);


  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    if (!file) {
      setIsLoading(false);
      setIsVisible(false);
      router.push(`/projects/${projectId}`);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Uploading file...',});
      const result = await uploadFile(formData, projectId);
      console.log('RE', JSON.stringify(result.detail))
      if(result.detail) {
        onMessageChange({type: messageTypeEnum.ERROR, text: `${JSON.stringify(result.detail)}`})
        setIsLoading(false)
        return;
      }
      const filename = result.filename;
      const orginal_file_name = result.original_filename;
      const file_key = result.Key;
      await handlequeryDocument(filename, orginal_file_name, file_key);
    } catch (error) {
      alert('Error uploading a file');
    }
  };

  const handlequeryDocument = async (fileName: string, orginal_file_name: string, file_key: string) => {
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Analysing...',});
      const response = await queryDocument(projectId, fileName);
      const recordPayload = {...response, orginal_file_name: orginal_file_name, file_key: file_key};
      console.log('Record Payload:', recordPayload)
      await saveData(recordPayload);
    } catch (error) {
      setIsLoading(false);
      onMessageChange({type: messageTypeEnum.NONE, text: '',});
    }
  };

  const saveData = async (data: any) => {
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Saving Record...',});
      const user_id = `${linkOwner? linkOwner : await loggedInUserId()}`
      const response = await saveRecord(data, user_id);
      console.log('Saved Record:', response)
      const doc_data = {
        filename: response.record.filename,
        page_number: response.record.pages
      };
      await saveDocument(doc_data);
    } catch (error) {
      setIsLoading(false);
      onMessageChange({type: messageTypeEnum.NONE, text: '',});
    }
  };
  const saveDocument = async (data: any) => {
    const user_id = `${linkOwner? linkOwner : await loggedInUserId()}`
    try {
      await createDocument(data, user_id, projectId);
      setIsVisible(false);
      onMessageChange({type: messageTypeEnum.NONE, text: '',});
    } catch (error) {
      console.log('Error saving document', error);
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
      const user_id = `${linkOwner? linkOwner : await loggedInUserId()}`
      // Upload File
      updateFileStatus({ status: 'uploading', progress: 25 });
      const formData = new FormData();
      formData.append('file', file);
      const uploadResult = await uploadFile(formData, projectId);
      if(uploadResult.detail) {
        onMessageChange({type: messageTypeEnum.ERROR, text: `${JSON.stringify(uploadResult.detail)}`})
        setIsLoading(false)
        return;
      }
      // Analyze Content
      updateFileStatus({ status: 'analyzing', progress: 50 });
      const analysisResult = await queryDocument(projectId, uploadResult.filename);
      
      // Save Record
      updateFileStatus({ status: 'saving', progress:  80});
      const recordPayload = {
        ...analysisResult,
        orginal_file_name: uploadResult.original_filename,
        file_key: uploadResult.Key
      };
      const savedResult = await saveRecord(recordPayload, user_id);
      const db_data = {
        filename: savedResult.record.filename,
        page_number: savedResult.record.pages
      }
      await createDocument(db_data, user_id, projectId);
      
      // Finalize
      updateFileStatus({
        status: 'complete',
        progress: 100,
        result: savedResult
      });

    } catch (error) {
      console.error(`Error processing ${fileStatus.file.name}:`, error);
      updateFileStatus({
        status: 'error',
        error: error instanceof Error ? error.message : 'Processing failed',
        progress: 100
      });
    }
  };

  // Add a useEffect to monitor when all files are complete
  useEffect(() => {
    if (files.length > 0) {
      const allComplete = files.every(f => f.status === 'complete');
      const hasErrors = files.some(f => f.status === 'error');
      
      if (allComplete && !isProcessing) {
        // Close the dropzone after a short delay to allow users to see the completion
        setTimeout(() => {
          setIsVisible(false);
          onMessageChange({type: messageTypeEnum.NONE, text: '',});
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
          className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
            !isBulkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Single Upload
        </button>
        <button
          type="button"
          onClick={() => setIsBulkMode(true)}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
            isBulkMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          disabled={!isBulkUploadAllowed}
        >
          Bulk Upload
          {!isBulkUploadAllowed && (
            <span className="ml-1 text-xs text-red-500">(Premium)</span>
          )}
        </button>
      </div>
    </div>
  );

  // Render single file upload UI
  const renderSingleUpload = () => (
    <div className="flex flex-col">
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
      
      {file && (
        <div className="mt-4 sticky bottom-0 bg-white py-3">
          {isLoading ? (
            <div className='flex justify-center items-center'>
              <div className="loader"></div>
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
    <div className="space-y-4">
      {renderUploadModeToggle()}
      {isBulkMode ? renderBulkUpload() : renderSingleUpload()}
    </div>
  );
}