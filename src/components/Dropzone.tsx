'use client'

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

type MyDropzoneProps = {
  sessionId: string | undefined
  projectId: string
  token: string | null
}

export default function MyDropzone({ sessionId, projectId, token }: MyDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter()
  console.log(file)
  const [preview, setPreview] = useState<string | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    if (!file) {
      setIsLoading(false)
      router.push(`/projects/${projectId}`)
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    console.log('FORM', formData)

    const headers = new Headers()
    headers.append('Authorization', `Bearer ${token}`)

    if (sessionId) {
      headers.append('sessionId', sessionId)
    }

    try {
      const response = await fetch(`http://localhost:8000/records/${projectId}`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        setIsLoading(false)
        // alert('File uploaded and processed successfully');
        router.push(`/projects/${projectId}`)
      } else {
        setIsLoading(false)
        const error = await response.json();
        alert(`Error: ${error.detail}`);
        router.push(`/projects/${projectId}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div>
      <div {...getRootProps()} className="h-full">
        <input {...getInputProps()} className="h-full" />
        {preview ? (
          <div className="h-full flex justify-center items-center rounded-md">
            <img src={preview} alt="Selected file preview" className="h-full object-contain" />
          </div>
        ) : isDragActive ? (
          <div className="h-full border-dashed border-2 border-blue-400 bg-blue-400 flex justify-center items-center rounded-md">
            <p>Drop the file here!</p>
          </div>
        ) : (
          <div className="h-full border-dashed border-2 border-gray-400 flex justify-center items-center rounded-md">
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
          <p>Processing...</p>
        </div>:
        <button
            onClick={handleSubmit}
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