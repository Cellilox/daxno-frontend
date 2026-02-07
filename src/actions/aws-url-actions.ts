'use server';

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

export async function getFileUrl(key: string, projectId: string) {
  try {
    const url = buildApiUrl(`/records/file-url/?key=${key}&project_id=${projectId}`);
    const response = await fetchAuthed(url)
    // if(!response.ok) {
    //   throw new Error ("Failed to fet url")
    // }
    return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function deleteFileUrl(key: string, projectId: string) {
  try {
    const url = buildApiUrl(`/records/delete-file/?file_key=${key}&project_id=${projectId}`);
    const response = await fetchAuthedJson(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete a file');
    }
  } catch (error) {
    console.log(error)
  }
}