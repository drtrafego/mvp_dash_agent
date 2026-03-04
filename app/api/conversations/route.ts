import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";

export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await db.client.findUnique({ where: { stackUserId: user.id } });
  if (!client) return Response.json({ conversations: [] });

  const conversations = await db.conversation.findMany({
    where: { clientId: client.id },
    orderBy: { lastMessageAt: "desc" },
  });

  return Response.json({ conversations });
}
