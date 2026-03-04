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
        const agent = await zaiaAPI.getAgent(client.zaiaAgentId, client.zaiaApiKey);
        return Response.json({ agent });
    } catch {
        return Response.json({ error: "Failed to fetch agent" }, { status: 502 });
    }
}

export async function PATCH(req: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    const client = await getUserClient(user.id, user.primaryEmail, clientId);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    // Only allow a safe subset of fields to be updated
    const body = await req.json();
    const allowed = ["name", "publicName", "openingMessage", "humanTransferMessage", "voiceTone", "language", "timezone"];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
        if (body[key] !== undefined) data[key] = body[key];
    }

    try {
        await zaiaAPI.updateAgent(client.zaiaAgentId, data, client.zaiaApiKey);
        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: "Failed to update agent" }, { status: 502 });
    }
}
