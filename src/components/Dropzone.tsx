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
}

export default function MyDropzone({ user_id, sessionId, projectId, token, onClose }: MyDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
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
      closeModal()
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
      setMessage('Uploading...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        setFileName(result.filename)
        // setIsLoading(false)
        // closeModal()
        setMessage('')
        // router.push(`/projects/${projectId}`)
        // await submitRecordHistory(result.id)
        console.log('FFFFile', result.filename)
        await handleExtract(result.filename)
      
      } else {
        setIsLoading(false)
        const error = await response.json();
        alert(`Error: ${error.detail}`);
        setMessage('')
        // closeModal()
        // router.push(`/projects/${projectId}`)
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
      setMessage('Extracting...')
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
        const error = await response.json();
        console.error('Extract error response:', error);
        throw new Error(`Extract failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in extract:', error);
      setIsLoading(false);
      setMessage('');
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
      setMessage('Analysing')
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
      setMessage('');
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
      setMessage('Saving record')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/save`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Saving result:', result);
        setIsLoading(false);
        setMessage('');
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
      setMessage('');
      closeModal();
    }
  };


  // const submitRecordHistory = async (record: string) => {
  //   const data = {
  //     owner: user_id,
  //     file_name: file?.name,
  //     related_record: record
  //   }

  //   const headers = new Headers()
  //   headers.append('Authorization', `Bearer ${token}`)
  //   headers.append('Content-Type', 'application/json');

  //   if (sessionId) {
  //     headers.append('sessionId', sessionId)
  //   }
  //   try {
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records-history/`, {
  //       method: 'POST',
  //       headers: headers,
  //       body: JSON.stringify(data)
  //     });

  //     if(response.ok) {
  //       const result = await response.json();
  //       console.log('History record', result);
  //       return result;
  //     }
    
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }


  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} className="h-full justify-center items-center">
        <input {...getInputProps()} className="h-full" />
        {preview ? (
          <div className="relative h-full flex justify-center items-center rounded-md">
          <img src={preview} alt="Selected file preview" className="h-full object-contain rounded-md" />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center rounded-md">
            {/* Animated Scanning Line */}
            {isLoading && <div className="absolute w-full h-1 bg-red-500 animate-scanning-line"></div>}
          </div>
        </div>
        ) : isDragActive ? (
          <div className="mt-6 h-64 border-dashed border-2 border-blue-400 bg-blue-400 flex justify-center items-center rounded-md">
            <p>Drop the file here!</p>
          </div>
        ) : (
          <div className="mt-6 h-64 border-dashed border-2 border-gray-400 flex justify-center items-center rounded-md">
            <p>Drag and Drop a file, or click to select a file</p>
          </div>
        )}
      </div>
      {file && (
        <div className="mt-4 flex justify-between">
          {isLoading == true ?
          <div>
          <div className='flex justify-center items-center'>
            <div className="loader"></div>
          </div>
          <p>{message}</p>
        </div>:
        <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-3"
          >
            Upload File
          </button>
        }
        </div>
      )}
    </div>
  );
}