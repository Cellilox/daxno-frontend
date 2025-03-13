'use client'

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_OCR_RAG_API_URL}/upload`, {
        method: "POST",
        headers: {
          "X-API-KEY": `${process.env.NEXT_PUBLIC_OCR_API_KEY}`,
          "X-OpenAI-Key": `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
        },
        body: formData, 
      });
      const result = await response.json();
      console.log(result)
      if(response.ok) {
        onClose()
      }
    } catch (error) {
      console.log('Error uploading a file', error)
    }
  };




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