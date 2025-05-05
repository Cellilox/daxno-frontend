"use client";

import { useEffect, useState } from "react";
import { pdfjs, Document as PDFDocument, Page as PDFPage } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Configure PDF.js with CORS settings
const pdfOptions = {
  cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/',
};

interface PdfViewerProps {
  fileUrl: string;
  activeItem: string | null;
  answers: Record<string, {
    text: string;
    geometry: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
  }>;
}

export default function PdfViewer({ fileUrl, activeItem, answers }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfScale, setPdfScale] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (errorMessage: Error) => {
    console.error('Error loading PDF:', errorMessage);
    setError(`Failed to load PDF: ${errorMessage.message}`);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col">
      {/* PDF Controls */}
      {/* <div className="flex justify-between items-center mb-4 p-2 bg-gray-100 rounded-md">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previo\\\
            ',k,,
          </button>
          <span className="text-sm">
            Page {currentPage} of {numPages || '?'}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => numPages ? Math.min(prev + 1, numPages) : prev)}
            disabled={numPages !== null && (currentPage >= numPages || isLoading)}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPdfScale(prev => Math.max(prev - 0.2, 0.6))}
            disabled={isLoading}
            className="px-2 py-1 bg-gray-200 rounded disabled:bg-gray-300"
          >
            -
          </button>
          <span className="text-xs">{Math.round(pdfScale * 100)}%</span>
          <button 
            onClick={() => setPdfScale(prev => Math.min(prev + 0.2, 2))}
            disabled={isLoading}
            className="px-2 py-1 bg-gray-200 rounded disabled:bg-gray-300"
          >
            +
          </button>
        </div>
      </div> */}

      {/* PDF Viewer */}
      <div className="relative border border-gray-200 rounded-md overflow-hidden bg-gray-50 min-h-[500px] flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
            <div className="text-blue-500">Loading PDF...</div>
          </div>
        )}
        
        {error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : (
          <PDFDocument
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={pdfOptions}
            className="mx-auto"
            loading={<div className="flex justify-center items-center h-64">Loading PDF...</div>}
            error={<div className="text-red-500 p-4">Failed to load PDF document</div>}
          >
            <PDFPage
              pageNumber={currentPage}
              scale={pdfScale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<div className="flex justify-center items-center h-64">Loading page...</div>}
              error={<div className="text-red-500 p-4">Failed to load page</div>}
            />
          </PDFDocument>
        )}

        {/* Geometry Overlays for PDFs */}
        <div className="absolute inset-0 pointer-events-none">
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
                  boxShadow: isActive ? '0 0 8px rgba(239,68,68,0.3)' : 'none',
                  borderWidth: isActive ? '3px' : '2px'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}