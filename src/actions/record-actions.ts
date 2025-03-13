'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ocrRagApiUrl = process.env.NEXT_PUBLIC_OCR_RAG_API_URL;

// export async function uploadFile(formData: FormData) {
//   try {
//     const response = await fetch(`http://localhost:8000/upload`, {
//       method: "POST",
//       headers: {
//         "X-API-KEY": "my-secret-key-u94u23",
//         "X-OpenAI-Key": "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",
//       },
//       body: formData, // Let browser set Content-Type automatically
//     });

//     if (!response.ok) {
//       const errorBody = await response.text();
//       throw new Error(`Upload failed: ${errorBody}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Upload error:", error);
//     throw error;
//   }
// }


export async function updateRecord(recordId: string, formData: any) {
  const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to update record');
  }
  revalidatePath('/projects');
}

export async function deleteRecord(recordId: string) {
  const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete a record');
  }
  revalidatePath('/projects');
}