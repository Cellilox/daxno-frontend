'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraCaptureProps {
    projectId: string;
    onCapture: (file: File) => void;
    onClose: () => void;
}

export function CameraCapture({ projectId, onCapture, onClose }: CameraCaptureProps) {
    const { videoRef, isActive, startCamera, stopCamera, capturePhoto } = useCamera();
    const [error, setError] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(true);
    const hasAttemptedRef = useRef(false);

    const initCamera = useCallback(async () => {
        setIsStarting(true);
        setError(null);
        try {
            await startCamera();
        } catch (err) {
            console.error('Camera start failed:', err);
            setError('Camera access failed. Ensure you are on HTTPS and have granted permission.');
        } finally {
            setIsStarting(false);
        }
    }, [startCamera]);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        if (!hasAttemptedRef.current) {
            hasAttemptedRef.current = true;

            // Safety timeout
            timeoutId = setTimeout(() => {
                if (mounted && !isActive && !error) {
                    setError('Camera taking too long. Please check permissions or refresh.');
                    setIsStarting(false);
                }
            }, 10000);

            initCamera();
        }

        return () => {
            mounted = false;
            console.log('[CameraCapture] Component unmounting, stopping camera');
            if (timeoutId) clearTimeout(timeoutId);
            stopCamera();
        };
    }, [initCamera, stopCamera]); // NO dependencies on isActive, error, or hasAttempted

    const handleCapture = async () => {
        const photoBlob = await capturePhoto();
        if (!photoBlob) return;

        // Create a file object to pass back
        const photoFile = new File([photoBlob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
        });

        onCapture(photoFile);
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative w-full aspect-[3/4] max-h-[50vh] bg-black rounded-lg overflow-hidden border border-gray-200">
                {isStarting && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-50">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-red-900 bg-opacity-50">
                        <X className="w-12 h-12 mb-2" />
                        <p>{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-white text-red-900 rounded-md font-medium"
                        >
                            Go Back
                        </button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isActive ? 'hidden' : 'block'}`}
                />

                {isActive && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                        <button
                            onClick={handleCapture}
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 bg-white rounded-full border-2 border-black border-opacity-20 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-black" />
                            </div>
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <p className="text-sm text-gray-500">
                Position your document within the frame and tap the button to capture.
            </p>
        </div>
    );
}
