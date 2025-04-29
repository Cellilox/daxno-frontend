'use server'

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  export async function createDocument(formData: any) {
    const response = await fetchAuthedJson(`${apiUrl}/docs/`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  
    if (!response.ok) {
      throw new Error('Failed to save record history');
    }
    revalidatePath('/projects');
  }

export async function getDocs(userId: string | undefined) {
  const response = await fetchAuthed(`${apiUrl}/docs/${userId}`)
  if(!response.ok) {
    throw new Error ("Failed to fetch projects")
  }
  return await response.json();
}
