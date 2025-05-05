'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
import { currentUser } from "@clerk/nextjs/server";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const loggedInUser = async () => {
  const loggedInUser = await currentUser();
  if (!loggedInUser) {
    throw new Error ('No logged in user found');
  }
  return loggedInUser.id;
}

export async function revalidate() {
  revalidatePath('/projects');
}

export async function uploadFile (formData:any, user_id: string | undefined)  {
    console.log('TLTTTTl', formData)
      const response = await fetchAuthed(`${apiUrl}/records/upload?user_id=${user_id}`, {
        method: 'POST',
        body: formData
      });

    if (!response.ok) {
    throw new Error('Failed to upload a file to aws ');
    }
    return await response.json()
  };

  export async function checkFileType (formData:any)  {
    console.log('TLTTTTl', formData)
      const response = await fetchAuthed(`${apiUrl}/records/check-file-type`, {
        method: 'POST',
        body: formData
      });

    if (!response.ok) {
    throw new Error('Failed to extract text ');
    }
    return await response.json()
  };


// export async function extractText(fileName: string) {
//     const response = await fetchAuthedJson(`${apiUrl}/records/extract?filename=${fileName}`, {
//       method: 'POST',
//     });
    
//     if (!response.ok) {
//       throw new Error('Failed to extract text on a file');
//     }
//     return await response.json();
//   }

//   export async function analyseText(projectId: string, fileName: string, formData: any) {
//     const response = await fetchAuthedJson(`${apiUrl}/records/${projectId}/identify-fields?filename=${fileName}`, {
//       method: 'POST',
//       body: JSON.stringify(formData)
//     });
  
//     if (!response.ok) {
//       throw new Error('Failed to analyze the text');
//     }
//     return await response.json();
//   }


  export async function queryDocument(projectId: string, fileName: string) {
    try {
      const response = await fetchAuthedJson(`${apiUrl}/records/query-doc?project_id=${projectId}&filename=${fileName}`, {
        method: 'POST',
      });
      // if (!response.ok) {
      //   throw new Error('Failed to query document');
      // }
  
      return await response.json();
    } catch (error) {
      console.log('EROR', error)
    }
  }

  export async function saveRecord(formData: any, user_id: string ) {
    try {
      const response = await fetchAuthedJson(`${apiUrl}/records/save?user_id=${user_id}`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    
      // if (!response.ok) {
      //   throw new Error('Failed to save a record');
      // }
      return await response.json();
    } catch (error) {
      console.log(error)
    }
  }

export async function updateRecord(recordId: string | undefined , formData: any) {
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