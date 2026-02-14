'use server'

import { getProjects } from "./project-actions";
import { getDocs } from "./documents-action";

export async function getDashboardStats(userId: string | undefined) {
    if (!userId) return { projects: 0, pages: 0, docs: 0 };

    try {
        const [projects, docs] = await Promise.all([
            getProjects(),
            getDocs(userId)
        ]);

        return {
            projects: Array.isArray(projects) ? projects.length : 0,
            docs: Array.isArray(docs) ? docs.length : 0,
            pages: Array.isArray(docs)
                ? docs.reduce((sum: number, d: any) => sum + (d.page_number || 0), 0)
                : 0
        };
    } catch (error) {
        console.error("[DashboardAction] Error fetching stats:", error);
        return { projects: 0, pages: 0, docs: 0 };
    }
}
