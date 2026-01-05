'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export async function getModels(projectId?: string) {
  const url = projectId
    ? `${apiUrl}/models/available?project_id=${projectId}`
    : `${apiUrl}/models/available`;

  const response = await fetchAuthed(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error("Failed to fetch models")
  }
  return await response.json();
}

export async function selecte_model(selectedModal: string, projectId?: string) {
  try {
    const url = projectId
      ? `${apiUrl}/models/select?selected_model=${selectedModal}&project_id=${projectId}`
      : `${apiUrl}/models/select?selected_model=${selectedModal}`;

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
    const url = projectId
      ? `${apiUrl}/tenants/selected-model?project_id=${projectId}`
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
