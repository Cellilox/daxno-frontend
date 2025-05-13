'use server';

import { fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export async function create_project_invite(invitee_user_email: string, project_id: string) {
  try {
    const response = await fetchAuthedJson(`${apiUrl}/invites/create`, {
        method: 'POST',
        body: JSON.stringify({invitee_user_email, project_id}),
    })
  // if(!response.ok) {
  //   throw new Error ("Failed to fet url")
  // }
  console.log('RES', response)
  return response.json();
  } catch (error) {
    console.log('Error', error)
  }
}


export async function accept_invite(token: string | string[] | undefined) {
    try {
        const response = await fetchAuthedJson(`${apiUrl}/invites/accept?token=${token}`, {
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