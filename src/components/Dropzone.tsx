'use client'

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useModalContext } from './context/modal';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';
type MyDropzoneProps = {
  user_id: string | undefined
  sessionId: string | undefined
  projectId: string
  token: string | null
  onClose: () => void
  onMessageChange: (message: string) => void
}

export default function MyDropzone({ user_id, sessionId, projectId, token, onClose, onMessageChange }: MyDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { closeModal } = useModalContext();
  const router = useRouter()
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      console.log('FileOOOO', selectedFile)
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

    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)

    if (sessionId) {
      headers.append('sessionId', sessionId)
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log('FORM', formData)

    console.log(file, formData)

    try {
      onMessageChange('Uploading...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        await handleExtract(result.filename)
      } else {
        setIsLoading(false)
        const error = await response.json();
        alert(`Error: ${error.detail}`);
        onMessageChange('')
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleExtract = async (fileName: string) => {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)

    if (sessionId) {
      headers.append('sessionId', sessionId)
    }

    try {
      onMessageChange('Extracting...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/extract?filename=${fileName}`, {
        method: 'POST',
        headers: headers,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Raw extract result:', result);
        console.log('textract_response type:', typeof result.textract_response);
        console.log('textract_response:', result.textract_response);
        
        if (!result.textract_response) {
          throw new Error('No textract_response in result');
        }
        await handleAnalyse(fileName, result.textract_response)
      } else {
        setIsLoading(false)
        const error = await response.json();
        console.error('Extract error response:', error);
        throw new Error(`Extract failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in extract:', error);
      setIsLoading(false);
      onMessageChange('');
      closeModal();
    }
  };

  const handleAnalyse = async (fileName: string, extractedResponse: any) => {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)
    headers.append('Content-Type', 'application/json');
    if (sessionId) {
      headers.append('sessionId', sessionId)
    }

    const requestBody = {...extractedResponse}

    try {
      onMessageChange('Analysing')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/${projectId}/identify-fields?filename=${fileName}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Analysis success:', result);
        await saveData(result.data)
      } else {
        const errorText = await response.text();
        console.error('Analysis error response:', errorText);
        console.error('Response status:', response.status);
        throw new Error(`Analysis failed: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in analysis:', error);
      setIsLoading(false);
      onMessageChange('');
      closeModal();
    }
  };

  const saveData = async (data: any) => {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)
    headers.append('Content-Type', 'application/json');
    if (sessionId) {
      headers.append('sessionId', sessionId)
    }

    try {
      onMessageChange('Saving record')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/save`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Saving result:', result);
        const historyResult = await submitRecordHistory(result.record)
        console.log("HIstorResult", historyResult)
        setIsLoading(false);
        onMessageChange('');
        onClose();
        closeModal();
        router.push(`/projects/${projectId}`);
      } else {
        const errorText = await response.text();
        console.error('Saving error response:', errorText);
        console.error('Response status:', response.status);
        throw new Error(`Saving failed: ${errorText || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in saving:', error);
      setIsLoading(false);
      onMessageChange('');
      closeModal();
    }
  };

  const submitRecordHistory = async (record: string) => {
    const data = {
      owner: user_id,
      file_name: file?.name,
      related_record: JSON.stringify(record)
    }

    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)
    headers.append('Content-Type', 'application/json');

    if (sessionId) {
      headers.append('sessionId', sessionId)
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records-history/`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      // if(!response.ok) {
      //   alert('An error occured')
      //   return
      // }
        const result = await response.json();
        console.log('History record', result);
    
    } catch (error) {
      console.log(error)
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