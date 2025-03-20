import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const sessionId = request.headers.get('sessionId');

    if (!authHeader?.startsWith('Bearer ') || !sessionId) {
      return NextResponse.json(
        { error: 'Missing authentication headers' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/records/e754c380-cd95-4b3d-b984-1ff0c36139c3`, {
      headers: {
        'Authorization': authHeader,
        'sessionId': sessionId
      }
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Authorization, sessionId'
      }
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}