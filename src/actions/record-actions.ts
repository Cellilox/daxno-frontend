'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function revalidate() {
  revalidatePath('/projects');
}

export async function uploadFile(formData: any, projectId: string | undefined) {
  try {
    const response = await fetchAuthed(`${apiUrl}/records/upload?project_id=${projectId}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorDetail = '';
      try {
        const errorData = await response.json();
        // If the backend sends { detail: "..." }
        if (errorData?.detail) {
          errorDetail = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        } else {
          errorDetail = JSON.stringify(errorData);
        }
      } catch (e) {
        // If not JSON, try text
        errorDetail = await response.text();
      }

      console.error(`[Frontend] Upload failed: ${response.status}`, errorDetail);
      // Return a structured error object that Dropzone can check
      return { detail: errorDetail || errorMessage };
    }
    return await response.json()
  } catch (error) {
    console.error('[Frontend] Error in uploadFile:', error)
    throw error;
  }
};



export async function queryDocument(projectId: string, fileName: string) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/records/query-doc?project_id=${projectId}&filename=${fileName}`, {
      method: 'POST',
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData?.detail ? JSON.stringify(errorData.detail) : JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text();
      }
      console.error(`[Frontend] queryDocument failed: ${response.status}`, errorDetail);
      throw new Error(`Query failed: ${errorDetail}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[Frontend] Error in queryDocument:', error);
    // Re-throw with message to be caught by UI
    throw new Error(error.message || 'Failed to analyze document');
  }
}

export async function saveRecord(formData: any, user_id: string) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/records/save?user_id=${user_id}`, {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Frontend] Save Record Failed: ${response.status}`, text);
      throw new Error('Failed to save a record');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Frontend] Error in saveRecord:', error)
    throw error;
  }
}

export async function updateRecord(recordId: string | undefined, formData: any) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error('Failed to update record');
    }
  } catch (error) {
    console.log(error)
  }
}

export async function deleteRecord(recordId: string) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/records/${recordId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete a record');
    }
  } catch (error) {
    console.log(error)
  }
}