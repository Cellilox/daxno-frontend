'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getFileUrl(key: string, projectId: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/records/file-url/?key=${key}&project_id=${projectId}`)
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
    const response = await fetchAuthedJson(`${apiUrl}/records/delete-file/?file_key=${key}&project_id=${projectId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete a file');
    }
  } catch (error) {
    console.log(error)
  }
}