import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { getUserClient } from "@/lib/db-helper";

export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getUserClient(user.id, user.primaryEmail);
  if (!client) return Response.json({ conversations: [] });

  const conversations = await db.conversation.findMany({
    where: { clientId: client.id },
    orderBy: { lastMessageAt: "desc" },
  });

  return Response.json({ conversations });
}
