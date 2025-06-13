"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface Geometry {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Answer {
  text: string;
  geometry: Geometry;
}

interface PdfViewerProps {
  fileUrl: string;
  activeItem: string | null;
  answers: Record<string, Answer>;
}

export default function PdfViewer({ fileUrl, activeItem, answers }: PdfViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle PDF load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    
    // Update dimensions after load
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  // Handle iframe error
  const handleError = useCallback(() => {
    setError("Failed to load PDF document. Please check the file URL.");
    setIsLoading(false);
  }, []);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Main container - this is what scrolls */}
      <div 
        ref={wrapperRef}
        className="relative border border-gray-200 rounded-md bg-gray-50 overflow-auto"
        style={{ height: '80vh', minHeight: '600px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-blue-600 font-medium">Loading PDF...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-30 p-4">
            <div className="text-red-600 text-center">
              <div className="text-lg font-semibold mb-2">Error Loading PDF</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Content area - larger than container to enable scrolling */}
        <div className="relative" style={{ width: '80%', height: '100%', minWidth: '100%', minHeight: '100%' }}>
          {/* PDF iframe */}
          <iframe
            ref={iframeRef}
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
            className="w-full h-full border-none"
            onLoad={handleLoad}
            onError={handleError}
            title="PDF Viewer"
            style={{ 
              visibility: isLoading ? 'hidden' : 'visible'
            }}
          />
          
          {/* Overlays - positioned absolutely on top of PDF */}
          <div
            ref={overlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {!isLoading && Object.entries(answers).map(([key, answer]) => {
              const isActive = activeItem === key;
              
              return (
                <div
                  key={key}
                  className="absolute transition-all duration-200"
                  style={{
                    left: `${answer.geometry.left * 100}%`,
                    top: `${answer.geometry.top * 100}%`,
                    width: `${answer.geometry.width * 100}%`,
                    height: `${answer.geometry.height * 100}%`,
                    border: `${isActive ? '3px' : '2px'} solid ${isActive ? '#ef4444' : '#3b82f6'}`,
                    backgroundColor: isActive 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : 'rgba(59, 130, 246, 0.08)',
                    boxShadow: isActive 
                      ? '0 0 10px rgba(239, 68, 68, 0.3)' 
                      : '0 0 5px rgba(59, 130, 246, 0.2)',
                    borderRadius: '2px',
                    zIndex: isActive ? 15 : 10,
                  }}
                >
                  {/* Tooltip for active item */}
                  {isActive && answer.text && (
                    <div 
                      className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap max-w-60 truncate z-20"
                      style={{
                        top: '-2rem',
                        left: '0',
                        transform: 'translateY(-2px)'
                      }}
                    >
                      {answer.text.length > 60 ? `${answer.text.substring(0, 60)}...` : answer.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Status info */}
      {/* <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
        <div>
          {Object.keys(answers).length} annotation{Object.keys(answers).length !== 1 ? 's' : ''}
          {activeItem && ` • Active: ${activeItem}`}
        </div>
        <div className="text-xs text-gray-400">
          Scroll to navigate • Annotations synchronized
        </div>
      </div> */}
    </div>
  );
}