'use server';

import { fetchAuthed, buildApiUrl } from "@/lib/api-client";

export async function download(projectId: string) {
  const url = buildApiUrl(`/download/${projectId}`);
  const response = await fetchAuthed(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to download cv ');
  }
  return await response.blob()
};