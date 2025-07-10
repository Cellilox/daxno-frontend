'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export async function getModels() {
  const response = await fetchAuthed(`${apiUrl}/models/available`)
  if(!response.ok) {
    throw new Error ("Failed to fetch columns")
  }
  return await response.json();
}

export async function selecte_model(selectedModal: string) {
 try {
    const response = await fetchAuthedJson(`${apiUrl}/models/select?selected_model=${selectedModal}`, {
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



export async function getSelectedModel() {
  try {
    const response = await fetchAuthed(`${apiUrl}/tenants/selected-model`)
    // if(!response.ok) {
    //     throw new Error ("Failed to fetch user specific ai model")
    // }
    return await response.json();
  } catch (error) {
    console.log("Error", error)
  }
}
