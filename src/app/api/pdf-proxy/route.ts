import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the URL from the query parameters
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Fetch the file from S3
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'application/pdf';
    
    // Get the file data as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Return the file with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        // Add Access-Control-Allow-Origin (required for PDF.js)
        'Access-Control-Allow-Origin': '*',
        // Cache the response to prevent multiple fetches
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
  }
}