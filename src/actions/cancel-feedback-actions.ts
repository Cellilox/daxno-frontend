'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthedJson, fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


type formData = {
    reason: string
}

export async function create_sub_feedback(formData: formData) {
    try {
    const response = await fetchAuthedJson(`${apiUrl}/cancellations/`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return await response.json();
    } catch (error) {
        console.log('Error', error)
    }
}