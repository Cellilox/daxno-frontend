'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type ColumnCreateData = {
    name: string,
    id: string,
    description: string | ''
}

export async function createColumn(formData: ColumnCreateData, projectId: string) {
  const response = await fetchAuthedJson(`${apiUrl}/fields/${projectId}`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  console.log('ColllRES', response)
  if (!response.ok) {
    throw new Error('Failed to create column');
  }
  revalidatePath('/projects');
  return await response.json();
}


export async function getColumns(projectId: string) {
  const response = await fetchAuthed(`${apiUrl}/fields/${projectId}`)
  if(!response.ok) {
    throw new Error ("Failed to fetch columns")
  }
  return await response.json();
}



export async function updateColumn(fieldId: string | undefined , formData: any) {
    console.log('Updating data', formData)
    console.log('hiddenId', fieldId)
  const response = await fetchAuthedJson(`${apiUrl}/fields/${fieldId}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to update Column');
  }
  revalidatePath('/projects');
}

export async function deleteColumn(fieldId: string) {
    const response = await fetchAuthedJson(`${apiUrl}/fields/${fieldId}`, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      throw new Error('Failed to delete a columnt');
    }
    revalidatePath('/projects');
  }