import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { zaiaAPI } from "@/lib/zaia";
import { getUserClient } from "@/lib/db-helper";

export async function POST(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, message } = await req.json();

  const clientId = req.nextUrl.searchParams.get("clientId");
  const client = await getUserClient(user.id, user.primaryEmail, clientId);
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const conv = await db.conversation.findUnique({ where: { id: conversationId } });
  if (!conv || conv.clientId !== client.id)
    return Response.json({ error: "Not found" }, { status: 404 });

  await zaiaAPI.sendMessage(client.zaiaAgentId, conv.contactPhone, message, client.zaiaApiKey);

  await db.message.create({
    data: { conversationId, direction: "out", content: message, sentBy: "human" },
  });

  await db.conversation.update({
    where: { id: conversationId },
    data: { lastMessage: message.slice(0, 100), lastMessageAt: new Date(), unreadCount: 0 },
  });

  return Response.json({ ok: true });
}
