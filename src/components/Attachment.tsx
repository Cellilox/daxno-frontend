'use client'

import React from 'react'

type AttachementProps = {
    token: string | null
    sessionId: string | undefined
}

export default function Attachment() {
    const StartMonitoring = async (event: React.FormEvent) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gmail/connect`, {
              credentials: 'include'  // Important for cookies if you're using them
            });
            const data = await response.json();
            console.log('data', data)
            window.location.href = data.auth_url;
            // Instead of using fetch, directly redirect to Google's auth UR
          } catch (error) {
            console.error('Failed to connect Gmail:', error);
          }
    }
  return (
    <div>
      <button onClick={StartMonitoring} className='bg-blue-600 p-4'>Click</button>
    </div>
  )
}
