import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const extensionId = searchParams.get('extensionId');
    const session = await auth();
    const sessionId = session.sessionId;
    const getToken = session.getToken;
    
    if (!sessionId) return new Response('Unauthorized', { status: 401 });

    return new Response(`
      <html>
        <head>
          <title>Authentication Complete</title>
          <script>
            window.onload = function() {
              chrome.runtime.sendMessage('${extensionId}', {
                type: 'CLERK_AUTH_COMPLETE',
                token: '${await getToken()}',
                sessionId: '${sessionId}'
              });
            }
          </script>
        </head>
        <body>
          <h1>Authentication Successful!</h1>
          <p>You can safely close this window</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response('Authentication failed', { status: 500 });
  }
}