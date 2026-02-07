'use server'

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

export async function createDocument(formData: any, user_id: string | undefined, project_id: string) {
  const url = buildApiUrl(`/docs/${user_id}?project_id=${project_id}`);
  const response = await fetchAuthedJson(url, {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    throw new Error('Failed to save record history');
  }
}

export async function getDocs(userId: string | undefined) {
  try {
    const url = buildApiUrl(`/docs/${userId}`);
    const response = await fetchAuthed(url)
    if (!response.ok) {
      throw new Error("Failed to fetch projects")
    }
    return await response.json();
  } catch (error) {
    console.log('error')
  }
}
