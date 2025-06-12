'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthedJson, fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type projectCreateData = {
    name: string
}

type projectUpdateData = {
    name?: string
    description?: string,
    link_is_active?: boolean
}

export async function createProject(formData: projectCreateData) {
  const response = await fetchAuthedJson(`${apiUrl}/projects`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error('Failed to create project');
  }

  revalidatePath('/projects');
  return await response.json();
}

export async function getProjects() {
  try {
    const response = await fetchAuthed(`${apiUrl}/projects/`)
    // if(!response.ok) {
    //   throw new Error ("Failed to fetch projects")
    // }
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}

export async function getProjectsById(projectId: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/projects/${projectId}`)
  if(!response.ok) {
    throw new Error ("Failed to fetch projects")
  }
  return await response.json();
  } catch (error) {
    console.log(error)
  }
}

export async function updateProject(projectId: string | undefined, formData: projectUpdateData) {
  console.log('FormData', formData)
  try {
    const response = await fetchAuthedJson(`${apiUrl}/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });
  
  revalidatePath('/projects');
  return await response.json()
  } catch (error) {
    console.log(error)
  }

}

export async function regenerateProjectLink(projectId: string | undefined, formData: projectUpdateData) {
  console.log('FormData', formData)
  try {
    const response = await fetchAuthedJson(`${apiUrl}/projects/regenerate-link/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });
  
  revalidatePath('/projects');
  return await response.json()
  } catch (error) {
    console.log(error)
  }

}

export async function deleteProject(projectId: string) {
    const response = await fetchAuthedJson(`${apiUrl}/projects/${projectId}`, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      throw new Error('Failed to delete a project');
    }
    revalidatePath('/projects');
  }