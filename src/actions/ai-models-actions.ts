'use server';

import { fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export async function getModels() {
  const response = await fetchAuthed(`${apiUrl}/models/available`)
  if(!response.ok) {
    throw new Error ("Failed to fetch columns")
  }
  return await response.json();
}
