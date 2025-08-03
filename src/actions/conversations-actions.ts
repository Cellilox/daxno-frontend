'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthedJson, fetchAuthed } from "@/lib/api-client";
import { Message } from "@/components/chat/types"
const apiUrl = process.env.NEXT_PUBLIC_API_URL;



type conversationData = {
    project_id: string
    messages: Message[]
}

export async function storeConversation(conversationData: conversationData) {
  const response = await fetchAuthedJson(`${apiUrl}/conversations`, {
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
    const response = await fetchAuthed(`${apiUrl}/conversations/${projectId}`)
    // if(!response.ok) {
    //   throw new Error ("Failed to fetch projects")
    // }
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}