'use client'
import { gapi } from 'gapi-script';
import { useEffect, useState } from 'react';
import LoadingSpinner from './ui/LoadingSpinner';

type ShareToDriveProps = {
    headers: any,
    projectId: string
}

export default function ShareToDrive({ headers, projectId }: ShareToDriveProps) {
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
            
            // Set the tokens in state
            setAccessToken(accessToken);
            setRefreshToken(refreshToken || 'No refresh token available');

            // Send tokens to n8n webhook
            await sendTokensToWebhook(accessToken, refreshToken);

            const metadata = {
                name: file.name,
                mimeType: file.type,
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
            console.log('File uploaded:', uploadedFile);
            alert('File uploaded to Google Drive! \n to see your file, navigate to \n \t https://drive.google.com/drive/home');
            setIsLoading(false)
        } catch (error) {
            console.error('Error uploading to Google Drive:', error);
            //@ts-ignore
            alert('Error uploading to Google Drive: ' + error.message);
            setIsLoading(false)
        }
    }

    // Function to send tokens to n8n webhook
    const sendTokensToWebhook = async (accessToken: string, refreshToken: string | undefined) => {
        try {
            const response = await fetch('http://localhost:5678/webhook-test/user-credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer my-secret-key-string'
                },
                body: JSON.stringify({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    project_id: projectId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send tokens to webhook');
            }

            console.log('Tokens sent to webhook successfully');
        } catch (error) {
            console.error('Error sending tokens to webhook:', error);
        }
    };

    async function downloadCSV() {
        setIsLoading(true)
        const url = `${process.env.NEXT_PUBLIC_API_URL}/download-csv/${projectId}`;

        try {
            const getCSV = await fetch(url, {
                method: 'GET',
                headers: headers,
            });

            if (!getCSV.ok) {
                const errorText = await getCSV.text()
                throw new Error(`Failed to fetch CSV: ${getCSV.status} - ${errorText}`);
            }

            const blob = await getCSV.blob();
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
                prompt: 'consent' // This forces the consent screen to appear
            });
            const accessToken = googleAuth.getAuthResponse().access_token;
            const refreshToken = googleAuth.getAuthResponse(true).refresh_token;
            
            setAccessToken(accessToken);
            setRefreshToken(refreshToken || 'No refresh token available');
            
            // Send tokens to webhook upon authentication
            await sendTokensToWebhook(accessToken, refreshToken);
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
                // @ts-ignore - auth2 exists but TypeScript doesn't recognize it
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
        <>
            <div className="flex flex-col items-center">
                {!isSignedIn ? (
                    <div>
                        <p>Share to your drive</p>
                        <div className='mt-3'>
                            <button onClick={handleAuthClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">Connect to Google Drive</button>
                        </div>

                        <div className='mt-3'>
                            <button onClick={handleAuthClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">connect to Gmail</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <button onClick={handleSignOutClick} className='text-black border-b border-red-500 '>Disconnect from Google Drive</button>
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Access Token: {accessToken.substring(0, 20)}...</p>
                            <p>Refresh Token: {refreshToken ? refreshToken.substring(0, 20) + '...' : 'No refresh token'}</p>
                        </div>
                        <div className='mt-3'>
                            {isLoading ? (
                                <div className="flex justify-between px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors">
                                    <LoadingSpinner />
                                    <p className="ml-3">Uploading...</p>
                                </div>
                            ) : (
                                <div>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                                    onClick={downloadCSV}
                                >
                                    Share to your Drive
                                </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

