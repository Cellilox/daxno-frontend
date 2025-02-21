'use client'

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { analyseText, extractText, saveRecord, saveRecordHistory, uploadFile } from '@/actions/record-actions';
type MyDropzoneProps = {
  user_id: string | undefined
  projectId: string
  onClose: () => void
  onMessageChange: (message: string) => void
}

export default function MyDropzone({ user_id, projectId, onClose, onMessageChange }: MyDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter()
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    if (!file) {
      setIsLoading(false)
      onClose()
      router.push(`/projects/${projectId}`)
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      onMessageChange('Uploading...')
      const result = await uploadFile(formData)
      await handleExtract(result.filename)
    } catch (error) {
      alert('Error uploading a file')
    }
  };

  const handleExtract = async (fileName: string) => {
    try {
      onMessageChange('Extracting...')
      const response = await extractText(fileName)
      await handleAnalyse(fileName, response.textract_response)
    } catch (error) {
      console.error('Error in extract:', error);
      setIsLoading(false);
      onMessageChange('');
    }
  };

  const handleAnalyse = async (fileName: string, extractedResponse: any) => {
    const requestBody = {...extractedResponse}

    try {
      onMessageChange('Analysing')
      const response = await analyseText(projectId, fileName, requestBody)
      const analysedData = response.data
      console.log('ANALYSED_DATA', analysedData)
      await saveData(analysedData)
    } catch (error) {
      console.error('Error in analysis:', error);
      setIsLoading(false);
      onMessageChange('');
    }
  };

  const saveData = async (data: any) => {
    try {
      onMessageChange('Saving record')
      const response = await saveRecord(data)
      console.log('RECORD', response.record)
      await submitRecordHistory(response.record)
    } catch (error) {
      console.error('Error in saving:', error);
      setIsLoading(false);
      onMessageChange('');
    }
  };

  const submitRecordHistory = async (record: string) => {
    const data = {
      owner: user_id,
      file_name: file?.name,
      related_record: JSON.stringify(record)
    }
    try {
      await saveRecordHistory(data)
      onClose()
    } catch (error) {
      console.log('Error saving record in history', error)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col">
      <div {...getRootProps()} className="flex flex-col">
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative flex justify-center items-center rounded-md">
            <img 
              src={preview} 
              alt="Selected file preview" 
              className="max-h-[50vh] object-contain rounded-md" 
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center rounded-md">
              {/* Animated Scanning Line */}
              {isLoading && <div className="absolute w-full h-1 bg-red-500 animate-scanning-line"></div>}
            </div>
          </div>
        ) : isDragActive ? (
          <div className="h-64 border-dashed border-2 border-blue-400 bg-blue-400 flex justify-center items-center rounded-md">
            <p>Drop the file here!</p>
          </div>
        ) : (
          <div className="h-64 border-dashed border-2 border-gray-400 flex justify-center items-center rounded-md">
            <p>Drag and Drop a file, or click to select a file</p>
          </div>
        )}
      </div>
      
      {/* Move button outside of scroll area */}
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