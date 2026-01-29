'use server';

import { fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

type ChatPayload = {
  message: string;
  project_id: string;
  history: any
}

export async function sendChat(formData: ChatPayload) {

  try {
    const url = buildApiUrl('/mcp/project-chatbot');
    const response = await fetchAuthedJson(url, {
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

