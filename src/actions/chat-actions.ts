'use server';

import { fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function sendChatMessage(recordId: string, filename: string, message: string) {
  const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ 
      message,
      filename, // Include filename in the request
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return await response.json();
} 