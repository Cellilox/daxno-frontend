'use server';

import { fetchAuthedJson, fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

type SupportCreateData = {
    fullname: string;
    email: string;
    subject: string;
    message: string;
}


export async function createSupportMessage(formData: SupportCreateData) {
  try {
      const response = await fetchAuthedJson(`${apiUrl}/support`, {
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
