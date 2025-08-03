'use server';

import { fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


type ChatPayload = {
    message: string;
    project_id: string;
    history: any
}

export async function sendChat(formData: ChatPayload) {

  try {
      const response = await fetchAuthedJson(`${apiUrl}/mcp/project-chatbot`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

//     if (!response.ok) {
//     throw new Error('Failed to create project');
//   }
  return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}

