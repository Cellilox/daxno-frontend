'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function uploadFile (formData:any)  {
    console.log('TLTTTTl', formData)
      const response = await fetchAuthed(`${apiUrl}/records/upload`, {
        method: 'POST',
        body: formData
      });

    if (!response.ok) {
    throw new Error('Failed to extract text ');
    }
    return await response.json()
  };


export async function extractText(fileName: string) {
    const response = await fetchAuthedJson(`${apiUrl}/records/extract?filename=${fileName}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to extract text on a file');
    }
    return await response.json();
  }

  export async function analyseText(projectId: string, fileName: string, formData: any) {
    const response = await fetchAuthedJson(`${apiUrl}/records/${projectId}/identify-fields?filename=${fileName}`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  
    if (!response.ok) {
      throw new Error('Failed to analyze the text');
    }
    return await response.json();
  }

  export async function saveRecord(formData: any) {
    const response = await fetchAuthedJson(`${apiUrl}/records/save`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  
    if (!response.ok) {
      throw new Error('Failed to save a record');
    }
    return await response.json();
  }

  export async function saveRecordHistory(formData: any) {
    const response = await fetchAuthedJson(`${apiUrl}/records-history/`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  
    if (!response.ok) {
      throw new Error('Failed to save record history');
    }
    revalidatePath('/projects');
  }


export async function updateRecord(recordId: string | undefined , formData: any) {
    console.log('Updating data', formData)
    console.log('hiddenId', recordId)
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