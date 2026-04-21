'use server';

import { fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

type SupportCreateData = {
  fullname: string;
  email: string;
  subject: string;
  message: string;
}


export async function createSupportMessage(formData: SupportCreateData) {
  try {
    const url = buildApiUrl('/support/');
    const response = await fetchAuthedJson(url, {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const detail = await response.text();
      return { ok: false, error: detail || `Request failed (${response.status})` };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    console.log('Error', error);
    return { ok: false, error: 'Server Error' };
  }
}
