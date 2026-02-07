"use server"

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";
interface SaveFileUrlError extends Error {
  status?: number;
  details?: string;
}

export const saveGoogleExportHistory = async (projectId: string, fileLink: string): Promise<void> => {
  try {
    const url = buildApiUrl('/google-drive/save-export-history');
    const response = await fetchAuthedJson(url, {
      method: 'POST',
      body: JSON.stringify({
        file_link: fileLink,
        project_id: projectId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: SaveFileUrlError = new Error(errorData.message || 'Failed to save file URL');
      error.status = response.status;
      error.details = errorData.details;
      throw error;
    }
    return response.json();
  } catch (err) {
    console.error('Error saving file URL:', err);
    const error = err as SaveFileUrlError;
    if (error.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.status === 403) {
      throw new Error('You do not have permission to save this file.');
    } else if (error.status === 404) {
      throw new Error('Project not found.');
    } else if (error.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    } else if (error.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to save export information. Please try again.');
    }
  }
};

export const fetchGoogleExportsHistory = async (projectId: string) => {
  try {
    const url = buildApiUrl(`/google-drive/exports-history?project_id=${projectId}`);
    const response = await fetchAuthed(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exports history');
    }
    return response.json();
  } catch (err) {
    console.error('Error fetching file URL:', err);
  }
};

export async function getGoogleDriveAuthUrl(projectId: string) {
  try {
    const url = buildApiUrl(`/google-drive/auth?project_id=${projectId}`);
    const response = await fetchAuthed(url, {
      method: 'GET',
      redirect: 'manual'
    });

    // If we get a redirect response, that's our auth URL
    if (response.status === 307 || response.status === 302) {
      return { auth_url: response.headers.get('location') };
    }

    throw new Error('Unexpected response from server');
  } catch (error) {
    console.error('Error getting Google Drive auth URL:', error);
    throw error;
  }
}

export async function checkDriveStatus(): Promise<{ authenticated: boolean }> {
  const url = buildApiUrl('/google-drive/status');
  const res = await fetchAuthed(url, {
    method: 'GET',
  });
  return res.json();
}

export async function directUploadToDrive(projectId: string) {
  const url = buildApiUrl('/google-drive/upload');
  const res = await fetchAuthedJson(url, {
    method: "POST",
    body: JSON.stringify({ project_id: projectId }),
  });

  const payload = await res.json();

  if (!res.ok) {
    const message = payload.detail || "Upload failed";
    throw new Error(message);
  }

  return payload;
}

export async function DisconnectDrive() {
  try {
    const url = buildApiUrl('/google-drive/disconnect');
    const response = await fetchAuthedJson(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect Google Drive');
    }
  } catch (error) {
    console.log(error)
  }
}