import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { zaiaAPI } from "@/lib/zaia";

export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await db.client.findUnique({ where: { stackUserId: user.id } });
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  let zaiaUsage = null;
  try { zaiaUsage = await zaiaAPI.getUsage(client.zaiaApiKey); } catch { /* not configured yet */ }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [msgsToday, totalConversations, openConversations, leadsThisMonth] = await Promise.all([
    db.message.count({ where: { conversation: { clientId: client.id }, timestamp: { gte: today } } }),
    db.conversation.count({ where: { clientId: client.id } }),
    db.conversation.count({ where: { clientId: client.id, status: "open" } }),
    db.lead.count({ where: { clientId: client.id, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);

  return Response.json({ zaia: zaiaUsage, local: { msgsToday, totalConversations, openConversations, leadsThisMonth } });
}
