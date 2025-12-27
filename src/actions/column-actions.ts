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

  if (!response.ok) {
    throw new Error('Failed to create column');
  }
  revalidatePath('/projects');
  return await response.json();
}


export async function getColumns(projectId: string) {
  const response = await fetchAuthed(`${apiUrl}/fields/${projectId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch columns")
  }
  return await response.json();
}



export async function updateColumn(fieldId: string | undefined, projectId: string, formData: any) {
  const response = await fetchAuthedJson(`${apiUrl}/fields/${fieldId}?project_id=${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to update Column');
  }
  revalidatePath('/projects');
}

export async function deleteColumn(fieldId: string, projectId: string) {
  const response = await fetchAuthedJson(`${apiUrl}/fields/${fieldId}?project_id=${projectId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete a columnt');
  }
  revalidatePath('/projects');
}

export async function reorderColumns(prevOrder: number | null, nextOrder: number | null, columnHiddenId: string) {
  const response = await fetchAuthedJson(`${apiUrl}/fields/fields/${columnHiddenId}/reorder`, {
    method: 'PUT',
    body: JSON.stringify({
      previous_order: prevOrder,
      next_order: nextOrder,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to reorder columns');
  }
  revalidatePath('/projects');
}