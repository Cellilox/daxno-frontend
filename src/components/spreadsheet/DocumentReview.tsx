"use client";

import { getFileUrl } from "@/actions/aws-url-actions";
import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Field } from "./types";

// Helper function to proxy PDF URLs through Next.js API
const getProxiedUrl = (url: string, isPdf: boolean) => {
  if (!isPdf) return url; // Return original URL for non-PDF files
  
  // For PDFs, create a proxied URL through Next.js API route
  const encodedUrl = encodeURIComponent(url);
  return `/api/pdf-proxy?url=${encodedUrl}`;
};

// Dynamically import the PDF viewer component to avoid SSR issues
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
    orginal_file_name: string;
    created_at: string;
    answers: Record<string, AnswerItem>;
    filename: string;
    file_key: string;
  };
  columns: Field[]
}


export default function DocumentReview({ selectedRecordForReview, columns}: DocumentReviewProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  console.log('COLS', columns)
  useEffect(() => {
    if (!selectedRecordForReview) return;

    const loadFileUrl = async () => {
      try {
        const { file_url } = await getFileUrl(selectedRecordForReview.file_key);
        console.log('File URL:', file_url);
        
        // Check if the file is a PDF based on the file_key
        const isPdfFile = selectedRecordForReview.file_key.toLowerCase().endsWith('.pdf');
        setIsPdf(isPdfFile);
        
        // Get potentially proxied URL for PDFs to handle CORS
        const processedUrl = getProxiedUrl(file_url, isPdfFile);
        setFileUrl(processedUrl);
        setFileError(false);
      } catch (error) {
        console.error('Error loading file:', error);
        setFileError(true);
      }
    };

    loadFileUrl();
  }, [selectedRecordForReview]);

  if (!selectedRecordForReview) return null;

  const { answers } = selectedRecordForReview;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 max-w-6xl mx-auto">
      {/* Scrollable Data Section */}
      <div className="w-full md:w-1/2 overflow-y-auto md:max-h-[calc(100vh-4rem)]">
  <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
    {columns.map((field) => {
      const answer = answers[field.hidden_id];
      return (
        <div 
          key={field.hidden_id}
          className="p-4 bg-gray-50 rounded-md transition-colors hover:bg-gray-100 cursor-pointer"
          onMouseEnter={() => setActiveItem(field.hidden_id)}
          onMouseLeave={() => setActiveItem(null)}
        >
          <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {field.name}  {/* Show field name instead of hidden_id */}
          </dt>
          <dd className="mt-1 text-sm font-medium text-gray-900">
            {answer?.text || 'Not Found'}  {/* Safely access answer text */}
          </dd>
        </div>
      );
    })}
  </div>
</div>

      {/* Fixed Document Preview */}
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

              {/* Geometry Overlays for Images */}
              {Object.entries(answers).map(([key, value]) => {
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

          {fileUrl && isPdf && fileUrl && (
            <div className="w-full">
              {/* Use the separated PDF viewer component */}
              <PdfViewer 
                fileUrl={fileUrl} 
                activeItem={activeItem} 
                answers={answers} 
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