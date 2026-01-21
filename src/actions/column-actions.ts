'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

type ColumnCreateData = {
  name: string,
  id: string,
  description: string | ''
}

export async function createColumn(formData: ColumnCreateData, projectId: string) {
  const start = Date.now();
  console.log(`[Perf] Starting createColumn for project ${projectId} at ${start}`);

  const url = buildApiUrl(`/fields/${projectId}`);
  const response = await fetchAuthedJson(url, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  const fetched = Date.now();
  console.log(`[Perf] Backend response received in ${fetched - start}ms. Status: ${response.status}`);

  if (!response.ok) {
    throw new Error('Failed to create column');
  }

  const revalStart = Date.now();
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
  const revalEnd = Date.now();
  console.log(`[Perf] Revalidation took ${revalEnd - revalStart}ms`);
  console.log(`[Perf] Total createColumn time: ${revalEnd - start}ms`);

  return await response.json();
}


export async function getColumns(projectId: string) {
  const url = buildApiUrl(`/fields/${projectId}`);
  const response = await fetchAuthed(url)
  if (!response.ok) {
    throw new Error("Failed to fetch columns")
  }
  return await response.json();
}



export async function updateColumn(fieldId: string | undefined, projectId: string, formData: any) {
  const url = buildApiUrl(`/fields/${fieldId}?project_id=${projectId}`);
  const response = await fetchAuthedJson(url, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to update Column');
  }
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteColumn(fieldId: string, projectId: string) {
  const url = buildApiUrl(`/fields/${fieldId}?project_id=${projectId}`);
  const response = await fetchAuthedJson(url, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete a columnt');
  }
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
}

export async function reorderColumns(prevOrder: number | null, nextOrder: number | null, columnHiddenId: string) {
  const url = buildApiUrl(`/fields/fields/${columnHiddenId}/reorder`);
  const response = await fetchAuthedJson(url, {
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

export async function updateColumnWidth(fieldId: string | undefined, projectId: string, width: number) {
  const url = buildApiUrl(`/fields/${fieldId}?project_id=${projectId}`);
  const response = await fetchAuthedJson(url, {
    method: 'PUT',
    body: JSON.stringify({ width }),
  });

  if (!response.ok) {
    throw new Error('Failed to update column width');
  }
  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
}