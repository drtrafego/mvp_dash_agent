import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (process.env.ZAIA_WEBHOOK_SECRET && secret !== process.env.ZAIA_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { agentId, session, message } = body;
  if (!agentId || !session || !message) return NextResponse.json({ ok: true });

  const client = await db.client.findUnique({ where: { zaiaAgentId: agentId } });
  if (!client) return NextResponse.json({ ok: true });

  const conv = await db.conversation.upsert({
    where: { clientId_contactPhone: { clientId: client.id, contactPhone: session.id } },
    create: {
      clientId: client.id,
      contactPhone: session.id,
      contactName: session.name,
      lastMessage: message.text?.slice(0, 100),
      lastMessageAt: new Date(message.timestamp),
    },
    update: {
      contactName: session.name,
      lastMessage: message.text?.slice(0, 100),
      lastMessageAt: new Date(message.timestamp),
      unreadCount: { increment: message.from === "user" ? 1 : 0 },
    },
  });

  await db.message.create({
    data: {
      conversationId: conv.id,
      direction: message.from === "user" ? "in" : "out",
      content: message.text || "[mídia]",
      sentBy: message.from === "agent" ? "bot" : "client",
      timestamp: new Date(message.timestamp),
    },
  });

  const leadKeywords = ["preço", "valor", "comprar", "contratar", "quanto", "plano"];
  if (message.from === "user" && leadKeywords.some((k) => message.text?.toLowerCase().includes(k))) {
    await db.lead.upsert({
      where: { clientId_phone: { clientId: client.id, phone: session.id } },
      create: { clientId: client.id, phone: session.id, name: session.name },
      update: {},
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
