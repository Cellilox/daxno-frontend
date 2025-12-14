import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionId, getToken } = await auth();
        const token = await getToken();

        if (!userId || !token || !sessionId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Endpoint: /onyx-proxy/generate-login-url
        const response = await fetch(`${BACKEND_URL}/onyx-proxy/generate-login-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "sessionId": sessionId
            }
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`Backend Error (${response.status}): ${err}`);
            return NextResponse.json({ error: err }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (e: any) {
        console.error("Login URL Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
