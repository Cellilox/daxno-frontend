'use server';

import { fetchAuthedJson, fetchAuthed, buildApiUrl } from "@/lib/api-client";

type SupportCreateData = {
  fullname: string;
  email: string;
  subject: string;
  message: string;
}


export async function createSupportMessage(formData: SupportCreateData) {
  try {
    const url = buildApiUrl('/support');
    const response = await fetchAuthedJson(url, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    //   if (!response.ok) {
    //     throw new Error('Support Message not sent');
    //   }
    alert('Message successfully sent!')
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}
