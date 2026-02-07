'use server';

import { fetchAuthed, buildApiUrl } from "@/lib/api-client";

export async function getCreditUsage() {
  const url = buildApiUrl('/openrouter/credits');
  const response = await fetchAuthed(url)
  if (!response.ok) {
    throw new Error("Failed to fetch credits")
  }
  return await response.json();
}