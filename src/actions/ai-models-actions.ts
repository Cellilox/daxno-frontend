'use server';

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

export async function getModels(projectId?: string) {
  const path = `/models/available${projectId ? `?project_id=${projectId}` : ''}`;
  const url = buildApiUrl(path);

  const response = await fetchAuthed(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error("Failed to fetch models")
  }
  return await response.json();
}

export async function selectModel(selectedModel: string, projectId?: string) {
  try {
    const path = `/models/select?selected_model=${encodeURIComponent(selectedModel)}${projectId ? `&project_id=${projectId}` : ''}`;
    const url = buildApiUrl(path);

    const response = await fetchAuthedJson(url, {
      method: 'PATCH'
    });

    if (!response.ok) {
      throw new Error('Failed to select an ai model');
    }
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}

export async function getSelectedModel(projectId?: string) {
  try {
    const path = `/tenants/selected-model${projectId ? `?project_id=${projectId}` : ''}`;
    const url = buildApiUrl(path);

    const response = await fetchAuthed(url, { cache: 'no-store' })
    return await response.json();
  } catch (error) {
    console.log("Error", error)
  }
}
