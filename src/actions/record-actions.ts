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

      console.error(`[Frontend] Upload failed: ${response.status}`);
      // SECURITY: Do NOT log full error detail to client console to prevent leaking backend secrets.

      // Return a structured error object that Dropzone can check
      return { detail: errorDetail || errorMessage };
    }
    return await response.json()
  } catch (error) {
    console.error('[Frontend] Error in uploadFile:', error)
    throw error;
  }
};

export async function getPresignedUrl(filename: string, projectId: string, contentType?: string) {
  try {
    const url = new URL(`${apiUrl}/records/presigned-url`);
    url.searchParams.append('filename', filename);
    url.searchParams.append('project_id', projectId);
    if (contentType) {
      url.searchParams.append('content_type', contentType);
    }

    const response = await fetchAuthedJson(url.toString(), {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Frontend] getPresignedUrl failed:', response.status, errorText);
      throw new Error(`Failed to get presigned URL: ${response.status}`);
    }

    const data = await response.json();
    console.log('[DEBUG] getPresignedUrl result:', data);

    if (!data.filename || data.filename === 'undefined') {
      console.error('[ERROR] Backend returned invalid filename:', data);
      throw new Error("Backend returned invalid storage filename");
    }

    return data;
  } catch (error) {
    console.error('[Frontend] Error in getPresignedUrl action:', error);
    throw error;
  }
}



export async function queryDocument(projectId: string, filename: string, original_filename?: string) {
  try {
    let url = `${apiUrl}/records/query-doc?project_id=${projectId}&filename=${filename}`;
    if (original_filename) {
      url += `&original_filename=${encodeURIComponent(original_filename)}`;
    }
    const response = await fetchAuthed(url, {
      method: 'POST',
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorData = await response.json();
        errorDetail = errorData?.detail ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)) : JSON.stringify(errorData);
      } catch (e) {
        errorDetail = await response.text();
      }
      console.error(`[Frontend] queryDocument failed: ${response.status}`, errorDetail);
      throw new Error(errorDetail || 'Analysis failed. Please try again.');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[Frontend] Error in queryDocument:', error);
    // Re-throw the actual error message
    throw error;
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

export async function getRecords(projectId: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/records/${projectId}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch records: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('[Frontend] getRecords failed:', error);
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

export async function checkRecordStatus(projectId: string, filename: string) {
  try {
    // We fetch all records for the project and check if our file exists
    // Ideally we would have a specific endpoint for this, but this works for now
    const response = await fetchAuthedJson(`${apiUrl}/records/${projectId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      return null;
    }

    const records = await response.json();
    // Check if any record matches the unique filename (the UUID one)
    // The backend saves 'filename' as the unique UUID string (e.g. "uuid.pdf")
    const foundRecord = records.find((r: any) => r.filename === filename && r.filename !== null);

    return foundRecord || null;
  } catch (error) {
    console.error('[Frontend] Check Status Failed:', error);
    return null;
  }
}