'use server';
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
import { getRequestAuthHeaders, JsonAuthRequestHeaders } from "@/lib/server-headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const ocrRagApiUrl = process.env.NEXT_PUBLIC_OCR_RAG_API_URL;


export async function generateLink (project_id: string, plan: string)  {
      const response = await fetchAuthedJson (`${apiUrl}/links/generate_link?project_id=${project_id}&plan=${plan}`, {
        method: 'POST',
      });
    console.log({response})
    if (!response.ok) {
    throw new Error('Failed to generate a link');
    }
    return await response.json()
  };


export async function getLinkData(token: string) {
    try {
        const response = await fetchAuthed(`${apiUrl}/links/get-link/?token=${token}`);
        if (!response.ok) {
            return null; 
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching link data:', error);
        return null; 
    }
}

export async function submitFile(formData: FormData, projectId: string) {
  try {
    const uploadUrl = `${ocrRagApiUrl}/upload/?project_id=${projectId}`;
    
    console.log("Uploading to URL:", uploadUrl);
    const headers = await getRequestAuthHeaders();
    headers.append('X-API-KEY', process.env.NEXT_PUBLIC_OCR_API_KEY || '');
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed response:", errorText);
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}


export async function batchQuery(data: {
  fields: Array<{
    name: string;
    description: string;
    hiddenId: string;
  }>;
}, fileName: string, projectId: string) {
  try {
    const url = `${ocrRagApiUrl}/batch-query?file_name=${fileName}&project_id=${projectId}`;
    
    const headers = await JsonAuthRequestHeaders();
    headers.append('X-API-KEY', process.env.NEXT_PUBLIC_OCR_API_KEY || '');
    
    console.log('Sending batch query with data:', {
      url,
      data
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Querying fields failed: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Batch query failed:", error);
    throw error;
  }
}
