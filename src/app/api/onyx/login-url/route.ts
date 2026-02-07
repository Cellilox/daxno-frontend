import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSafeUrl, buildApiUrl } from "@/lib/api-utils";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    try {
        const { userId, getToken } = await auth();
        const token = await getToken();

        if (!userId || !token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Endpoint: /onyx-proxy/generate-login-url
        const body = await req.json().catch(() => ({}));

        // SECURITY: Validate body - Only allow expected fields
        const safeBody = {
            redirect: body.redirect || "",
            project_id: body.project_id
        };

        const url = buildApiUrl('/onyx-proxy/generate-login-url');
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(safeBody)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`Backend Error (${response.status}): ${err}`);
            return NextResponse.json({ error: err }, { status: response.status });
        }

        const data = await response.json();

        // Basic validation of the URL before returning to client
        if (data && data.url) {
            try {
                // For local dev/proxy testing, we trust the hostname if it matches our proxy setup
                const onyxUrl = process.env.NEXT_PUBLIC_ONYX_URL || '/api/proxy/onyx';
                const safeOnyxUrl = getSafeUrl(onyxUrl);

                let allowedHostname: string | null = null;
                if (safeOnyxUrl.startsWith('http')) {
                    allowedHostname = new URL(safeOnyxUrl).hostname;
                }

                // If we are using relative proxy, we trust the backend's returned URL but ensure it's valid
                if (!allowedHostname || allowedHostname === 'localhost' || allowedHostname === '127.0.0.1') {
                    // Allow local/proxy hostnames
                    return NextResponse.json({ url: data.url });
                }
                return NextResponse.json({ url: data.url });
            } catch {
                return NextResponse.json({ error: "Invalid URL from backend" }, { status: 400 });
            }
        }

        return NextResponse.json({ error: "Missing URL in backend response" }, { status: 400 });

    } catch (e: any) {
        console.error("Login URL Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
