"use client";

import { getFileUrl } from "@/actions/aws-url-actions";
import { useEffect, useState } from "react";
import Image from "next/image";

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
}

export default function DocumentReview({ selectedRecordForReview }: DocumentReviewProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!selectedRecordForReview) return;

    const loadImageUrl = async () => {
      try {
        const { file_url } = await getFileUrl(selectedRecordForReview.file_key);
        setImageUrl(file_url);
        setImageError(false);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageError(true);
      }
    };

    loadImageUrl();
  }, [selectedRecordForReview]);

  if (!selectedRecordForReview) return null;

  const { answers } = selectedRecordForReview;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 max-w-6xl mx-auto">
      {/* Scrollable Data Section */}
      <div className="w-full md:w-1/2 overflow-y-auto md:max-h-[calc(100vh-4rem)]">
        <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
          {Object.entries(answers).map(([key, value]) => (
            <div 
              key={key}
              className="p-4 bg-gray-50 rounded-md transition-colors hover:bg-gray-100 cursor-pointer"
              onMouseEnter={() => setActiveItem(key)}
              onMouseLeave={() => setActiveItem(null)}
            >
              <dt className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {key}
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                {value.text}
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Image Preview */}
      <div className="md:w-1/2 md:sticky md:top-8 md:self-start">
        <div className="bg-white p-4 rounded-lg shadow-md relative">
          {imageUrl && (
            <div className="relative">
              <Image
                src={imageUrl}
                alt="Document preview"
                width={800}
                height={600}
                className="w-full h-auto"
                unoptimized
              />

              {/* Geometry Overlays */}
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

          {imageError && (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
              Failed to load document preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}