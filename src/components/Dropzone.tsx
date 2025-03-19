'use client'

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { batchQuery, uploadFile } from '@/actions/record-actions';
import { getColumns } from '@/actions/column-actions';
import { FileIcon } from 'lucide-react';

type MyDropzoneProps = {
  projectId: string
  linkOwner: string
  setIsVisible: (isVisible: boolean) => void
  onMessageChange: (message: string) => void
}

type BatchFieldsType = {
  name: string, 
  description: string | null, 
  hidden_id: string
}

export default function MyDropzone({ projectId, linkOwner, setIsVisible, onMessageChange }: MyDropzoneProps) {
  console.log('LIIII', linkOwner)

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type === 'application/pdf') {
        setPreview(selectedFile.name);
      } else {
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  }, []);

  const getColumnsFunc = async (proj_id: string) => {
    const columns = await getColumns(proj_id);
    console.log("Original columns:", columns);
    const fields = columns.map(({ name, description, hidden_id }: BatchFieldsType) => ({
      name,
      description: description || "", 
      hiddenId: hidden_id 
    }));
    return fields
  }

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    if (!file) {
      setIsLoading(false);
      setIsVisible(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file, file.name);
      formData.append('project_id', projectId);
      
      console.log("Sending file:", file.name);
      onMessageChange('Uploading...')
      const result = await uploadFile(formData, projectId);
      console.log("Upload result:", result);
      if(linkOwner && linkOwner) {
        onMessageChange('')
        setIsVisible(false)
        const fields = await getColumnsFunc(projectId)
        const data = { fields }; 
        await batchQuery(data, file.name, projectId);
      }

      if (result && !linkOwner) {
        onMessageChange('Analyzing...');
        const fields = await getColumnsFunc(projectId)
        const data = { fields }; 
        await batchQuery(data, file.name, projectId);
        setIsVisible(false);
        onMessageChange('');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      onMessageChange('Error uploading file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  const isPDF = file?.type === 'application/pdf';

  return (
    <div className="flex flex-col">
      <div {...getRootProps()} className="flex flex-col">
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative flex justify-center items-center rounded-md">
            {isPDF ? (
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
        ) : isDragActive ? (
          <div className="h-64 border-dashed border-2 border-blue-500 flex justify-center items-center rounded-md">
            <p className="text-blue-500 text-center p-2">Drop the file here!</p>
          </div>
        ) : (
          <div className="h-64 border-dashed border-2 border-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors flex justify-center items-center rounded-md">
            <p className="text-center p-2">Drag and Drop a file, or click to select a file</p>
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
}