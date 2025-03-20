import {auth } from '@clerk/nextjs/server'

export async function GET() {
    try {
      const session = await auth();
      if (!session.sessionId) return new Response('Unauthorized', {status: 401});
  
      return new Response(`
        <html>
          <script>
            chrome.runtime.sendMessage(
              '${process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID}',
              {
                type: 'CLERK_AUTH_COMPLETE',
                token: '${await session.getToken()}',
                sessionId: '${session.sessionId}'
              },
              () => window.close()
            );
          </script>
          <body>
            <h1>Authentication Complete</h1>
            <p>You can close this window</p>
          </body>
        </html>
      `, {
        headers: {'Content-Type': 'text/html'}
      });
    } catch (error) {
      return new Response('Authentication failed', {status: 500});
    }
  }