import { fetchAuthed, buildApiUrl } from "@/lib/api-client";

// Helper to get billing config for a specific user (e.g., project owner)
export async function getBillingConfigForUser(userId: string) {
    try {
        const url = buildApiUrl(`/tenants/user/${userId}`);
        const response = await fetchAuthed(url);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Failed to fetch user billing config");
        }
        const data = await response.json();

        return {
            subscription_type: data.subscription_type,
            byok_provider: data.byok_provider,
            preferred_models: data.preferred_models
        };
    } catch (error) {
        console.error("Error fetching user billing config:", error);
        return null;
    }
}
