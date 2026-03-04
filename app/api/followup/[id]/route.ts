import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { getUserClient } from "@/lib/db-helper";
import { zaiaAPI } from "@/lib/zaia";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await stackServerApp.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    const client = await getUserClient(user.id, user.primaryEmail, clientId);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    const { id } = await params;

    try {
        await zaiaAPI.deleteFollowUp(id, client.zaiaApiKey);
        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: "Failed to delete follow-up" }, { status: 502 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await stackServerApp.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const clientId = req.nextUrl.searchParams.get("clientId");
    const client = await getUserClient(user.id, user.primaryEmail, clientId);
    if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

    const { id } = await params;
    const body = await req.json();

    try {
        await zaiaAPI.updateFollowUp(id, body, client.zaiaApiKey);
        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: "Failed to update follow-up" }, { status: 502 });
    }
}
