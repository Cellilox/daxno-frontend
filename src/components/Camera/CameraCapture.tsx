'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCamera } from '@/hooks/useCamera';
import { Camera, RefreshCw, X } from 'lucide-react';

interface CameraCaptureProps {
    projectId: string;
    onCapture: (file: File) => void;
    onClose: () => void;
    fullscreen?: boolean;
}

export function CameraCapture({ onCapture, onClose, fullscreen }: CameraCaptureProps) {
    const { videoRef, isActive, startCamera, stopCamera, capturePhoto } = useCamera();
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [isStarting, setIsStarting] = useState(true);
    const hasAttemptedRef = useRef(false);
    const isResolvedRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const initCamera = useCallback(async () => {
        setIsStarting(true);
        setError(null);
        setPermissionDenied(false);
        isResolvedRef.current = false;

        // Check permission state before attempting (not supported in all browsers)
        if (typeof navigator !== 'undefined' && navigator.permissions) {
            try {
                const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
                if (status.state === 'denied') {
                    setPermissionDenied(true);
                    setError('camera_denied');
                    setIsStarting(false);
                    isResolvedRef.current = true;
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    return;
                }
            } catch {
                // permissions.query not supported for camera in this browser — proceed normally
            }
        }

        try {
            await startCamera();
            // Camera started successfully — cancel the safety timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } catch (err) {
            console.error('Camera start failed:', err);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
                setPermissionDenied(true);
                setError('camera_denied');
            } else {
                setError('Camera access failed. Ensure you are on HTTPS and have granted permission.');
            }
        } finally {
            setIsStarting(false);
            isResolvedRef.current = true;
        }
    }, [startCamera]);

    const handleRetry = useCallback(() => {
        hasAttemptedRef.current = false;
        isResolvedRef.current = false;
        setPermissionDenied(false);
        setError(null);
        setIsStarting(true);
        initCamera();
    }, [initCamera]);

    useEffect(() => {
        let mounted = true;

        if (!hasAttemptedRef.current) {
            hasAttemptedRef.current = true;

            // Safety timeout — only fires if initCamera never resolves (truly hung)
            timeoutRef.current = setTimeout(() => {
                if (mounted && !isResolvedRef.current) {
                    setError('Camera is taking too long to start. Please check your permissions and try again.');
                    setIsStarting(false);
                    isResolvedRef.current = true;
                }
            }, 20000);

            initCamera();
        }

        return () => {
            mounted = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            stopCamera();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCapture = async () => {
        const photoBlob = await capturePhoto();
        if (!photoBlob) return;

        const photoFile = new File([photoBlob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
        });

        onCapture(photoFile);
    };

    const renderErrorContent = () => {
        if (permissionDenied || error === 'camera_denied') {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-red-950 bg-opacity-95">
                    <X className="w-12 h-12 mb-3 text-red-300" />
                    <p className="text-lg font-semibold mb-2">Camera Permission Denied</p>
                    <p className="text-sm text-red-200 mb-4 max-w-xs">
                        To use the camera, allow access in your browser settings:
                    </p>
                    <ol className="text-sm text-red-100 text-left mb-5 space-y-1 max-w-xs list-decimal list-inside">
                        <li>Click the lock or camera icon in the address bar</li>
                        <li>Set Camera to &quot;Allow&quot;</li>
                        <li>Reload the page if needed, then tap Retry</li>
                    </ol>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-white text-red-900 rounded-md font-medium hover:bg-red-50 transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-transparent border border-white text-white rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-red-950 bg-opacity-95">
                <X className="w-12 h-12 mb-3 text-red-300" />
                <p className="text-sm text-red-100 mb-4 max-w-xs">{error}</p>
                <div className="flex gap-3">
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 bg-white text-red-900 rounded-md font-medium hover:bg-red-50 transition-colors"
                    >
                        Retry
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-transparent border border-white text-white rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    };

    const content = fullscreen ? (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
            <div className="relative flex-1 overflow-hidden">
                {isStarting && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
                        <RefreshCw className="w-10 h-10 animate-spin" />
                    </div>
                )}

                {error && renderErrorContent()}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isActive ? 'hidden' : 'block'}`}
                />

                {isActive && (
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                        <button
                            onClick={handleCapture}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-gray-300 active:scale-95 transition-transform shadow-lg"
                        >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-black border-opacity-20 flex items-center justify-center">
                                <Camera className="w-8 h-8 text-black" />
                            </div>
                        </button>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {isActive && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                        <p className="text-xs text-white bg-black bg-opacity-40 px-3 py-1 rounded-full">
                            Position your document within the frame and tap the button to capture.
                        </p>
                    </div>
                )}
            </div>
        </div>
    ) : (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative w-full aspect-[3/4] max-h-[50vh] bg-black rounded-lg overflow-hidden border border-gray-200">
                {isStarting && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-50">
                        <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                )}

                {error && renderErrorContent()}

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

    if (fullscreen && typeof document !== 'undefined') {
        return createPortal(content, document.body);
    }

    return content;
}
