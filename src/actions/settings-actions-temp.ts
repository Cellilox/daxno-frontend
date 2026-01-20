import { fetchAuthed } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Helper to get billing config for a specific user (e.g., project owner)
export async function getBillingConfigForUser(userId: string) {
    try {
        const response = await fetchAuthed(`${apiUrl}/tenants/user/${userId}`);
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
