import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const getBackendUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return url.replace(/\/$/, ""); // Remove trailing slash
};
const BACKEND_URL = getBackendUrl();

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionId, getToken } = await auth();
        const token = await getToken();

        if (!userId || !token || !sessionId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Endpoint: /onyx-proxy/generate-login-url
        const body = await req.json().catch(() => ({}));

        // SECURITY: Validate body - Only allow expected fields
        const safeBody = {
            redirect: body.redirect || "",
            project_id: body.project_id
        };

        const response = await fetch(`${BACKEND_URL}/onyx-proxy/generate-login-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "sessionId": sessionId
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
                const url = new URL(data.url);
                let onyxUrl = process.env.NEXT_PUBLIC_ONYX_URL;
                if (onyxUrl) {
                    onyxUrl = onyxUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
                }
                const allowedHostname = onyxUrl ? new URL(onyxUrl).hostname : null;

                if (!allowedHostname) {
                    return NextResponse.json({ error: "Onyx URL not configured" }, { status: 400 });
                }

                // Normalize localhost and 127.0.0.1 for local dev
                const isLocal = (host: string) => host === "localhost" || host === "127.0.0.1";
                const isValid = isLocal(allowedHostname)
                    ? isLocal(url.hostname)
                    : url.hostname === allowedHostname;

                if (!isValid) {
                    console.error("Backend returned untrusted URL:", data.url, "Expected:", allowedHostname);
                    return NextResponse.json({ error: "Untrusted redirect URL from backend" }, { status: 400 });
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
