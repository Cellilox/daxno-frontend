'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export async function getModels(projectId?: string) {
  const params = new URLSearchParams();
  if (projectId) params.append("project_id", projectId);
  const queryString = params.toString();
  const url = queryString
    ? `${apiUrl}/models/available?${queryString}`
    : `${apiUrl}/models/available`;

  const response = await fetchAuthed(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error("Failed to fetch models")
  }
  return await response.json();
}

export async function selectModel(selectedModel: string, projectId?: string) {
  try {
    const params = new URLSearchParams({ selected_model: selectedModel });
    if (projectId) params.append("project_id", projectId);

    const url = `${apiUrl}/models/select?${params.toString()}`;

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
    const params = new URLSearchParams();
    if (projectId) params.append("project_id", projectId);
    const queryString = params.toString();

    const url = queryString
      ? `${apiUrl}/tenants/selected-model?${queryString}`
      : `${apiUrl}/tenants/selected-model`;

    const response = await fetchAuthed(url, { cache: 'no-store' })
    // if(!response.ok) {
    //     throw new Error ("Failed to fetch user specific ai model")
    // }
    return await response.json();
  } catch (error) {
    console.log("Error", error)
  }
}
