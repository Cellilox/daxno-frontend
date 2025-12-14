'use server';
import { fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function getProject(token: string) {
    const shareableLink = `${process.env.NEXT_PUBLIC_CLIENT_URL}/submissions/${token}`
    try {
        const response = await fetchAuthed(`${apiUrl}/links/validate-link?shareable_link=${shareableLink}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project data:', error);
        return null;
    }
}

