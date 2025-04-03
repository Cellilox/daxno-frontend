'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getFileUrl(key: string) {
  const response = await fetchAuthed(`${apiUrl}/records/file-url/?key=${key}`)
  if(!response.ok) {
    throw new Error ("Failed to fet url")
  }
  return await response.json();
}


export async function deleteFileUrl(key: string) {
    const response = await fetchAuthedJson(`${apiUrl}/records/delete-file/?file_key=${key}`, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      throw new Error('Failed to delete a file');
    }
  }