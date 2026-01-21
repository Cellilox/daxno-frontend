'use server';

import { fetchAuthedJson, fetchAuthed, buildApiUrl } from "@/lib/api-client";


type formData = {
  reason: string
}

export async function create_sub_feedback(formData: formData) {
  try {
    const url = buildApiUrl('/cancellations/');
    const response = await fetchAuthedJson(url, {
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