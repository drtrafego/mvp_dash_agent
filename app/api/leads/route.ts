import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { getUserClient } from "@/lib/db-helper";

export async function GET(req: Request) {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const client = await getUserClient(user.id, user.primaryEmail, clientId);
  if (!client) return Response.json({ leads: [] });

  const leads = await db.lead.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ leads });
}
