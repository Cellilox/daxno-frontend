'use server';

import { fetchAuthedJson, fetchAuthed, buildApiUrl } from "@/lib/api-client";
import { Message } from "@/components/chat/types"

type conversationData = {
  project_id: string
  messages: Message[]
}

export async function storeConversation(conversationData: conversationData) {
  const url = buildApiUrl('/conversations');
  const response = await fetchAuthedJson(url, {
    method: 'POST',
    body: JSON.stringify(conversationData),
  });

  if (!response.ok) {
    throw new Error('Failed to create a conversation');
  }
  return await response.json();
}



export async function getConversations(projectId: string) {
  try {
    const url = buildApiUrl(`/conversations/${projectId}`);
    const response = await fetchAuthed(url)
    // if(!response.ok) {
    //   throw new Error ("Failed to fetch projects")
    // }
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}