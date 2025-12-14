"use client";

import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { getOnyxDeepLink } from "@/actions/project-actions";

interface OnyxDeepLinkButtonProps {
    projectId: string;
    projectName: string;
    onyxProjectId?: number;
}

export default function OnyxDeepLinkButton({ projectId }: OnyxDeepLinkButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDeepLink = async () => {
        setLoading(true);
        try {
            const data = await getOnyxDeepLink(projectId);
            if (data && data.url) {
                window.open(data.url, "_blank");
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
