'use client'

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileIcon } from 'lucide-react';
import { analyseText, checkFileType, extractText, queryDocument, saveRecord, uploadFile } from '@/actions/record-actions';
import { useRouter } from 'next/navigation';
import { createDocument } from '@/actions/documents-action';
import { messageType, messageTypeEnum } from '@/types';

type MyDropzoneProps = {
  projectId: string
  linkOwner: string
  setIsVisible: (isVisible: boolean) => void
  onMessageChange: (message: messageType) => void
}


export default function MyDropzone({ projectId, linkOwner, setIsVisible, onMessageChange }: MyDropzoneProps) {
  console.log('LIIII', linkOwner)

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter()
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      const formData = new FormData();
      formData.append('file', selectedFile);
      handleCheckFileType(formData)
    }

  }, []);

  const handleCheckFileType = async (formData: any) => {
    const res = await checkFileType(formData)
    console.log('CHECK_FILE_TYPE', res)
    if(res.document_type) {
      onMessageChange({type: messageTypeEnum.SUGGEST_TO_UPGRADE, text: `This document is [${res.document_type}] pattern. Basic Plan extraction may miss critical data.`})
    }
  }


  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    if (!file) {
      setIsLoading(false)
      setIsVisible(false)
      router.push(`/projects/${projectId}`)
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Uploading file...',})
      const result = await uploadFile(formData)
      const filename = result.filename
      const orginal_file_name = result.original_filename
      const file_key = result.Key
      await handleExtract(filename, orginal_file_name, file_key)
    } catch (error) {
      alert('Error uploading a file')
    }
  };

  const handleExtract = async (fileName: string, orginal_file_name: string, file_key: string) => {
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Extracting...',})
      const response = await extractText(fileName)
      console.log('EXTRACTED_RESPONSE', response)
      const extracted_response = response.textract_response
      await handleAnalyse(fileName, extracted_response, orginal_file_name, file_key)
    } catch (error) {
      console.error('Error in extract:', error);
      setIsLoading(false);
      onMessageChange({type: messageTypeEnum.NONE, text: '',})
    }
  };

  const handleAnalyse = async (fileName: string, extractedResponse: any, orginal_file_name: string, file_key: string) => {
    const requestBody = {...extractedResponse}
    const pageNumber = requestBody.DocumentMetadata.Pages
    console.log('REQ', pageNumber)
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Analysing...',})
      const basic = false
      if(basic) {
        console.log('Analysing...,...')
        const response = await analyseText(projectId, fileName, requestBody)
        console.log('ANALYSED_DATA', response)
        const recordPayload = {...response, orginal_file_name: orginal_file_name, file_key: file_key}
        await saveData(recordPayload, pageNumber)
      } else {
        console.log('Querrying....')
        const response = await queryDocument(projectId, fileName)
        console.log('Queried_DATA', response)
        const recordPayload = {...response, orginal_file_name: orginal_file_name, file_key: file_key}
        console.log('SECONDXX', recordPayload)
        await saveData(recordPayload, pageNumber)
      }
    } catch (error) {
      console.error('Error in analysis:', error);
      setIsLoading(false);
      onMessageChange({type: messageTypeEnum.NONE, text: '',})
    }
  };

  const saveData = async (data: any, pageNumber: number) => {
    try {
      onMessageChange({type: messageTypeEnum.INFO, text: 'Saving Record...',})
      const response = await saveRecord(data)
      console.log('RECORDxx', response)
      const doc_data = {
        filename: response.record.filename,
        page_number: pageNumber
      }
      await saveDocument(doc_data)
    } catch (error) {
      console.error('Error in saving:', error);
      setIsLoading(false);
      onMessageChange({type: messageTypeEnum.NONE, text: '',})
    }
  };

  const saveDocument = async (data: any) => {
    try {
      await createDocument(data)
      setIsVisible(false)
      onMessageChange({type: messageTypeEnum.NONE, text: '',})
    } catch (error) {
      console.log('Error saving document', error)
    }
  }

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