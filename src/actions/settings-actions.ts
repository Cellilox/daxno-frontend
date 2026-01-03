'use server';

import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface BillingConfig {
    subscription_type: string;
    byok_api_key?: string;
    has_byok_key?: boolean; // In case we use flag logic later
}

export async function getBillingConfig() {
    try {
        const response = await fetchAuthed(`${apiUrl}/tenants/me`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error("Failed to fetch billing config");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching billing config:", error);
        return null;
    }
}
export async function getTrustedModels() {
    try {
        const response = await fetchAuthedJson(`${apiUrl}/models/trusted`);
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
        const response = await fetchAuthedJson(`${apiUrl}/models/available`);
        if (!response.ok) {
            throw new Error("Failed to fetch available models");
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching available models:", error);
        return null;
    }
}

export async function updateBillingConfig(subscription_type: string, byok_api_key?: string, preferred_models?: any) {
    try {
        const payload = {
            subscription_type,
            byok_api_key,
            preferred_models
        };
        const response = await fetchAuthedJson(`${apiUrl}/tenants/billing-config`, {
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
