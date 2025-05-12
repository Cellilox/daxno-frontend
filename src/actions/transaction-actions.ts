"use server"

import { fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getTransactions() {
 try {
    const response = await fetchAuthed(`${apiUrl}/transactions`)
    if(!response.ok) {
      throw new Error ("Failed to fetch transaction for this user")
    }
    return response.json();
 } catch (error) {
    console.log(error)
 }
}