'use server';

import { fetchAuthed } from "@/lib/api-client";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function download (projectId:string)  {
      const response = await fetchAuthed(`${apiUrl}/download/${projectId}`, {
        method: 'GET',
      });

    if (!response.ok) {
    throw new Error('Failed to download cv ');
    }
    return await response.blob()
  };