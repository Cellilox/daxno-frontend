"use client";

import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { getOnyxDeepLink } from "@/actions/project-actions";

interface OnyxDeepLinkButtonProps {
    projectId: string;
    projectName: string;
    onyxProjectId?: number;
}

const isValidOnyxUrl = (urlString: string) => {
    try {
        const url = new URL(urlString);
        let onyxUrl = process.env.NEXT_PUBLIC_ONYX_URL;
        if (onyxUrl) {
            onyxUrl = onyxUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
        }
        if (!onyxUrl) return false;

        const allowedHostname = new URL(onyxUrl).hostname;

        // Normalize localhost and 127.0.0.1 for local dev
        const isLocal = (host: string) => host === "localhost" || host === "127.0.0.1";

        if (isLocal(allowedHostname)) {
            return isLocal(url.hostname);
        }

        return url.hostname === allowedHostname;
    } catch {
        return false;
    }
};

export default function OnyxDeepLinkButton({ projectId }: OnyxDeepLinkButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDeepLink = async () => {
        setLoading(true);
        try {
            const data = await getOnyxDeepLink(projectId);
            if (data && data.url) {
                if (isValidOnyxUrl(data.url)) {
                    window.open(data.url, "_blank");
                } else {
                    console.error("Invalid host in Onyx URL", data.url);
                    alert("Security Check: The link provided by the server is not on the allowed list.");
                }
            } else {
                console.error("No URL returned", data);
                alert("Could not connect to AI Insights. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Error opening AI Insights.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDeepLink}
            disabled={loading}
            className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 transition-colors"
        >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            {loading ? "Connecting..." : "Deep Insights & Chat"}
            {!loading && <ExternalLink className="w-3 h-3 ml-2 opacity-70" />}
        </button>
    );
}
