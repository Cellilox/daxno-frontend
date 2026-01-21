'use server';

import { fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

export async function create_project_invite(invitee_user_email: string, project_id: string) {
  try {
    const url = buildApiUrl('/invites/create');
    const response = await fetchAuthedJson(url, {
      method: 'POST',
      body: JSON.stringify({ invitee_user_email, project_id }),
    })
    // if(!response.ok) {
    //   throw new Error ("Failed to fet url")
    // }
    return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function accept_invite(token: string | string[] | undefined) {
  try {
    const url = buildApiUrl(`/invites/accept?token=${token}`);
    const response = await fetchAuthedJson(url, {
      method: 'POST',
    })
    // if(!response.ok) {
    //   throw new Error ("Failed to fet url")
    // }
    return await response.json();
  } catch (error) {
    console.log('Error', error)
  }
}