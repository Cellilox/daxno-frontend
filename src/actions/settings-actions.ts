'use server';

import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";

export interface BillingConfig {
    subscription_type: string;
    byok_api_key?: string;
    has_byok_key?: boolean; // In case we use flag logic later
}

export async function getBillingConfig() {
    try {
        const url = buildApiUrl('/tenants/me');
        const response = await fetchAuthed(url);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Failed to fetch billing config");
        }
        const data = await response.json();

        // SECURITY: Redact sensitive fields before returning to client
        return {
            subscription_type: data.subscription_type,
            has_byok_key: !!data.byok_api_key && data.byok_api_key !== "••••••••",
            // Do NOT return byok_api_key (raw or masked) if not needed for display.
            // If strictly needed for UI "masked state", ensure it is "••••••••" from backend.
            byok_api_key: data.byok_api_key ? "••••••••" : undefined,
            byok_provider: data.byok_provider,
            preferred_models: data.preferred_models
        };
    } catch (error) {
        console.error("Error fetching billing config:", error);
        return null;
    }
}

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
export async function getTrustedModels() {
    try {
        const url = buildApiUrl('/models/trusted');
        const response = await fetchAuthedJson(url);
        if (!response.ok) {
            throw new Error("Failed to fetch trusted models");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching trusted models:", error);
        return null;
    }
}

export async function getAllModels() {
    try {
        const url = buildApiUrl('/models/available');
        const response = await fetchAuthedJson(url);
        if (!response.ok) {
            throw new Error("Failed to fetch available models");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching available models:", error);
        return null;
    }
}

export async function updateBillingConfig(subscription_type: string, byok_api_key?: string, preferred_models?: any, byok_provider?: string) {
    try {
        const payload = {
            subscription_type,
            byok_api_key,
            preferred_models,
            byok_provider
        };
        const url = buildApiUrl('/tenants/billing-config');
        const response = await fetchAuthedJson(url, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Failed to update billing config");
        }
        return response.json();
    } catch (error) {
        console.error("Error updating billing config:", error);
        throw error;
    }
}

export async function provisionManagedByok(limit: number = 0.02) {
    try {
        const url = buildApiUrl(`/tenants/provision-byok?limit=${limit}`);
        const response = await fetchAuthedJson(url, {
            method: "POST"
        });
        if (!response.ok) throw new Error("Failed to provision Managed BYOK key");
        return response.json();
    } catch (error) {
        console.error("Error provisioning managed BYOK:", error);
        throw error;
    }
}

export async function rotateManagedByok() {
    try {
        const url = buildApiUrl('/tenants/rotate-byok');
        const response = await fetchAuthedJson(url, {
            method: "POST"
        });
        if (!response.ok) throw new Error("Failed to rotate Managed BYOK key");
        return response.json();
    } catch (error) {
        console.error("Error rotating managed BYOK:", error);
        throw error;
    }
}

export async function getByokUsage() {
    try {
        const url = buildApiUrl('/tenants/byok-usage');
        const response = await fetchAuthed(url);
        if (!response.ok) throw new Error("Failed to fetch BYOK usage");
        return response.json();
    } catch (error) {
        console.error("Error fetching BYOK usage:", error);
        return null;
    }
}

export async function getManagedByokActivity(limit: number = 50, offset: number = 0) {
    try {
        const url = buildApiUrl(`/tenants/byok-activity?limit=${limit}&offset=${offset}`);
        const response = await fetchAuthedJson(url);
        if (!response.ok) throw new Error("Failed to fetch BYOK activity");
        return response.json();
    } catch (error) {
        console.error("Error fetching BYOK activity:", error);
        return [];
    }
}

export async function getProviderModels(provider: string) {
    try {
        const url = buildApiUrl(`/models/provider-models?provider=${provider}`);
        const response = await fetchAuthedJson(url);
        if (!response.ok) {
            throw new Error("Failed to fetch provider models");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching provider models:", error);
        return null;
    }
}

export async function verifyProviderKey(provider: string, apiKey: string) {
    try {
        const url = buildApiUrl('/tenants/verify-provider-key');
        const response = await fetchAuthedJson(url, {
            method: "POST",
            body: JSON.stringify({
                provider,
                api_key: apiKey
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Verification failed");
        }

        return response.json();
    } catch (error) {
        console.error("Error verifying provider key:", error);
        throw error;
    }
}
