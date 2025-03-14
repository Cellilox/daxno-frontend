'use server';

import { getRequestAuthHeaders } from "@/lib/server-headers";

const ocrRagApiUrl = process.env.NEXT_PUBLIC_OCR_RAG_API_URL;

export async function sendChatMessage(filename: string, message: string, conversationId: string | null) {
  const headers = await getRequestAuthHeaders();
  headers.append('X-API-KEY', process.env.NEXT_PUBLIC_OCR_API_KEY || '');
  headers.append('X-OpenAI-Key', process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');

  // Build the base URL
  let url = `${ocrRagApiUrl}/query?file_name=${filename}&query=${message}`;
  
  // Add conversationId to URL if it exists
  if (conversationId) {
    url += `&conversation_id=${conversationId}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return await response.json();
} 