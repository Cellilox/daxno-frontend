"use server"

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
interface SaveFileUrlError extends Error {
    status?: number;
    details?: string;
  }
  
  export const saveFileUrl = async (projectId: string, fileData: { fileLink: string; fileName: string }): Promise<void> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/drive-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileLink: fileData.fileLink,
          fileName: fileData.fileName,
          exportDate: new Date().toISOString(),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: SaveFileUrlError = new Error(errorData.message || 'Failed to save file URL');
        error.status = response.status;
        error.details = errorData.details;
        throw error;
      }
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to save file URL');
      }
    } catch (err) {
      console.error('Error saving file URL:', err);
      const error = err as SaveFileUrlError;
      
      // Handle specific error cases
      if (error.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.status === 403) {
        throw new Error('You do not have permission to save this file.');
      } else if (error.status === 404) {
        throw new Error('Project not found.');
      } else if (error.status === 409) {
        throw new Error('A file with this name already exists.');
      } else if (error.status === 413) {
        throw new Error('File name is too long. Please use a shorter name.');
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
  
  export const fetchCurrentFileUrl = async (projectId: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/drive-export`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: SaveFileUrlError = new Error(errorData.message || 'Failed to fetch file URL');
        error.status = response.status;
        error.details = errorData.details;
        throw error;
      }
  
      const data = await response.json();
      return data.fileLink || null;
    } catch (err) {
      console.error('Error fetching file URL:', err);
      const error = err as SaveFileUrlError;
      
      // Handle specific error cases
      if (error.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.status === 403) {
        throw new Error('You do not have permission to view this file.');
      } else if (error.status === 404) {
        return null; // No file exists yet, which is fine
      } else if (error.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      } else if (error.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error('Failed to fetch file information. Please try again.');
      }
    }
  }; 



const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getGoogleDriveAuthUrl(projectId: string) {
  try {
    const response = await fetchAuthed(`${apiUrl}/google-drive/auth?project_id=${projectId}`, {
      method: 'GET',
      // Don't follow redirects
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
  const res = await fetchAuthed(`${apiUrl}/google-drive/status`, {
    method: 'GET',
  });
  return res.json();
}

export async function directUploadToDrive(projectId: string){
  try {
    const res = await fetchAuthedJson(`${apiUrl}/google-drive/upload`, {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId })
    });
    console.log('RRR', await res.json());
    // if (!res.ok) throw new Error('Upload failed');
    return res.json();
  } catch (error) {
    console.log('Error uploading to Google Drive:', error);
  }
}