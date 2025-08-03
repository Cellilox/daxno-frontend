'use server';

import { fetchAuthed} from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export async function getCreditUsage() {
  const response = await fetchAuthed(`${apiUrl}/openrouter/credits`)
  if(!response.ok) {
    throw new Error ("Failed to fetch credits")
  }
  return await response.json();
}