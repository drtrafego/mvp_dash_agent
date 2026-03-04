import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { getUserClient } from "@/lib/db-helper";
import { zaiaAPI } from "@/lib/zaia";

export async function GET(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    const client = await getUserClient(user.id, user.primaryEmail, clientId);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    try {
        const data = await zaiaAPI.listFollowUps(client.zaiaAgentId, client.zaiaApiKey);
        return Response.json(data);
    } catch {
        return Response.json({ followUps: [] });
    }
}

export async function POST(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    const client = await getUserClient(user.id, user.primaryEmail, clientId);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    const { sessionId, message, delayMinutes } = await req.json();
    if (!sessionId || !message || delayMinutes === undefined) {
        return Response.json({ error: "sessionId, message and delayMinutes are required" }, { status: 400 });
    }

    try {
        const result = await zaiaAPI.createFollowUp(client.zaiaAgentId, { sessionId, message, delayMinutes }, client.zaiaApiKey);
        return Response.json(result);
    } catch {
        return Response.json({ error: "Failed to create follow-up" }, { status: 502 });
    }
}
