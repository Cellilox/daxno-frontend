'use server'

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  export async function createDocument(formData: any, user_id: string | undefined, project_id: string) {
    const response = await fetchAuthedJson(`${apiUrl}/docs/${user_id}?project_id=${project_id}`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  
    if (!response.ok) {
      throw new Error('Failed to save record history');
    }
  }

export async function getDocs(userId: string | undefined) {
  try {
    const response = await fetchAuthed(`${apiUrl}/docs/${userId}`)
  if(!response.ok) {
     throw new Error ("Failed to fetch projects")
    }
  return await response.json();
  } catch (error) {
    console.log('error')
  }
}
