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
  console.log('Creating project with data:', formData);
  try {
    const response = await fetchAuthedJson(`${apiUrl}/projects`, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create project: ${response.status} ${response.statusText}`, errorText);
      throw new Error(errorText || 'Failed to create project');
    }

    revalidatePath('/projects');
    return await response.json();
  } catch (error) {
    console.error('Error in createProject action:', error);
    throw error;
  }
}

export async function getProjects() {
  console.log('Fetching projects from:', `${apiUrl}/projects/`);
  try {
    const response = await fetchAuthed(`${apiUrl}/projects/`)
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch projects: ${response.status} ${response.statusText}`, errorText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectsById(projectId: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/projects/${projectId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch projects")
    }
    return await response.json();
  } catch (error) {
    console.log(error)
  }
}

export async function updateProject(projectId: string | undefined, formData: projectUpdateData) {
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


export async function get_project_plan(project_owner: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/projects/get-project-plan?project_owner=${project_owner}`)
    // if(!response.ok) {
    //   throw new Error ("Failed to fetch projects")
    // }
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}

export async function getOnyxDeepLink(projectId: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/onyx-proxy/project-deep-link/${projectId}`)
    if (!response.ok) {
      throw new Error("Failed to get deep link");
    }
    return await response.json();
  } catch (error) {
    console.log("Deep Link Error", error);
    throw error;
  }
}