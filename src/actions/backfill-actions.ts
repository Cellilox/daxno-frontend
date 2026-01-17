'use server';

import { revalidatePath } from "next/cache";
import { fetchAuthed } from "@/lib/api-client";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function backfillColumn(project_id: string, field_id: string, field_name: string) {
    try {
        const response = await fetchAuthed(
            `${apiUrl}/records/backfill-column?project_id=${project_id}&field_id=${field_id}&field_name=${encodeURIComponent(field_name)}`,
            {
                method: 'POST',
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('[Frontend] Backfill failed:', response.status, errorData);
            throw new Error(`Backfill failed: ${response.status}`);
        }

        const result = await response.json();
        revalidatePath(`/projects/${project_id}`);
        return result;
    } catch (error) {
        console.error('[Frontend] backfillColumn error:', error);
        throw error;
    }
}
