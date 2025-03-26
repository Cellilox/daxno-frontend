'use client'
import { gapi } from 'gapi-script';
import { useEffect, useState } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';
import { download } from '@/actions/download-actions';
import { HardDrive, LogOut } from 'lucide-react';

type ShareToDriveProps = {
    projectId: string
}

export default function ShareToDrive({ projectId }: ShareToDriveProps) {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [accessToken, setAccessToken] = useState<string>('');
    const [refreshToken, setRefreshToken] = useState<string>('');

    async function uploadToGoogleDrive(file: any) {
        setIsLoading(true)
        try {
            await gapi.client.init({
                apiKey: process.env.NEXT_PUBLIC_API_KEY,
                clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
                discoveryDocs: process.env.NEXT_PUBLIC_DISCOVERY_DOCS?.split(','),
                scope: process.env.NEXT_PUBLIC_SCOPES,
            });

            // @ts-ignore
            const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
            const accessToken = googleUser.getAuthResponse().access_token;
            const refreshToken = googleUser.getAuthResponse(true).refresh_token;
            
            setAccessToken(accessToken);
            setRefreshToken(refreshToken || 'No refresh token available');

            const metadata = {
                name: file.name.replace('.csv', ''),
                mimeType: 'application/vnd.google-apps.spreadsheet'
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: form,
            });

            if (!response.ok) {
                const error = await response.json();
                setIsLoading(false)
                throw new Error(error.error.message || 'Error uploading file');
            }

            const uploadedFile = await response.json();
            alert('File uploaded at your drive => https://drive.google.com/drive/home');
            setIsLoading(false)
        } catch (error) {
            console.error('Error uploading to Google Drive:', error);
            //@ts-ignore
            alert('Error uploading to Google Drive: ' + error.message);
            setIsLoading(false)
        }
    }

    async function downloadCSV() {
        setIsLoading(true)
        try {
            const blob = await download(projectId)
            const file = new File([blob], 'data.csv', { type: 'text/csv' });
            await uploadToGoogleDrive(file);
        } catch (error) {
            console.error("Error downloading or uploading CSV:", error);
            //@ts-ignore
            alert("Error downloading or uploading CSV: " + error.message);
        }
    }

    const setSignInStatus = (isSignedIn: boolean) => {
        setIsSignedIn(isSignedIn);
    };

    const updateSignInStatus = (isSignedIn: boolean) => {
        setSignInStatus(isSignedIn);
    };

    const handleAuthClick = async () => {
        try {
            // @ts-ignore
            const googleAuth = await gapi.auth2.getAuthInstance().signIn({
                prompt: 'consent'
            });
            const accessToken = googleAuth.getAuthResponse().access_token;
            const refreshToken = googleAuth.getAuthResponse(true).refresh_token;
            
            setAccessToken(accessToken);
            setRefreshToken(refreshToken || 'No refresh token available');
        } catch (error) {
            console.error('Auth error:', error);
        }
    };

    const handleSignOutClick = () => {
        // @ts-ignore
        gapi.auth2.getAuthInstance().signOut();
    };

    function loadGapi() {
        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: process.env.NEXT_PUBLIC_API_KEY,
                clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
                discoveryDocs: process.env.NEXT_PUBLIC_DISCOVERY_DOCS?.split(','),
                scope: process.env.NEXT_PUBLIC_SCOPES?.split(' ').join(' '),
            }).then(() => {
                // @ts-ignore
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
                // @ts-ignore
                setSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            });
        });
    }

    useEffect(() => {
        loadGapi();
    }, []);

    return (
        <div className="w-full mt-5">
            <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-gray-700">Share to Google</p>
                {!isSignedIn ? (
                    <div className="w-full space-y-2">
                        <button 
                            onClick={handleAuthClick} 
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                        >
                            <HardDrive className="w-4 h-4" />
                            <span className="text-sm">Connect Drive</span>
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-2">
                        {isLoading ? (
                            <div className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
                                <LoadingSpinner />
                                <span className="text-sm">Uploading...</span>
                            </div>
                        ) : (
                            <button
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                                onClick={downloadCSV}
                            >
                                <HardDrive className="w-4 h-4" />
                                <span className="text-sm">Share to Drive</span>
                            </button>
                        )}
                        <button 
                            onClick={handleSignOutClick} 
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

