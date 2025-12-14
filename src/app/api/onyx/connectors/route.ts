import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
    try {
        const { userId, sessionId, getToken } = await auth();
        const token = await getToken();

        if (!userId || !token || !sessionId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Endpoint: /onyx-proxy/connectors
        const response = await fetch(`${BACKEND_URL}/onyx-proxy/connectors`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "sessionId": sessionId
            }
        });

        if (!response.ok) {
            const err = await response.text();
            return NextResponse.json({ error: `Backend Proxy Error: ${err}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (e: any) {
        console.error("Connector Proxy Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
