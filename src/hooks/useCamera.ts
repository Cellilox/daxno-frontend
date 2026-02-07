import { useState, useRef, useCallback } from 'react';

export function useCamera() {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startCamera = useCallback(async () => {
        // Use a functional check to avoid dependency on 'stream'
        let currentStream: MediaStream | null = null;
        setStream(s => {
            currentStream = s;
            return s;
        });

        if (currentStream) return;

        console.log('[useCamera] Attempting to start camera...');

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: 'environment', // Will fall back to default on laptop
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            let mediaStream: MediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (constraintsError) {
                console.warn('[useCamera] Ideal constraints failed, falling back to basic:', constraintsError);
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
            console.log('[useCamera] MediaStream obtained:', mediaStream.id);

            setStream(mediaStream);
            setIsActive(true);

            if (videoRef.current) {
                console.log('[useCamera] Attaching stream to video element');
                videoRef.current.srcObject = mediaStream;
                try {
                    await videoRef.current.play();
                } catch (playError) {
                    console.warn('[useCamera] video.play() failed:', playError);
                }
            }
        } catch (error) {
            console.error('[useCamera] Camera initialization failed:', error);
            throw error;
        }
    }, []); // No dependencies = stable function

    const stopCamera = useCallback(() => {
        setStream(prevStream => {
            if (prevStream) {
                console.log('[useCamera] Stopping stream:', prevStream.id);
                prevStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('[useCamera] Stopped track:', track.label);
                });
            }
            return null;
        });
        setIsActive(false);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []); // No dependencies

    const capturePhoto = useCallback(async (): Promise<Blob | null> => {
        if (!videoRef.current) return null;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        ctx.drawImage(videoRef.current, 0, 0);

        return new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
        });
    }, []);

    return {
        videoRef,
        isActive,
        startCamera,
        stopCamera,
        capturePhoto,
    };
}
