import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { zaiaAPI } from "@/lib/zaia";
import { getUserClient } from "@/lib/db-helper";

export async function PATCH(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { mode, sessionId } = await req.json();
  if (!["bot", "humano", "pausado"].includes(mode))
    return Response.json({ error: "Invalid mode" }, { status: 400 });

  const client = await getUserClient(user.id, user.primaryEmail);
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  await zaiaAPI.setMode(client.zaiaAgentId, mode, client.zaiaApiKey, sessionId);

  if (sessionId) {
    await db.conversation.updateMany({
      where: { clientId: client.id, contactPhone: sessionId },
      data: { mode },
    });
  }

  return Response.json({ ok: true, mode });
}
