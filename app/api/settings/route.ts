import { NextRequest } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { getUserClient } from "@/lib/db-helper";

export async function GET() {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getUserClient(user.id, user.primaryEmail);
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const settings = await db.client.findUnique({
    where: { id: client.id },
    select: { companyName: true, pauseMessage: true, attendantName: true, notifyEmail: true, plan: true },
  });

  return Response.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const user = await stackServerApp.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getUserClient(user.id, user.primaryEmail);
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  const { pauseMessage, attendantName, notifyEmail } = await req.json();

  await db.client.update({
    where: { id: client.id },
    data: {
      ...(pauseMessage !== undefined && { pauseMessage }),
      ...(attendantName !== undefined && { attendantName }),
      ...(notifyEmail !== undefined && { notifyEmail: notifyEmail || null }),
    },
  });

  return Response.json({ ok: true });
}
