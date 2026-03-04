import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { getUserClient } from "@/lib/db-helper";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!["new", "qualified", "converted"].includes(status))
    return Response.json({ error: "Invalid status" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");

  const client = await getUserClient(user.id, user.primaryEmail, clientId);
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead || lead.clientId !== client.id)
    return Response.json({ error: "Not found" }, { status: 404 });

  await db.lead.update({ where: { id }, data: { status } });
  return Response.json({ ok: true });
}
