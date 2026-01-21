'use server';
import { fetchAuthed, buildApiUrl } from "@/lib/api-client";

export async function getProject(token: string) {
    const shareableLink = `${process.env.NEXT_PUBLIC_CLIENT_URL}/submissions/${token}`
    try {
        const url = buildApiUrl(`/links/validate-link?shareable_link=${shareableLink}`);
        const response = await fetchAuthed(url);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching project data:', error);
        return null;
    }
}

