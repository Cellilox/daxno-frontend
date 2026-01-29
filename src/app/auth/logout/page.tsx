"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Resilient Logout Bridge
 * This page handlessynchronized sign-out between Daxno and Onyx (RAG).
 * It pings Onyx to check if the service is up, and if so, redirects to the Onyx logout bridge.
 * If Onyx is unreachable, it gracefully redirects back to the Daxno home page.
 */
export default function LogoutBridge() {
    const router = useRouter();
    const [status, setStatus] = useState("Syncing logout...");

    useEffect(() => {
        const syncLogout = async () => {
            // Configuration
            const onyxApiUrl = process.env.NEXT_PUBLIC_ONYX_URL || "http://localhost:8080";
            const daxnoHomeUrl = window.location.origin;

            // Logic: The bridge logic (logout-bridge) is a FRONTEND route.
            // If the configured URL is the API (port 8080), we need to hit the Web Server (port 3000).
            const cleanApiUrl = onyxApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

            // Determine the Frontend Bridge URL
            // If we are on localhost, we assume the standard Onyx port mapping (Backend 8080 -> Frontend 3000)
            let onyxFrontendUrl = cleanApiUrl;
            if (cleanApiUrl.includes("localhost:8080") || cleanApiUrl.includes("127.0.0.1:8080")) {
                onyxFrontendUrl = cleanApiUrl.replace("8080", "3000");
            }

            const onyxLogoutBridge = `${onyxFrontendUrl}/auth/logout-bridge?next=${encodeURIComponent(daxnoHomeUrl)}`;

            console.log("[LogoutBridge] Attempting synchronized logout:");
            console.log(" - Checking Service:", cleanApiUrl);
            console.log(" - Redirecting to:", onyxLogoutBridge);

            try {
                // Perform a "Pre-flight" check to see if Onyx Backend is reachable
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500);

                const response = await fetch(`${cleanApiUrl}/api/version`, {
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log("[LogoutBridge] Onyx service is reachable. Redirecting to bridge...");
                setStatus("Redirecting to Onyx...");
                window.location.href = onyxLogoutBridge;

            } catch (err) {
                console.warn("[LogoutBridge] Onyx unreachable or timed out. Falling back to Daxno home.", err);
                setStatus("Finalizing Daxno logout...");
                router.push("/");
            }
        };

        syncLogout();
    }, [router]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">{status}</h2>
            <p className="text-gray-500 mt-2">Harmonizing your workspace session...</p>
        </div>
    );
}
