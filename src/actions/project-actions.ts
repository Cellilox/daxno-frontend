'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthedJson, fetchAuthed, buildApiUrl } from "@/lib/api-client";

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
    const url = buildApiUrl('/projects/');
    const response = await fetchAuthedJson(url, {
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

export async function updateProjectSettings(projectId: string, uiSettings: any) {
  try {
    const url = buildApiUrl(`/projects/${projectId}`);
    const response = await fetchAuthedJson(url, {
      method: "PUT",
      body: JSON.stringify({ ui_settings: uiSettings }),
    });

    if (!response.ok) {
      throw new Error("Failed to update project settings");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating project settings:", error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const url = buildApiUrl('/projects/');
    const response = await fetchAuthedJson(url, {
      method: 'GET',
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProjectsById(id: string) {
  const url = buildApiUrl(`/projects/${id}`);
  const response = await fetchAuthedJson(url, {
    method: 'GET',
  });
  return await response.json();
}

export async function updateProject(projectId: string | undefined, formData: projectUpdateData) {
  try {
    const url = buildApiUrl(`/projects/${projectId}`);
    const response = await fetchAuthedJson(url, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });

    revalidatePath('/projects');
    return await response.json()
  } catch (error) {
    console.log(error)
  }

}

export async function updateProjectById(id: string, formData: projectCreateData) {
  const url = buildApiUrl(`/projects/${id}`);
  const response = await fetchAuthedJson(url, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });
  revalidatePath('/projects');
  return await response.json();
}

export async function regenerateProjectLink(projectId: string | undefined, formData: projectUpdateData) {
  try {
    const url = buildApiUrl(`/projects/regenerate-link/${projectId}`);
    const response = await fetchAuthedJson(url, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });

    revalidatePath('/projects');
    return await response.json()
  } catch (error) {
    console.log(error)
  }

}

export async function regenerateLink(id: string, formData: projectCreateData) {
  const url = buildApiUrl(`/projects/regenerate-link/${id}`);
  const response = await fetchAuthedJson(url, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });
  revalidatePath('/projects');
  return await response.json();
}

export async function deleteProject(projectId: string) {
  const url = buildApiUrl(`/projects/${projectId}`);
  const response = await fetchAuthedJson(url, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete a project');
  }
  revalidatePath('/projects');
}


export async function get_project_plan(project_owner: string) {
  try {
    const url = buildApiUrl(`/projects/get-project-plan?project_owner=${project_owner}`);
    const response = await fetchAuthed(url)
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
    const url = buildApiUrl(`/onyx-proxy/project-deep-link/${projectId}`);
    const response = await fetchAuthed(url)
    if (!response.ok) {
      throw new Error("Failed to get deep link");
    }
    return await response.json();
  } catch (error) {
    console.log("Deep Link Error", error);
    throw error;
  }
}