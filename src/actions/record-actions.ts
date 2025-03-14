'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthedJson } from "@/lib/api-client";
import { getRequestAuthHeaders, JsonAuthRequestHeaders } from "@/lib/server-headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ocrRagApiUrl = process.env.NEXT_PUBLIC_OCR_RAG_API_URL;

export async function uploadFile(formData: FormData) {
  try {
    const uploadUrl = `${ocrRagApiUrl}/upload/`.replace(/\/+$/, '/');
    
    console.log("Uploading to URL:", uploadUrl);
    const headers = await getRequestAuthHeaders();
    headers.append('X-API-KEY', process.env.NEXT_PUBLIC_OCR_API_KEY || '');
    headers.append('X-OpenAI-Key', process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed response:", errorText);
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}


export async function batchQuery(data: {
  fields: Array<{
    name: string;
    description: string;
    hiddenId: string;
  }>;
}, fileName: string, projectId: string) {
  try {
    const url = `${ocrRagApiUrl}/batch-query?file_name=${fileName}&project_id=${projectId}`;
    
    const headers = await JsonAuthRequestHeaders();
    headers.append('X-API-KEY', process.env.NEXT_PUBLIC_OCR_API_KEY || '');
    headers.append('X-OpenAI-Key', process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
    
    console.log('Sending batch query with data:', {
      url,
      data
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Batch query failed response:", errorText);
      throw new Error(`Querying fields failed: ${errorText}`);
    }
    revalidatePath('/projects');
    return await response.json();
  } catch (error) {
    console.error("Batch query failed:", error);
    throw error;
  }
}


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