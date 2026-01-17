"use client";

import { getFileUrl } from "@/actions/aws-url-actions";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Field, DocumentRecord } from "./types";
import { updateRecord } from "@/actions/record-actions";
import LoadingSpinner from "../ui/LoadingSpinner";

interface DocumentReviewProps {
  selectedRecordForReview?: DocumentRecord;
  columns: Field[];
  onClose?: () => void;
}

const getProxiedUrl = (url: string, isPdf: boolean) => {
  if (!isPdf) return url;
  const encodedUrl = encodeURIComponent(url);
  return `/api/pdf-proxy?url=${encodedUrl}`;
};

const PdfViewer = dynamic(
  () => import('./PdfView'),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-full bg-gray-50 text-gray-400">
        <LoadingSpinner className="mr-2" /> Loading PDF...
      </div>
    )
  }
);


export default function DocumentReview({ selectedRecordForReview, columns, onClose }: DocumentReviewProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, any>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedRecordForReview) {
      setEditedAnswers(selectedRecordForReview.answers);
      setIsDirty(false);
      setIsEditMode(false);
    }
  }, [selectedRecordForReview]);

  useEffect(() => {
    if (!selectedRecordForReview) return;
    (async () => {
      try {
        const { file_url } = await getFileUrl(
          selectedRecordForReview.file_key,
          selectedRecordForReview.project_id
        );
        const pdf = selectedRecordForReview.file_key.toLowerCase().endsWith('.pdf');
        setIsPdf(pdf);
        setFileUrl(getProxiedUrl(file_url, pdf));
        setFileError(false);
      } catch {
        setFileError(true);
      }
    })();
  }, [selectedRecordForReview]);

  const handleAnswerChange = (fieldId: string, newText: string) => {
    setEditedAnswers(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], text: newText }
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!selectedRecordForReview || !isDirty) {
      setIsEditMode(false);
      return;
    }
    try {
      setIsLoading(true)
      await updateRecord(selectedRecordForReview.id, { answers: editedAnswers as any });
      setIsLoading(false)
      setIsDirty(false);
      setIsEditMode(false);
    } catch {
      alert('Error updating')
      setIsLoading(false)
    }
  };

  if (!selectedRecordForReview) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white z-10 shrink-0">
        <div className="flex flex-col min-w-0 mr-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate" title={selectedRecordForReview.original_filename}>
            Review
          </h2>
          <p className="text-xs md:text-sm text-gray-500 truncate">{selectedRecordForReview.original_filename}</p>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {isEditMode ? (
            <>
              <button
                onClick={() => { setIsEditMode(false); setIsDirty(false); setEditedAnswers(selectedRecordForReview.answers); }}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || isLoading}
                className={`
                            flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white rounded transition
                            ${!isDirty || isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                        `}
              >
                {isLoading && <LoadingSpinner className="mr-2 w-3 h-3 md:w-4 md:h-4" />}
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition whitespace-nowrap"
            >
              Edit
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-1 md:ml-2 p-1.5 md:p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <svg width="20" height="20" className="md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* Right: Preview (Top on Mobile) - Order 1 on mobile */}
        {/* Mobile: 45vh fixed height. Desktop: Full height of container */}
        <div className="w-full md:w-2/3 h-[45vh] md:h-full bg-gray-100 relative overflow-hidden flex flex-col shrink-0 border-b md:border-b-0 md:border-l border-gray-200 order-1 md:order-2">
          <div className="flex-1 relative overflow-auto custom-scrollbar flex items-center justify-center p-2 md:p-4">
            {/* Mobile Page Indicator */}
            {isPdf && selectedRecordForReview?.pages && (
              <div className="md:hidden absolute top-2 right-2 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                {selectedRecordForReview.pages} Pages
              </div>
            )}

            {fileUrl ? (
              isPdf ? (
                <div className="shadow-lg h-full w-full max-w-4xl max-h-full flex flex-col bg-white">
                  <PdfViewer
                    fileUrl={fileUrl}
                    activeItem={activeItem}
                    answers={editedAnswers}
                    totalPages={selectedRecordForReview?.pages}
                  />
                </div>
              ) : (
                <div className="relative shadow-lg max-w-full">
                  <Image
                    src={fileUrl}
                    alt="Document preview"
                    width={800}
                    height={600}
                    className="w-auto h-auto max-w-full max-h-[80vh] object-contain bg-white"
                    unoptimized
                  />
                  {Object.entries(editedAnswers).map(([key, value]) => {
                    const isActive = activeItem === key;
                    if (!value?.geometry) return null;
                    return (
                      <div
                        key={key}
                        className="absolute transition-all duration-300 rounded-sm"
                        style={{
                          left: `${value.geometry.left * 100}%`,
                          top: `${value.geometry.top * 100}%`,
                          width: `${value.geometry.width * 100}%`,
                          height: `${value.geometry.height * 100}%`,

                          // New Premium Styles
                          borderColor: isActive ? '#2563EB' : '#94a3b8',
                          backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(226, 232, 240, 0)',
                          borderWidth: isActive ? '2px' : '1px',
                          boxShadow: isActive ? '0 0 12px rgba(37, 99, 235, 0.4)' : 'none',

                          opacity: 1,
                          zIndex: isActive ? 20 : 10,
                          pointerEvents: 'none',
                        }}
                      />
                    );
                  })}
                </div>
              )
            ) : fileError ? (
              <div className="flex flex-col items-center justify-center text-red-500 p-8 bg-white rounded shadow-sm">
                <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>Failed to load document preview</p>
              </div>
            ) : (
              <LoadingSpinner />
            )}
          </div>
        </div>

        {/* Left: Form Data (Bottom on Mobile) - Order 2 on mobile */}
        {/* Mobile: Takes remaining space (approx 55vh). Desktop: Full height. */}
        <div className="w-full md:w-1/3 md:min-w-[320px] flex-1 md:h-full overflow-y-auto bg-white order-2 md:order-1">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {columns.map(field => {
              const answer = editedAnswers[field.hidden_id];
              const isActive = activeItem === field.hidden_id;

              return (
                <div
                  key={field.hidden_id}
                  className={`
                                group p-3 -mx-3 rounded-lg transition-all cursor-pointer border border-transparent
                                ${isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-gray-50'}
                            `}
                  onMouseEnter={() => setActiveItem(field.hidden_id)}
                  onMouseLeave={() => setActiveItem(null)}
                  onClick={() => {
                    // Mobile: Tap to highlight. Desktop: Click to highlight (handled by hover mostly)
                    // Only enter edit mode via the main button to prevent accidents on mobile scroll
                    setActiveItem(field.hidden_id);
                  }}
                >
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {field.name}
                  </label>

                  {isEditMode ? (
                    <textarea
                      value={answer?.text || ""}
                      onChange={e => handleAnswerChange(field.hidden_id, e.target.value)}
                      className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
                      rows={2}
                    />
                  ) : (
                    <p className={`text-sm ${answer?.text ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                      {answer?.text || "Not found"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
