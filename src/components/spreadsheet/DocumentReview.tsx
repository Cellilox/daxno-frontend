"use client";

import { getFileUrl } from "@/actions/aws-url-actions";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Field } from "./types";
import { updateRecord } from "@/actions/record-actions";
import LoadingSpinner from "../ui/LoadingSpinner";

const getProxiedUrl = (url: string, isPdf: boolean) => {
  if (!isPdf) return url;
  const encodedUrl = encodeURIComponent(url);
  return `/api/pdf-proxy?url=${encodedUrl}`;
};

const PdfViewer = dynamic(
  () => import('./PdfView'),
  { 
    ssr: false, 
    loading: () => <div className="flex justify-center items-center h-64 bg-gray-100">Loading PDF viewer...</div> 
  }
);

interface AnswerItem {
  text: string;
  geometry: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

interface DocumentReviewProps {
  selectedRecordForReview?: {
    id: string;
    orginal_file_name: string;
    created_at: string;
    answers: Record<string, AnswerItem>;
    filename: string;
    file_key: string;
    project_id: string;
  };
  columns: Field[];
}

export default function DocumentReview({ selectedRecordForReview, columns }: DocumentReviewProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, AnswerItem>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  // initialize when record changes
  useEffect(() => {
    if (selectedRecordForReview) {
      setEditedAnswers(selectedRecordForReview.answers);
      setIsDirty(false);
      setIsEditMode(false);
    }
  }, [selectedRecordForReview]);

  // load file url
  useEffect(() => {
    if (!selectedRecordForReview) return;
    (async () => {
      try {
        const { file_url } = await getFileUrl(
          selectedRecordForReview.file_key,
          selectedRecordForReview.project_id
        );
        
        const isPdfFile = selectedRecordForReview.file_key.toLowerCase().endsWith('.pdf');
        setIsPdf(isPdfFile);
        setFileUrl(getProxiedUrl(file_url, isPdfFile));
        setFileError(false);
      } catch (error) {
        console.error('Error loading file:', error);
        setFileError(true);
      }
    })();
  }, [selectedRecordForReview]);

  // track individual field edits
  const handleAnswerChange = (fieldId: string, newText: string) => {
    setEditedAnswers(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        text: newText
      }
    }));
    setIsDirty(true);
  };

  // save only answers
  const handleSave = async () => {
    if (!selectedRecordForReview || !isDirty) {
      setIsEditMode(false);
      return;
    }
    try {
      setIsLoading(true)
      await updateRecord(selectedRecordForReview.id, { answers: editedAnswers });
      setIsLoading(false)
      setIsDirty(false);
      setIsEditMode(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  // main toggle button handler
  const onPrimaryButtonClick = () => {
    if (isEditMode) {
      handleSave();
    } else {
      setIsEditMode(true);
    }
  };

  if (!selectedRecordForReview) return null;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 max-w-6xl mx-auto">
      {/* Data Section */}
      <div className="w-full md:w-1/2 overflow-y-auto md:max-h-[calc(100vh-4rem)]">
        <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Document Details</h2>
            <button
              onClick={onPrimaryButtonClick}
              disabled={isEditMode && !isDirty}
              className={`px-4 py-2 rounded-md flex items-center${
                isEditMode
                  ? isDirty 
                    ? ' bg-blue-600 text-white hover:bg-blue-700'
                    : ' bg-gray-300 text-gray-500 cursor-not-allowed'
                  : ' bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isLoading && <LoadingSpinner className='mr-2'/>}
              {isEditMode ? 'Save Changes' : 'Edit Results'}
            </button>
          </div>

          {columns.map(field => {
            const answer = editedAnswers[field.hidden_id];
            return (
              <div
                key={field.hidden_id}
                className="p-4 bg-gray-50 rounded-md transition-colors hover:bg-gray-100 relative"
                onMouseEnter={() => setActiveItem(field.hidden_id)}
                onMouseLeave={() => setActiveItem(null)}
              >
                <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {field.name}
                </dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={answer?.text || ''}
                      onChange={e => handleAnswerChange(field.hidden_id, e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span>{answer?.text || 'Not Found'}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Preview */}
      <div className="md:w-1/2 md:sticky md:top-8 md:self-start">
        <div className="bg-white p-4 rounded-lg shadow-md relative">
          {fileUrl && !isPdf && (
            <div className="relative">
              <Image
                src={fileUrl}
                alt="Document preview"
                width={800}
                height={600}
                className="w-full h-auto"
                unoptimized
              />

              {Object.entries(editedAnswers).map(([key, value]) => {
                const isActive = activeItem === key;
                return (
                  <div
                    key={key}
                    className="absolute border-2 transition-all duration-300"
                    style={{
                      left: `${value.geometry.left * 100}%`,
                      top: `${value.geometry.top * 100}%`,
                      width: `${value.geometry.width * 100}%`,
                      height: `${value.geometry.height * 100}%`,
                      borderColor: isActive ? '#ef4444' : '#6b7280',
                      opacity: isActive ? 1 : 0.7,
                      zIndex: isActive ? 20 : 10,
                      pointerEvents: 'none',
                      boxShadow: isActive ? '0 0 8px rgba(239,68,68,0.3)' : 'none',
                      borderWidth: isActive ? '3px' : '2px'
                    }}
                  />
                );
              })}
            </div>
          )}

          {fileUrl && isPdf && (
            <div className="w-full">
              <PdfViewer 
                fileUrl={fileUrl} 
                activeItem={activeItem} 
                answers={editedAnswers} 
              />
            </div>
          )}

          {fileError && (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
              Failed to load document preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
