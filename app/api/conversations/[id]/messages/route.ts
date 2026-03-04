import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const client = await db.client.findUnique({ where: { stackUserId: user.id } });
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const conv = await db.conversation.findUnique({ where: { id } });
  if (!conv || conv.clientId !== client.id)
    return Response.json({ error: "Not found" }, { status: 404 });

  await db.conversation.update({ where: { id }, data: { unreadCount: 0 } });

  const messages = await db.message.findMany({
    where: { conversationId: id },
    orderBy: { timestamp: "asc" },
  });

  return Response.json({ messages, conversation: conv });
}
