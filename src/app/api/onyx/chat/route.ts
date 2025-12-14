import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEFAULT_PERSONA_ID = 0;

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionId, getToken } = await auth();
        const token = await getToken();

        if (!userId || !token || !sessionId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { message, chatId } = await req.json();
        let activeChatId = chatId;

        // 1. Create Session via Proxy if Create needed
        if (!activeChatId) {
            console.log(`[Chat Route] Creating session at ${BACKEND_URL}...`);
            const createRes = await fetch(`${BACKEND_URL}/onyx-proxy/chat/create-chat-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "sessionId": sessionId
                },
                body: JSON.stringify({
                    persona_id: DEFAULT_PERSONA_ID,
                    description: "Daxno Chat (Private)"
                })
            });

            if (!createRes.ok) {
                const err = await createRes.text();
                throw new Error(`Failed to create session: ${err}`);
            }

            const sessionData = await createRes.json();
            activeChatId = sessionData.chat_session_id;
        }

        // 2. Send Message via Proxy
        const upstreamRes = await fetch(`${BACKEND_URL}/onyx-proxy/chat/send-message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "sessionId": sessionId
            },
            body: JSON.stringify({
                persona_id: DEFAULT_PERSONA_ID,
                chat_session_id: activeChatId,
                message: message,
                parent_message_id: null,
                search_doc_ids: [],
                retrieval_options: {
                    run_search: "always",
                    real_time: true,
                    filters: null
                }
            })
        });

        if (!upstreamRes.ok) {
            const err = await upstreamRes.text();
            throw new Error(`Proxy Error: ${err}`);
        }

        // 3. Streaming Response with Chat ID Header
        const headers = new Headers(upstreamRes.headers);
        headers.set("X-Onyx-Chat-Id", activeChatId);
        headers.set("Content-Type", "text/event-stream");
        headers.set("Cache-Control", "no-cache");
        headers.set("Connection", "keep-alive");

        return new Response(upstreamRes.body, {
            status: 200,
            headers: headers
        });

    } catch (e: any) {
        console.error("Chat Proxy Error Details:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
